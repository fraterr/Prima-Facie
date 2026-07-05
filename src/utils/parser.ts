import * as pdfjsLib from 'pdfjs-dist';
import ePub from 'epubjs';

// Setup pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

/* ===========================
   Types
   =========================== */

export interface AnnotatedSection {
  title: string;
  html: string;       // HTML with each word wrapped in <span class="w" data-wi="N">
  wordStart: number;   // first word index in this section
  wordEnd: number;     // last word index in this section
}

export interface ParsedDocument {
  sections: AnnotatedSection[];
  words: string[];
}

/* ===========================
   HTML Word Annotation
   =========================== */

/**
 * Takes raw HTML, parses it, walks all text nodes and wraps each word
 * in <span class="w" data-wi="N"> for click-to-seek and highlighting.
 * Returns the annotated HTML string and extracted words array.
 */
function annotateHTML(rawHtml: string, startIndex: number): {
  html: string;
  words: string[];
  title: string;
  nextIndex: number;
} {
  const parser = new DOMParser();
  // Use text/html (not application/xhtml+xml) for maximum tolerance
  const doc = parser.parseFromString(rawHtml, 'text/html');
  const body = doc.body;

  // Strip non-content elements
  body.querySelectorAll('script, style, link, meta, svg, noscript').forEach(el => el.remove());

  // Hide images (their src won't resolve outside the archive)
  body.querySelectorAll('img').forEach(el => {
    el.removeAttribute('src');
    el.style.display = 'none';
  });

  const words: string[] = [];
  let idx = startIndex;

  // Collect all text nodes first (modifying DOM while walking would corrupt the walker)
  const textNodes: Text[] = [];
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }

  for (const textNode of textNodes) {
    const text = textNode.textContent || '';
    if (!text.trim()) continue;

    const fragment = doc.createDocumentFragment();
    // Split keeping whitespace groups intact: "hello  world" -> ["hello", "  ", "world"]
    const parts = text.split(/(\s+)/);

    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        fragment.appendChild(doc.createTextNode(part));
      } else {
        const span = doc.createElement('span');
        span.className = 'w';
        span.dataset.wi = String(idx);
        span.textContent = part;
        fragment.appendChild(span);
        words.push(part);
        idx++;
      }
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  }

  // Extract section title from heading or <title>
  const titleEl = body.querySelector('h1, h2, h3') || doc.querySelector('title');
  const title = titleEl?.textContent?.trim() || '';

  return {
    html: body.innerHTML,
    words,
    title,
    nextIndex: idx,
  };
}

/* ===========================
   Utilities
   =========================== */

export function cleanText(text: string): string {
  let cleaned = text.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/^\s*\d+\s*$/gm, '');
  return cleaned.trim();
}

export function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(word => word.length > 0);
}

/* ===========================
   Plain Text → ParsedDocument
   =========================== */

export function parsePlainText(text: string): ParsedDocument {
  const cleaned = cleanText(text);
  const paragraphs = cleaned.split(/\n\n+/);

  // Build a simple HTML with <p> tags, then annotate
  const rawHtml = paragraphs
    .filter(p => p.trim())
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  const { html, words, title, nextIndex } = annotateHTML(rawHtml, 0);

  const section: AnnotatedSection = {
    title: title || 'Document',
    html,
    wordStart: 0,
    wordEnd: nextIndex - 1,
  };

  return { sections: [section], words };
}

/* ===========================
   PDF → ParsedDocument
   =========================== */

export async function parsePDF(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const sections: AnnotatedSection[] = [];
  const allWords: string[] = [];
  let wordIndex = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const items = textContent.items as any[];
    items.sort((a, b) => {
      if (Math.abs(a.transform[5] - b.transform[5]) > 5) {
        return b.transform[5] - a.transform[5];
      }
      return a.transform[4] - b.transform[4];
    });

    const pageText = items.map(item => item.str).join(' ');
    const rawHtml = `<p>${pageText}</p>`;
    const { html, words, nextIndex } = annotateHTML(rawHtml, wordIndex);

    if (words.length > 0) {
      sections.push({
        title: `Page ${i}`,
        html,
        wordStart: wordIndex,
        wordEnd: nextIndex - 1,
      });
      allWords.push(...words);
      wordIndex = nextIndex;
    }
  }

  return { sections, words: allWords };
}

/* ===========================
   EPUB → ParsedDocument
   =========================== */

