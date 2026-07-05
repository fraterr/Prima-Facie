/**
 * Calculates the Optimal Recognition Point (ORP) index for a given word.
 * The ORP is usually slightly to the left of the center of the word.
 */
export function calculateORP(word: string): number {
  // Strip punctuation for length calculation to be accurate
  const cleanWord = word.replace(/[.,!?;:]/g, '');
  const length = cleanWord.length;
  
  if (length === 0) return 0;
  if (length === 1) return 0;
  if (length === 2) return 0;
  if (length === 3) return 1;
  if (length <= 5) return 1;
  if (length <= 7) return 2;
  if (length <= 9) return 3;
  if (length <= 11) return 4;
  return 5;
}

/**
 * Calculates the delay multiplier based on the punctuation at the end of a word.
 * Returns a number (e.g., 1 for no delay, 1.8 for comma, 2.5 for period).
 */
export function getDelayMultiplier(word: string): number {
  if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
    return 2.5;
  }
  if (word.endsWith(',') || word.endsWith(';') || word.endsWith(':')) {
    return 1.8;
  }
  if (word.includes('\n')) {
    return 2.5;
  }
  return 1.0;
}
