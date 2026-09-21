(function (root) {
  'use strict';
  const articles = ['der', 'die', 'das'];
  const normalize = angle => ((angle % 360) + 360) % 360;
  const segmentAt = angle => Math.floor(normalize(-angle + 15) / 30);
  const articleAt = angle => articles[segmentAt(angle) % 3];

  function destination(start, segment, turns, jitter = 0) {
    return start + turns * 360 + normalize(-segment * 30 + jitter - normalize(start));
  }

  function progress(t) {
    const a = .12, b = .45, c = 1 - b;
    const area = a / 2 + b - a + c / 3;
    if (t <= a) return t * t / (2 * a * area);
    if (t <= b) return (a / 2 + t - a) / area;
    return (a / 2 + b - a + c / 3 * (1 - (1 - (Math.min(t, 1) - b) / c) ** 3)) / area;
  }

  const api = {articles, normalize, segmentAt, articleAt, destination, progress};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KevinWheel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