export async function parseEPUB(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const book = ePub(arrayBuffer);
  await book.ready;

  // Access JSZip archive directly — most reliable way to get raw XHTML
  const archive = (book as any).archive;
  const zip = archive?.zip;
  if (!zip) throw new Error('Could not access EPUB archive.');

  // All file paths inside the ZIP (excluding directories)
  const archiveFiles = Object.keys(zip.files).filter(
    (f: string) => !zip.files[f].dir
  );

  // The OPF directory (e.g. "OEBPS/") — spine hrefs are relative to this
  const basePath: string = (book as any).path?.directory || '';

  // Also try to detect common base directories from the archive itself
  const commonPrefixes = [...new Set(
    archiveFiles
      .filter(f => f.includes('/'))
      .map(f => f.substring(0, f.indexOf('/') + 1))
  )];

  console.log('[EPUB] Archive files:', archiveFiles.length, 'Base path:', basePath, 'Prefixes:', commonPrefixes);

  // Collect spine items in reading order
  const spine = book.spine as any;
  const spineItems: any[] = [];
  if (typeof spine.each === 'function') {
    spine.each((item: any) => { if (item) spineItems.push(item); });
  } else {
    const items = spine.spineItems || spine.items || spine;
    for (let i = 0; i < (items.length || 0); i++) {
      const item = typeof spine.get === 'function' ? spine.get(i) : items[i];
      if (item) spineItems.push(item);
    }
  }

  console.log(`[EPUB] Found ${spineItems.length} spine items to process.`);

  /**
   * Resolves a spine item href to an actual file path in the ZIP.
   * Tries multiple strategies to handle different EPUB packaging styles.
   */
  const resolveZipPath = (item: any): string | null => {
    // Gather all possible href values from the item
    const hrefs: string[] = [];
    if (item.href) hrefs.push(item.href);
    if (item.canonical) hrefs.push(item.canonical);
    if (item.url && !item.url.startsWith('blob:')) hrefs.push(item.url);
    // Some EPUBs store the full path in idref via manifest lookup
    if (item.idref && (book as any).packaging?.manifest) {
      const manifest = (book as any).packaging.manifest;
      const manifestItem = manifest[item.idref];
      if (manifestItem?.href) hrefs.push(manifestItem.href);
    }

    for (let rawHref of hrefs) {
      if (!rawHref) continue;

      // Strip URL fragment if present (e.g., "chapter1.xhtml#section1")
      let href = rawHref.split('#')[0];
      
      // Decode URI components (e.g., "my%20chapter.xhtml" -> "my chapter.xhtml")
      try {
        href = decodeURIComponent(href);
      } catch (e) {
        // Fallback to raw if decode fails
      }

      // Strategy 1: basePath + href
      const withBase = basePath + href;
      if (zip.file(withBase)) return withBase;

      // Strategy 2: href as-is
      if (zip.file(href)) return href;

      // Strategy 3: try each common prefix
      for (const prefix of commonPrefixes) {
        const prefixed = prefix + href;
        if (zip.file(prefixed)) return prefixed;
      }

      // Strategy 4: match by filename (last segment)
      const filename = href.split('/').pop() || '';
      if (filename) {
        const match = archiveFiles.find(f => f.endsWith('/' + filename) || f === filename);
        if (match) return match;
      }

      // Strategy 5: partial path match (e.g. "Text/Section0001.xhtml" inside "OEBPS/Text/Section0001.xhtml")
      const partialMatch = archiveFiles.find(f => f.endsWith(href));
      if (partialMatch) return partialMatch;
    }

    return null;
  };

  const sections: AnnotatedSection[] = [];
  const allWords: string[] = [];
  let wordIndex = 0;
  let skippedCount = 0;

  for (let i = 0; i < spineItems.length; i++) {
    const item = spineItems[i];
    const href: string = item.href || item.idref || `item-${i}`;

    const resolvedPath = resolveZipPath(item);
    if (!resolvedPath) {
      console.warn(`[EPUB] Skipped item ${i} (${href}): no matching file in archive.`);
      skippedCount++;
      continue;
    }

    let rawXhtml = '';
    try {
      rawXhtml = await zip.file(resolvedPath).async('string');
    } catch (e) {
      console.warn(`[EPUB] Failed to read ${resolvedPath}:`, e);
      skippedCount++;
      continue;
    }

    if (!rawXhtml) {
      skippedCount++;
      continue;
    }

    // Annotate the XHTML: wrap each word in a span with data-wi index
    try {
      const { html, words, title, nextIndex } = annotateHTML(rawXhtml, wordIndex);

      if (words.length === 0) continue; // Empty section (cover image, etc.)

      sections.push({
        title: title || `Section ${sections.length + 1}`,
        html,
        wordStart: wordIndex,
        wordEnd: nextIndex - 1,
      });

      allWords.push(...words);
      wordIndex = nextIndex;
    } catch (e) {
      console.warn(`[EPUB] Failed to annotate ${resolvedPath}:`, e);
      skippedCount++;
    }
  }

  console.log(`[EPUB] Parsed ${sections.length} sections, ${allWords.length} words. Skipped: ${skippedCount}`);

  if (allWords.length === 0) {
    throw new Error('No readable text found in EPUB.');
  }

  return { sections, words: allWords };
}

