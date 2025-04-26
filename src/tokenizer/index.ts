import { Token, TokenType } from '../grammar/tokens.js';

type StateFn = (char: string | null, row: number, col: number) => StateFn;

// Helper to calculate row/col after traversing a string
function advancePosition(
  startRow: number,
  startCol: number,
  text: string
): { row: number; col: number } {
  let row = startRow;
  let col = startCol;
  for (const char of text) {
    if (char === '\n') {
      row++;
      col = 0;
    } else if (char !== '\r') {
      col++;
    }
  }
  return { row, col };
}

// Helper to find the trimmed text and its precise start/end positions
function calculateTextPositions(
  rawBuffer: string,
  bufferStartRow: number,
  bufferStartCol: number
): {
  text: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
} | null {
  const trimmedText = rawBuffer.trim();
  if (!trimmedText) return null;

  const leadingWhitespace = rawBuffer.match(/^\s*/)?.[0] ?? '';

  // Calculate where the actual text starts
  const { row: startRow, col: startCol } = advancePosition(
    bufferStartRow,
    bufferStartCol,
    leadingWhitespace
  );

  // Calculate where the actual text ends
  const { row: endRow, col: endCol } = advancePosition(
    startRow,
    startCol,
    trimmedText
  );

  return { text: trimmedText, startRow, startCol, endRow, endCol };
}

function emit(
  tokens: Token[],
  type: TokenType,
  value: string | null,
  row: number,
  colStart: number,
  colEnd: number
) {
  // Ensure colEnd is at least colStart + 1 for non-empty values, or colStart for empty
  const effectiveColEnd =
    value === null || value === '' ? colStart : Math.max(colEnd, colStart + 1);
  // Ensure colStart is not greater than colEnd
  const effectiveColStart = Math.min(colStart, effectiveColEnd);

  tokens.push({
    type,
    value,
    row,
    colStart: effectiveColStart,
    colEnd: effectiveColEnd,
  });
}

function stateData(
  tokens: Token[],
  buffer: string,
  bufferStartRow: number,
  bufferStartCol: number
): StateFn {
  return function (char, row, col) {
    // Handle '<' or EOF to potentially emit pending text
    if (char === null || char === '<') {
      // Calculate positions of the trimmed text within the buffer
      const textInfo = calculateTextPositions(
        buffer,
        bufferStartRow,
        bufferStartCol
      );

      if (textInfo) {
        // Emit JSXText using the calculated positions
        emit(
          tokens,
          'JSXText',
          textInfo.text,
          textInfo.startRow,
          textInfo.startCol,
          textInfo.endCol
        );
      }
      buffer = '';

      if (char === '<') {
        emit(tokens, 'JSXTagStart', '<', row, col, col + 1);
        return stateTagName(tokens, '', row, col + 1);
      } else {
        // char === null (EOF)
        return stateData(tokens, '', row, col);
      }
    }

    if (buffer.length === 0) {
      bufferStartRow = row;
      bufferStartCol = col;
    }
    buffer += char;
    return stateData(tokens, buffer, bufferStartRow, bufferStartCol);
  };
}

function stateTagName(
  tokens: Token[],
  buffer: string,
  tagNameStartRow: number,
  tagNameStartCol: number
): StateFn {
  return function (char, row, col) {
    if (char === null) {
      // EOF inside a tag name - potentially an error case, but emit what we have
      if (buffer.length > 0) {
        emit(
          tokens,
          'JSXIdentifier',
          buffer,
          tagNameStartRow,
          tagNameStartCol,
          col
        );
      }
      return stateTagName(tokens, '', row, col);
    }

    // If whitespace or end tag
    if (/\s|>/.test(char)) {
      emit(
        tokens,
        'JSXIdentifier',
        buffer,
        tagNameStartRow,
        tagNameStartCol,
        col
      );
      buffer = '';
      if (char === '>') {
        emit(tokens, 'JSXTagEnd', '>', row, col, col + 1);
        return stateData(tokens, '', row, col + 1);
      }
      return stateData(tokens, '', row, col + 1); // TODO: Handle attributes
    }

    // Append valid identifier characters
    if (/[a-zA-Z0-9_-]/.test(char)) {
      buffer += char;
      return stateTagName(tokens, buffer, tagNameStartRow, tagNameStartCol);
    } else {
      // For now, treat as end of tag name and transition
      emit(
        tokens,
        'JSXIdentifier',
        buffer,
        tagNameStartRow,
        tagNameStartCol,
        col
      );
      // What to do with the unexpected char? For now, assume it starts data state.
      return stateData(tokens, char, row, col); // Pass the char to data state
    }
  };
}

export class Tokenizer {
  tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let row = 0,
      col = 0;
    let state: StateFn = stateData(tokens, '', row, col);
    for (const char of input) {
      state = state(char, row, col);

      if (char === '\n') {
        row++;
        col = 0;
      } else if (char !== '\r') {
        col++;
      }
    }
    state(null, row, col);

    emit(tokens, 'EOF', null, row, col, col);
    return tokens;
  }
}

export function createTokenizer(): Tokenizer {
  return new Tokenizer();
}
