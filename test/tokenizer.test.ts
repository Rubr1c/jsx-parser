import { createTokenizer } from '../src/tokenizer/index';
import { TokenType } from '../src/grammar/tokens';

const cases: Array<
  [
    string,
    string,
    Array<{
      type: TokenType;
      value: string | null;
      row: number;
      colStart: number;
      colEnd: number;
    }>
  ]
> = [
  // Basic opening tag
  [
    'simple opening tag',
    '<div>',
    [
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 0, colEnd: 1 },
      { type: 'JSXIdentifier', value: 'div', row: 0, colStart: 1, colEnd: 4 },
      { type: 'JSXTagEnd', value: '>', row: 0, colStart: 4, colEnd: 5 },
      { type: 'EOF', value: null, row: 0, colStart: 5, colEnd: 5 },
    ],
  ],
  // Basic closing tag
  [
    'simple closing tag',
    '</div>',
    [
      {
        type: 'JSXClosingTagStart',
        value: '</',
        row: 0,
        colStart: 0,
        colEnd: 2,
      },
      { type: 'JSXIdentifier', value: 'div', row: 0, colStart: 2, colEnd: 5 },
      { type: 'JSXTagEnd', value: '>', row: 0, colStart: 5, colEnd: 6 },
      { type: 'EOF', value: null, row: 0, colStart: 6, colEnd: 6 },
    ],
  ],
  // Self-closing tag without space
  [
    'self-closing tag without space',
    '<div/>',
    [
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 0, colEnd: 1 },
      { type: 'JSXIdentifier', value: 'div', row: 0, colStart: 1, colEnd: 4 },
      { type: 'JSXSelfClosing', value: '/>', row: 0, colStart: 4, colEnd: 6 },
      { type: 'EOF', value: null, row: 0, colStart: 6, colEnd: 6 },
    ],
  ],
  // Self-closing tag with space
  [
    'self-closing tag with space',
    '<div />',
    [
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 0, colEnd: 1 },
      { type: 'JSXIdentifier', value: 'div', row: 0, colStart: 1, colEnd: 4 },
      { type: 'JSXSelfClosing', value: '/>', row: 0, colStart: 5, colEnd: 7 },
      { type: 'EOF', value: null, row: 0, colStart: 7, colEnd: 7 },
    ],
  ],
  // Text content
  [
    'text content',
    'Hello <div>World</div>',
    [
      { type: 'JSXText', value: 'Hello ', row: 0, colStart: 0, colEnd: 6 },
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 6, colEnd: 7 },
      { type: 'JSXIdentifier', value: 'div', row: 0, colStart: 7, colEnd: 10 },
      { type: 'JSXTagEnd', value: '>', row: 0, colStart: 10, colEnd: 11 },
      { type: 'JSXText', value: 'World', row: 0, colStart: 11, colEnd: 16 },
      {
        type: 'JSXClosingTagStart',
        value: '</',
        row: 0,
        colStart: 16,
        colEnd: 18,
      },
      { type: 'JSXIdentifier', value: 'div', row: 0, colStart: 18, colEnd: 21 },
      { type: 'JSXTagEnd', value: '>', row: 0, colStart: 21, colEnd: 22 },
      { type: 'EOF', value: null, row: 0, colStart: 22, colEnd: 22 },
    ],
  ],
  // Multiple lines
  [
    'multiple lines',
    '<div>\n  Hello\n</div>',
    [
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 0, colEnd: 1 },
      { type: 'JSXIdentifier', value: 'div', row: 0, colStart: 1, colEnd: 4 },
      { type: 'JSXTagEnd', value: '>', row: 0, colStart: 4, colEnd: 5 },
      { type: 'JSXText', value: '\n  Hello\n', row: 0, colStart: 5, colEnd: 6 },
      {
        type: 'JSXClosingTagStart',
        value: '</',
        row: 2,
        colStart: 0,
        colEnd: 2,
      },
      { type: 'JSXIdentifier', value: 'div', row: 2, colStart: 2, colEnd: 5 },
      { type: 'JSXTagEnd', value: '>', row: 2, colStart: 5, colEnd: 6 },
      { type: 'EOF', value: null, row: 2, colStart: 6, colEnd: 6 },
    ],
  ],
  // Attributes
  [
    'tag with attribute',
    '<div id="main">',
    [
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 0, colEnd: 1 },
      { type: 'JSXIdentifier', value: 'div', row: 0, colStart: 1, colEnd: 4 },
      { type: 'JSXAttributeKey', value: 'id', row: 0, colStart: 5, colEnd: 7 },
      {
        type: 'JSXAttributeEquals',
        value: '=',
        row: 0,
        colStart: 7,
        colEnd: 8,
      },
      {
        type: 'JSXAttributeValue',
        value: 'main',
        row: 0,
        colStart: 8,
        colEnd: 14,
      },
      { type: 'JSXTagEnd', value: '>', row: 0, colStart: 14, colEnd: 15 },
      { type: 'EOF', value: null, row: 0, colStart: 15, colEnd: 15 },
    ],
  ],
  [
    'tag with multiple attributes',
    '<input type="text" id="username" />',
    [
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 0, colEnd: 1 },
      { type: 'JSXIdentifier', value: 'input', row: 0, colStart: 1, colEnd: 6 },
      {
        type: 'JSXAttributeKey',
        value: 'type',
        row: 0,
        colStart: 7,
        colEnd: 11,
      },
      {
        type: 'JSXAttributeEquals',
        value: '=',
        row: 0,
        colStart: 11,
        colEnd: 12,
      },
      {
        type: 'JSXAttributeValue',
        value: 'text',
        row: 0,
        colStart: 12,
        colEnd: 18,
      },
      {
        type: 'JSXAttributeKey',
        value: 'id',
        row: 0,
        colStart: 19,
        colEnd: 21,
      },
      {
        type: 'JSXAttributeEquals',
        value: '=',
        row: 0,
        colStart: 21,
        colEnd: 22,
      },
      {
        type: 'JSXAttributeValue',
        value: 'username',
        row: 0,
        colStart: 22,
        colEnd: 32,
      },
      { type: 'JSXSelfClosing', value: '/>', row: 0, colStart: 33, colEnd: 35 },
      { type: 'EOF', value: null, row: 0, colStart: 35, colEnd: 35 },
    ],
  ],
  // Self-closing tag with newlines
  [
    'self-closing tag with newlines',
    '<div>\n    <Cold figga="tigga" />\n</div>',
    [
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 0, colEnd: 1 },
      { type: 'JSXIdentifier', value: 'div', row: 0, colStart: 1, colEnd: 4 },
      { type: 'JSXTagEnd', value: '>', row: 0, colStart: 4, colEnd: 5 },
      { type: 'JSXTagStart', value: '<', row: 1, colStart: 4, colEnd: 5 },
      { type: 'JSXIdentifier', value: 'Cold', row: 1, colStart: 5, colEnd: 9 },
      {
        type: 'JSXAttributeKey',
        value: 'figga',
        row: 1,
        colStart: 10,
        colEnd: 15,
      },
      {
        type: 'JSXAttributeEquals',
        value: '=',
        row: 1,
        colStart: 15,
        colEnd: 16,
      },
      {
        type: 'JSXAttributeValue',
        value: 'tigga',
        row: 1,
        colStart: 16,
        colEnd: 23,
      },
      { type: 'JSXSelfClosing', value: '/>', row: 1, colStart: 24, colEnd: 26 },
      {
        type: 'JSXClosingTagStart',
        value: '</',
        row: 2,
        colStart: 0,
        colEnd: 2,
      },
      { type: 'JSXIdentifier', value: 'div', row: 2, colStart: 2, colEnd: 5 },
      { type: 'JSXTagEnd', value: '>', row: 2, colStart: 5, colEnd: 6 },
      { type: 'EOF', value: null, row: 2, colStart: 6, colEnd: 6 },
    ],
  ],
  // Single quoted attributes
  [
    'single quoted attributes',
    "<input type='text' id='username' />",
    [
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 0, colEnd: 1 },
      { type: 'JSXIdentifier', value: 'input', row: 0, colStart: 1, colEnd: 6 },
      {
        type: 'JSXAttributeKey',
        value: 'type',
        row: 0,
        colStart: 7,
        colEnd: 11,
      },
      {
        type: 'JSXAttributeEquals',
        value: '=',
        row: 0,
        colStart: 11,
        colEnd: 12,
      },
      {
        type: 'JSXAttributeValue',
        value: 'text',
        row: 0,
        colStart: 12,
        colEnd: 18,
      },
      {
        type: 'JSXAttributeKey',
        value: 'id',
        row: 0,
        colStart: 19,
        colEnd: 21,
      },
      {
        type: 'JSXAttributeEquals',
        value: '=',
        row: 0,
        colStart: 21,
        colEnd: 22,
      },
      {
        type: 'JSXAttributeValue',
        value: 'username',
        row: 0,
        colStart: 22,
        colEnd: 32,
      },
      { type: 'JSXSelfClosing', value: '/>', row: 0, colStart: 33, colEnd: 35 },
      { type: 'EOF', value: null, row: 0, colStart: 35, colEnd: 35 },
    ],
  ],
  // Mixed quotes in attributes
  [
    'mixed quotes in attributes',
    '<div class="main" data-value=\'{"key": "value"}\' />',
    [
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 0, colEnd: 1 },
      { type: 'JSXIdentifier', value: 'div', row: 0, colStart: 1, colEnd: 4 },
      {
        type: 'JSXAttributeKey',
        value: 'class',
        row: 0,
        colStart: 5,
        colEnd: 10,
      },
      {
        type: 'JSXAttributeEquals',
        value: '=',
        row: 0,
        colStart: 10,
        colEnd: 11,
      },
      {
        type: 'JSXAttributeValue',
        value: 'main',
        row: 0,
        colStart: 11,
        colEnd: 17,
      },
      {
        type: 'JSXAttributeKey',
        value: 'data-value',
        row: 0,
        colStart: 18,
        colEnd: 28,
      },
      {
        type: 'JSXAttributeEquals',
        value: '=',
        row: 0,
        colStart: 28,
        colEnd: 29,
      },
      {
        type: 'JSXAttributeValue',
        value: '{"key": "value"}',
        row: 0,
        colStart: 29,
        colEnd: 47,
      },
      { type: 'JSXSelfClosing', value: '/>', row: 0, colStart: 48, colEnd: 50 },
      { type: 'EOF', value: null, row: 0, colStart: 50, colEnd: 50 },
    ],
  ],
  // JSX Expressions in Attributes
  [
    'attribute with simple js expression',
    '<div onClick={handleClick}>',
    [
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 0, colEnd: 1 },
      { type: 'JSXIdentifier', value: 'div', row: 0, colStart: 1, colEnd: 4 },
      {
        type: 'JSXAttributeKey',
        value: 'onClick',
        row: 0,
        colStart: 5,
        colEnd: 12,
      },
      {
        type: 'JSXAttributeEquals',
        value: '=',
        row: 0,
        colStart: 12,
        colEnd: 13,
      },
      {
        type: 'JSXJavaScriptExpression',
        value: 'handleClick',
        row: 0,
        colStart: 13,
        colEnd: 26,
      },
      { type: 'JSXTagEnd', value: '>', row: 0, colStart: 26, colEnd: 27 },
      { type: 'EOF', value: null, row: 0, colStart: 27, colEnd: 27 },
    ],
  ],
  [
    'attribute with object expression',
    '<div style={{ color: "red", fontSize: 12 }}>',
    [
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 0, colEnd: 1 },
      { type: 'JSXIdentifier', value: 'div', row: 0, colStart: 1, colEnd: 4 },
      {
        type: 'JSXAttributeKey',
        value: 'style',
        row: 0,
        colStart: 5,
        colEnd: 10,
      },
      {
        type: 'JSXAttributeEquals',
        value: '=',
        row: 0,
        colStart: 10,
        colEnd: 11,
      },
      {
        type: 'JSXJavaScriptExpression',
        value: '{ color: "red", fontSize: 12 }',
        row: 0,
        colStart: 11,
        colEnd: 43,
      },
      { type: 'JSXTagEnd', value: '>', row: 0, colStart: 43, colEnd: 44 },
      { type: 'EOF', value: null, row: 0, colStart: 44, colEnd: 44 },
    ],
  ],
  [
    'attribute with function call expression',
    '<div onUpdate={() => console.log("updated")}>',
    [
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 0, colEnd: 1 },
      { type: 'JSXIdentifier', value: 'div', row: 0, colStart: 1, colEnd: 4 },
      {
        type: 'JSXAttributeKey',
        value: 'onUpdate',
        row: 0,
        colStart: 5,
        colEnd: 13,
      },
      {
        type: 'JSXAttributeEquals',
        value: '=',
        row: 0,
        colStart: 13,
        colEnd: 14,
      },
      {
        type: 'JSXJavaScriptExpression',
        value: '() => console.log("updated")',
        row: 0,
        colStart: 14,
        colEnd: 44,
      },
      { type: 'JSXTagEnd', value: '>', row: 0, colStart: 44, colEnd: 45 },
      { type: 'EOF', value: null, row: 0, colStart: 45, colEnd: 45 },
    ],
  ],
  [
    'self-closing tag with js expression attribute',
    "<MyComponent data={processData({ type: 'user' })} />",
    [
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 0, colEnd: 1 },
      {
        type: 'JSXIdentifier',
        value: 'MyComponent',
        row: 0,
        colStart: 1,
        colEnd: 12,
      },
      {
        type: 'JSXAttributeKey',
        value: 'data',
        row: 0,
        colStart: 13,
        colEnd: 17,
      },
      {
        type: 'JSXAttributeEquals',
        value: '=',
        row: 0,
        colStart: 17,
        colEnd: 18,
      },
      {
        type: 'JSXJavaScriptExpression',
        value: "processData({ type: 'user' })",
        row: 0,
        colStart: 18,
        colEnd: 49,
      },
      { type: 'JSXSelfClosing', value: '/>', row: 0, colStart: 50, colEnd: 52 },
      { type: 'EOF', value: null, row: 0, colStart: 52, colEnd: 52 },
    ],
  ],
];

describe('Tokenizer.tokenize', () => {
  test.each(cases)('%s', (_desc, input, expected) => {
    const tokens = createTokenizer().tokenize(input);
    expect(tokens).toEqual(expected);
  });
});
