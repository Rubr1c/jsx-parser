export type TokenType =
  | 'JSXTagStart'
  | 'JSXTagEnd'
  | 'JSXSelfClosing'
  | 'JSXClosingTagStart'
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
