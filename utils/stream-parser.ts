export function extractNarrative(jsonString: string): string {
  // Try to find the "narrative" key
  const keyMatch = jsonString.match(/"narrative"\s*:\s*"/);
  if (!keyMatch) return '';

  const startIndex = keyMatch.index! + keyMatch[0].length;
  let result = '';
  let isEscaped = false;

  for (let i = startIndex; i < jsonString.length; i++) {
    const char = jsonString[i];

    if (isEscaped) {
      result += char;
      isEscaped = false;
      continue;
    }

    if (char === '\\') {
      isEscaped = true;
      continue;
    }

    if (char === '"') {
      // End of string
      break;
    }

    result += char;
  }

  // Handle common JSON escape sequences
  return result
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}
