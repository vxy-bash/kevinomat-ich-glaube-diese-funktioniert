const assert = require('node:assert/strict');
const {articles, segmentAt, articleAt, destination, progress} = require('./wheel.js');

for (const start of [0, 17, 188.5, 359, 2314]) {
  for (let segment = 0; segment < 12; segment++) {
    for (const jitter of [-8, 0, 8]) {
      const end = destination(start, segment, 8, jitter);
      assert.equal(segmentAt(end), segment, 'Pointer must land inside chosen segment');
      assert.equal(articleAt(end), articles[segment % 3]);
      assert.ok(end - start >= 8 * 360, 'At least eight full turns');
    }
  }
}
assert.equal(articleAt(0), 'der');
assert.equal(articleAt(30), 'das');
assert.equal(articleAt(60), 'die');
assert.equal(progress(0), 0);
assert.equal(progress(1), 1);
let previous = 0;
for (let frame = 1; frame <= 360; frame++) {
  const current = progress(frame / 360);
  assert.ok(current >= previous && current <= 1);
  previous = current;
}
const step = 1 / 360;
assert.ok(progress(.8 + step) - progress(.8) > progress(.95 + step) - progress(.95), 'Wheel visibly decelerates');
console.log('PASS: 180 landing cases, pointer/article mapping, 360 animation frames and deceleration.');
