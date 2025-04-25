import { Token, TokenType } from '../grammer/tokens.js';

export class Tokenizer {
  createToken(
    type: TokenType,
    value: string | null,
    row: number,
    start: number,
    end: number
  ): Token {
    return { type, value, row, start, end };
  }

  tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let row: number = 0;
    let col: number = 0;
    for (const char of input) {
      let token: Token = this.createToken(
        TokenType.EOF,
        null,
        row,
        col,
        col + 1
      );
      switch (char) {
        case '<':
          token.type = TokenType.JSXTagStart;
          tokens.push(token);
          break;
        case '>':
          token.type = TokenType.JSXTagEnd;
          tokens.push(token)
        case '\n':
          row++;
          break;
      }
      col++;
    }
    return tokens;
  }
}

export function createTokenizer(): Tokenizer {
  return new Tokenizer();
}
