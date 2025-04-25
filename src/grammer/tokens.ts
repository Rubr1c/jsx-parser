export enum TokenType {
  JSXTagStart = 'JSXTagStart',
  JSXTagEnd = 'JSXTagEnd',
  JSXTagSelfClose = 'JSXTagSelfClose',
}

export interface Token {
  type: TokenType;
  value: string | null;
}
