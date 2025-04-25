import { readFileSync } from 'fs';
import { createTokenizer } from '../src/tokenizer/index';

test('tokenizes simple JSX', () => {
  const src = readFileSync('test/fixtures/simple.jsx', 'utf8');
  const tokens = createTokenizer().tokenize(src);

  const expected = [
    { type: 'JSXTagStart', value: null, row: 0, start: 0, end: 1 },
    { type: 'JSXTagEnd', value: null, row: 0, start: 1, end: 2 }
  ];

  expect(tokens).toEqual(expected);
});
