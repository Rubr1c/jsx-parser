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
  // Don't trim the whitespace to preserve exact text content
  const text = rawBuffer;
  if (!text) return null;

  // Start position is always the beginning of the buffer
  const startRow = bufferStartRow;
  const startCol = bufferStartCol;

  // Calculate where the actual text ends
  const { row: endRow, col: endCol } = advancePosition(
    startRow,
    startCol,
    text
  );

  return { text, startRow, startCol, endRow, endCol };
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
      if (buffer.length > 0) {
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
      }
      buffer = '';

      if (char === '<') {
        return stateTagStart(tokens, row, col + 1);
      }
      // char === null (EOF)
      return stateData(tokens, '', row, col);
    }

    if (buffer.length === 0) {
      bufferStartRow = row;
      bufferStartCol = col;
    }
    buffer += char;
    return stateData(tokens, buffer, bufferStartRow, bufferStartCol);
  };
}

function stateTagStart(
  tokens: Token[],
  tagStartRow: number,
  tagStartCol: number
): StateFn {
  return function (char, row, col) {
    if (char === null) {
      return stateData(tokens, '', row, col);
    }

    if (char === '/') {
      emit(
        tokens,
        'JSXClosingTagStart',
        '</',
        tagStartRow,
        tagStartCol - 1,
        col + 1
      );
      return stateTagName(tokens, '', row, col + 1);
    } else {
      emit(
        tokens,
        'JSXTagStart',
        '<',
        tagStartRow,
        tagStartCol - 1,
        tagStartCol
      );
      return stateTagName(tokens, char, row, col);
    }
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

    if (char === '/' || char === '>' || /\s/.test(char)) {
      if (buffer.length > 0) {
        emit(
          tokens,
          'JSXIdentifier',
          buffer,
          tagNameStartRow,
          tagNameStartCol,
          col
        );
        buffer = '';
      }

      if (char === '/') {
        return stateAwaitingSelfCloseEnd(tokens, row, col);
      } else if (char === '>') {
        emit(tokens, 'JSXTagEnd', '>', row, col, col + 1);
        return stateData(tokens, '', row, col + 1);
      } else if (/\s/.test(char)) {
        return stateInTagContents(tokens, row, col + 1);
      }
      return stateData(tokens, char, row, col);
    }

    if (/[a-zA-Z0-9_-]/.test(char)) {
      buffer += char;
      return stateTagName(tokens, buffer, tagNameStartRow, tagNameStartCol);
    }

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
    // Treat the unexpected char as starting data.
    return stateData(tokens, char, row, col);
  };
}

function stateInTagContents(
  tokens: Token[],
  _prevCharRow: number,
  _prevCharCol: number
): StateFn {
  return function (char, row, col) {
    if (char === null) {
      return stateData(tokens, '', row, col);
    }

    if (char === '/') {
      return stateAwaitingSelfCloseEnd(tokens, row, col);
    } else if (char === '>') {
      emit(tokens, 'JSXTagEnd', '>', row, col, col + 1);
      return stateData(tokens, '', row, col + 1);
    } else if (/\s/.test(char)) {
      return stateInTagContents(tokens, row, col + 1);
    } else {
      // TODO: This is where attribute parsing (e.g., attributeName="value") would begin.
      return stateData(tokens, char, row, col);
    }
  };
}

function stateAwaitingSelfCloseEnd(
  tokens: Token[],
  slashRow: number,
  slashCol: number
): StateFn {
  return function (char, row, col) {
    if (char === null) {
      emit(tokens, 'JSXText', '/', slashRow, slashCol, slashCol + 1);
      return stateData(tokens, '', row, col);
    }

    if (char === '>') {
      emit(tokens, 'JSXSelfClosing', '/>', slashRow, slashCol, col + 1);
      return stateData(tokens, '', row, col + 1);
    } else if (/\s/.test(char)) {
      return stateAwaitingSelfCloseEnd(tokens, slashRow, slashCol);
    } else {
      emit(tokens, 'JSXText', '/', slashRow, slashCol, slashCol + 1);
      return stateInTagContents(tokens, row, col);
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
