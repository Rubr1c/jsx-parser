import { Token, TokenType } from '../grammar/tokens.js';

type StateFn = (char: string) => StateFn;

function emit(
  tokens: Token[],
  type: TokenType,
  value: string | null,
  row: number,
  colStart: number,
  colEnd: number
) {
  tokens.push({ type, value, row, colStart, colEnd });
}

function stateData(
  tokens: Token[],
  row: number,
  col: number,
  buffer: string
): StateFn {
  return function (char) {
    if (char === '<') {
      if (buffer.length > 0) {
        emit(tokens, 'JSXText', buffer, row, col - buffer.length, col);
        buffer = '';
      }
      emit(tokens, 'JSXTagStart', '<', row, col, col + 1);
      return stateTagName(tokens, row, col + 1, '');
    }
    buffer += char;
    return stateData(tokens, row, col + 1, buffer);
  };
}

function stateTagName(
  tokens: Token[],
  row: number,
  col: number,
  buffer: string
): StateFn {
  return function (char) {
    // if whitespace or end tag
    if (/\s|>/.test(char)) {
      emit(tokens, 'JSXIdentifier', buffer, row, col - buffer.length, col);
      if (char === '>') {
        emit(tokens, 'JSXTagEnd', '>', row, col, col + 1);
        return stateData(tokens, row, col + 1, '');
      }
      return stateData(tokens, row, col + 1, '');
    }
    buffer += char;
    return stateTagName(tokens, row, col + 1, buffer);
  };
}

export class Tokenizer {
  tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let row = 0,
      col = 0;
    let state: StateFn = stateData(tokens, row, col, '');
    for (const char of input) {
      state = state(char);
      if (char === '\n') {
        row++;
        col = 0;
      } else {
        col++;
      }
    }
    emit(tokens, 'EOF', null, row, col, col);
    return tokens;
  }
}

export function createTokenizer(): Tokenizer {
  return new Tokenizer();
}
