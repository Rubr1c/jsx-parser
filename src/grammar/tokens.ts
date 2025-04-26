export type TokenType =
  | 'JSXTagStart'
  | 'JSXTagEnd'
  | 'JSXIdentifier'
  | 'JSXText'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string | null;
  row: number;
  colStart: number;
  colEnd: number;
}
