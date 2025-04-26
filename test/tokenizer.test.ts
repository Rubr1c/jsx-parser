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
  [
    'simple <div> tag',
    '<div>',
    [
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 0, colEnd: 1 },
      { type: 'JSXIdentifier', value: 'div', row: 0, colStart: 1, colEnd: 4 },
      { type: 'JSXTagEnd', value: '>', row: 0, colStart: 4, colEnd: 5 },
      { type: 'EOF', value: null, row: 0, colStart: 5, colEnd: 5 },
    ],
  ],
  [
    'text before tag',
    'A<div>',
    [
      { type: 'JSXText', value: 'A', row: 0, colStart: 0, colEnd: 1 },
      { type: 'JSXTagStart', value: '<', row: 0, colStart: 1, colEnd: 2 },
      { type: 'JSXIdentifier', value: 'div', row: 0, colStart: 2, colEnd: 5 },
      { type: 'JSXTagEnd', value: '>', row: 0, colStart: 5, colEnd: 6 },
      { type: 'EOF', value: null, row: 0, colStart: 6, colEnd: 6 },
    ],
  ],
];

describe('Tokenizer.tokenize inline FSM cases', () => {
  test.each(cases)('%s', (_desc, input, expected) => {
    const tokens = createTokenizer().tokenize(input);
    expect(tokens).toEqual(expected);
  });
});
