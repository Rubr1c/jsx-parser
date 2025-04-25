import { TokenType } from '../grammer/tokens';

export interface Token {
  type: string;
  value: string;
}
export class Tokenizer {
  createToken(type: TokenType, value: string | null) {}

  tokenize(input: string): Token[] {
    return [];
  }
}

export function createTokenizer(): Tokenizer {
  return new Tokenizer();
}
