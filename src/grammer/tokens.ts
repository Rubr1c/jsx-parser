export enum TokenType {
  JSXTagStart = 'JSXTagStart',
  JSXTagEnd = 'JSXTagEnd',
  EOF = 'EOF',
}

export interface Token {
  type: TokenType;
  value: string | null;
  row: number;
  start: number;
  end: number;
}
