import React, { useCallback } from 'react';
import { parsePDF, parseEPUB, parsePlainText } from '../utils/parser';
import type { ParsedDocument } from '../utils/parser';

interface FileUploaderProps {
  onLoadDocument: (words: string[], sections: ParsedDocument['sections']) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onLoadDocument, isProcessing, setIsProcessing }) => {
  
  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      let doc: ParsedDocument;

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        doc = await parsePDF(file);
      } else if (file.type === 'application/epub+zip' || file.name.endsWith('.epub')) {
        doc = await parseEPUB(file);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
        doc = parsePlainText(text);
      } else {
        alert('Unsupported file type. Please upload a PDF, EPUB, or TXT file.');
        setIsProcessing(false);
        return;
      }
      
      if (doc.words.length === 0) {
        alert('No readable text found in file.');
      } else {
        onLoadDocument(doc.words, doc.sections);
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to parse file:\n\n' + (err.message || err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className="glass-panel file-dropzone"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input 
        id="file-upload" 
        type="file" 
        accept=".pdf,.epub,.txt" 
        style={{ display: 'none' }} 
        onChange={handleChange}
      />
      <div className="file-icon">📄</div>
      {isProcessing ? (
        <h3>Processing document...</h3>
      ) : (
        <>
          <h3>Drag & Drop a document here</h3>
          <p style={{ color: 'var(--text-muted)' }}>Supports PDF, EPUB, TXT</p>
        </>
      )}
    </div>
  );
};
