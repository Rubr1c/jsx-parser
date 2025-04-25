import { readFileSync } from 'fs';
import { createTokenizer } from '../src/tokenizer/index.js';

const src = readFileSync('test/fixtures/simple.jsx', 'utf8');
const tokens = createTokenizer().tokenize(src);
console.log(tokens);
