const assert = require('node:assert/strict');
const {local, parseWiktionary, normalize, candidates, guess} = require('./articles.js');

assert.equal(local('Baum'), 'der');
assert.equal(local('Mädchen'), 'das');
assert.equal(local('Pizza'), 'die');
assert.equal(normalize('  Baum! '), 'baum');
assert.equal(parseWiktionary('{{Deutsch Substantiv Übersicht|Genus=m}}'), 'der');
assert.equal(parseWiktionary('{{Deutsch Substantiv Übersicht|Genus=f}}'), 'die');
assert.equal(parseWiktionary('{{Deutsch Substantiv Übersicht|Genus=n}}'), 'das');
assert.equal(parseWiktionary('kein Genus hier'), null);
assert.ok(candidates('Bäume').includes('Bäum'));
assert.ok(candidates('Welt-Raum').includes('Raum'));
assert.equal(guess('Freiheit'), 'die');
assert.equal(guess('Mädchen'), 'das');
assert.equal(guess('Schmetterling'), 'der');
console.log('PASS: local article lookup and Wiktionary gender parsing.');
