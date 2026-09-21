(function (root) {
  'use strict';
  const words = {
    baum:'der', bäume:'der', tisch:'der', stuhl:'der', hund:'der', kater:'der', mann:'der', junge:'der', vater:'der', bruder:'der', tag:'der', montag:'der', sommer:'der', winter:'der', regen:'der', schnee:'der', wind:'der', himmel:'der', mond:'der', stern:'der', computer:'der', bildschirm:'der', schlüssel:'der', ball:'der', apfel:'der', kuchen:'der', käse:'der', kaffee:'der', tee:'der', film:'der', zug:'der', bus:'der', weg:'der', berg:'der', fluss:'der', see:'der', garten:'der', schuh:'der', finger:'der', kopf:'der', bauch:'der', arm:'der', fuß:'der', mund:'der', zahn:'der', name:'der', artikel:'der', fehler:'der', satz:'der', text:'der', löffel:'der', besen:'der', vogel:'der', fisch:'der', löwe:'der', elefant:'der',
    frau:'die', mutter:'die', schwester:'die', tochter:'die', oma:'die', katze:'die', maus:'die', ente:'die', kuh:'die', blume:'die', sonne:'die', welt:'die', zeit:'die', nacht:'die', woche:'die', stunde:'die', minute:'die', schule:'die', klasse:'die', arbeit:'die', frage:'die', antwort:'die', sprache:'die', grammatik:'die', chance:'die', tür:'die', wand:'die', lampe:'die', uhr:'die', tasche:'die', flasche:'die', pizza:'die', banane:'die', tomate:'die', kartoffel:'die', suppe:'die', straße:'die', stadt:'die', brücke:'die', insel:'die', familie:'die', hand:'die', nase:'die', idee:'die', musik:'die', party:'die', rakete:'die', wolke:'die',
    haus:'das', auto:'das', kind:'das', baby:'das', mädchen:'das', buch:'das', wort:'das', rad:'das', glücksrad:'das', wissen:'das', ding:'das', feld:'das', bild:'das', fenster:'das', zimmer:'das', bett:'das', handy:'das', telefon:'das', internet:'das', spiel:'das', geld:'das', wasser:'das', bier:'das', brot:'das', ei:'das', obst:'das', fleisch:'das', wetter:'das', feuer:'das', licht:'das', jahr:'das', problem:'das', ende:'das', chaos:'das', ufo:'das', monster:'das', tier:'das', pferd:'das', schaf:'das', schwein:'das', auge:'das', ohr:'das', bein:'das', herz:'das', leben:'das', land:'das', meer:'das', kino:'das', radio:'das', mikrofon:'das'
  };
  const normalize = word => word.trim().toLocaleLowerCase('de-DE').replace(/^[^\p{L}]+|[^\p{L}-]+$/gu, '');
  const genderToArticle = gender => ({m:'der',f:'die',n:'das'})[String(gender || '').toLowerCase().charAt(0)] || null;
  const local = word => words[normalize(word)] || null;
  const capitalize = word => word.charAt(0).toLocaleUpperCase('de-DE') + word.slice(1);
  function candidates(word) {
    const cleaned = normalize(word);
    const values = new Set([cleaned, capitalize(cleaned)]);
    const lastPart = cleaned.split('-').at(-1);
    values.add(lastPart);
    values.add(capitalize(lastPart));
    const stems = [
      cleaned.replace(/(en|ern|er|e|s)$/u,''),
      cleaned.replace(/(chen|lein)$/u,''),
      lastPart.replace(/(en|ern|er|e|s)$/u,'')
    ];
    stems.filter(stem => stem.length > 2).forEach(stem => values.add(capitalize(stem)));
    return [...values].filter(Boolean);
  }
  function guess(word) {
    const lower = normalize(word);
    if (/(ung|heit|keit|schaft|ion|tät|ik|ie|ei|ur|anz|enz|age|ade|ette|ine)$/u.test(lower)) return 'die';
    if (/(chen|lein|ment|um|ma|nis|tum|zeug)$/u.test(lower)) return 'das';
    if (/(ling|ismus|or|ist|us|eur|är)$/u.test(lower)) return 'der';
    return null;
  }
  function parseWiktionary(wikitext) {
    if (typeof wikitext !== 'string') return null;
    const match = wikitext.match(/\|\s*Genus(?:\s*[0-9])?\s*=\s*([mfn])\b/i);
    return genderToArticle(match?.[1]);
  }
  const api = {normalize, local, parseWiktionary, genderToArticle, candidates, guess};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KevinArticles = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
