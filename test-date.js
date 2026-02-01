import { parseAndFormatDate } from './src/utils/dateUtils.js';

console.log("Testing parseAndFormatDate:");
console.log("Input: 28 जन॰ 2026, 7:58 pm");
console.log("Output:", parseAndFormatDate("28 जन॰ 2026, 7:58 pm"));
console.log();

console.log("Input: 28 जन 2026, 7:58 pm");
console.log("Output:", parseAndFormatDate("28 जन 2026, 7:58 pm"));
console.log();

console.log("Input: 28 जनवरी 2026, 7:58 pm");
console.log("Output:", parseAndFormatDate("28 जनवरी 2026, 7:58 pm"));
