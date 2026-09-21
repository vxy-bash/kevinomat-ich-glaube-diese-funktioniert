'use strict';
const {articles, normalize, segmentAt, articleAt, destination, progress} = KevinWheel;
const {normalize: normalizeWord, local: localArticle, parseWiktionary, candidates, guess} = KevinArticles;
const $ = id => document.getElementById(id);
const wheel = $('wheel');
const spinButton = $('spin');
const colors = ['#ff8fae', '#f6d879', '#81dacb'];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let angle = 0, running = false, audio, spins = 0, secretWord = '';
let pointerAnimation;
const history = [];

function randomInt(limit) {
  const value = new Uint32Array(1);
  const ceiling = Math.floor(4294967296 / limit) * limit;
  do { crypto.getRandomValues(value); } while (value[0] >= ceiling);
  return value[0] % limit;
}

function svgElement(tag, attributes, content) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
  if (content) el.textContent = content;
  return el;
}

function point(degrees, radius) {
  const radians = (degrees - 90) * Math.PI / 180;
  return [250 + Math.cos(radians) * radius, 250 + Math.sin(radians) * radius];
}

for (let i = 0; i < 12; i++) {
  const start = point(i * 30 - 15, 248), end = point(i * 30 + 15, 248);
  wheel.append(svgElement('path', {d:`M250 250 L${start} A248 248 0 0 1 ${end} Z`, fill:colors[i % 3], stroke:'#151222', 'stroke-width':2}));
  const text = point(i * 30, 181);
  wheel.append(svgElement('text', {x:text[0],y:text[1],fill:'#211a30','font-family':'Arial, sans-serif','font-size':25,'font-weight':900,'text-anchor':'middle','dominant-baseline':'middle',transform:`rotate(${i * 30},${text[0]},${text[1]})`}, articles[i % 3]));
  const pip = point(i * 30, 230);
  wheel.append(svgElement('circle', {cx:pip[0],cy:pip[1],r:4,fill:'#211a30',opacity:.45}));
}

function unlockAudio() {
  try {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    if (!audio) audio = new Context();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
  } catch { audio = undefined; }
}

function tone(frequency, duration = .06, delay = 0, type = 'triangle', endFrequency = frequency, volume = .065) {
  if (!audio || audio.state !== 'running') return;
  const oscillator = audio.createOscillator(), gain = audio.createGain(), start = audio.currentTime + delay;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency,start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(1,endFrequency),start + duration);
  gain.gain.setValueAtTime(.0001,start);
  gain.gain.exponentialRampToValueAtTime(volume,start + .008);
  gain.gain.exponentialRampToValueAtTime(.0001,start + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(start); oscillator.stop(start + duration + .02);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
}

function shake() {
  if (reducedMotion.matches) return;
  document.body.animate([{transform:'translate(0)'},{transform:'translate(6px,-4px)'},{transform:'translate(-7px,5px)'},{transform:'translate(0)'}], {duration:160,iterations:2,easing:'linear'});
}

function spawn(glyphs, count) {
  if (reducedMotion.matches) return;
  const layer = $('effects');
  for (let i = 0; i < count; i++) {
    const item = document.createElement('span');
    item.className = 'particle goofy';
    item.textContent = glyphs[randomInt(glyphs.length)];
    item.style.cssText = `--left:${randomInt(101)}%;--top:${42 + randomInt(44)}%;--size:${18 + randomInt(46)}px;--dx:${randomInt(801)-400}px;--dy:${-120-randomInt(700)}px;--turn:${randomInt(1440)-720}deg;--delay:${randomInt(240)}ms`;
    layer.append(item);
    setTimeout(() => item.remove(),2500);
  }
}

function flash(color) {
  if (reducedMotion.matches) return;
  const light = document.createElement('div');
  light.className = 'flash'; light.style.background = color;
  $('effects').append(light); setTimeout(() => light.remove(),340);
}

function banner(article, color) {
  const banner = document.createElement('div');
  banner.className = 'banner';
  banner.textContent = `${article.toUpperCase()} WURDE AUSERWÄHLT`;
  banner.style.setProperty('--banner',color);
  $('effects').append(banner); setTimeout(() => banner.remove(),1800);
}

function ufo() {
  const ship = document.createElement('div');
  ship.className = 'ufo'; ship.textContent = '🛸';
  $('effects').append(ship); setTimeout(() => ship.remove(),2500);
}

function tick() {
  tone(360,.025,0,'square',160,.04);
  if (reducedMotion.matches) return;
  pointerAnimation?.cancel();
  pointerAnimation = $('pointer').animate([{transform:'translateX(-50%) rotate(-20deg)'},{transform:'translateX(-50%) rotate(0deg)'}],{duration:100,easing:'ease-out'});
}

function record(article) {
  history.unshift(article); history.splice(10);
  $('history').replaceChildren(...history.map(word => {
    const chip = document.createElement('li');
    chip.textContent = word;
    chip.style.setProperty('--chip',colors[articles.indexOf(word)]);
    return chip;
  }));
}

function finish() {
  angle = normalize(angle);
  wheel.style.transform = `rotate(${angle}deg)`;
  const article = articleAt(angle), index = articles.indexOf(article);
  running = false;
  document.body.classList.remove('spinning');
  spinButton.disabled = false;
  $('spinLabel').textContent = 'Nochmal drehst Ding';
  $('resultLabel').textContent = 'Rad haben entschieden';
  $('result').textContent = article;
  $('result').style.color = colors[index];
  $('quip').textContent = ['Kevin hat sein der gefunden.','Grammatik haben kurz geschlafen.','Das Ding war sehr wissenschaftlich gewesen.'][index];
  $('stageText').textContent = `Zeiger sagt ${article}. Diskussion sind vorbei.`;
  spins++; $('count').textContent = `${spins} Spin ist`;
  record(article);
  [392,523,659,784,1047].forEach((note,i) => tone(note,.2,i*.09,'triangle',note,.08));
  [380,470,340].forEach((note,i) => tone(note,.12,.4+i*.07,'square',note*.72,.07));
  spawn(['🦆','🧀','🗿','🍌','🤡','🪩','💀','🎰','🛸','🐸','🍕','⚡','💥'],92);
  flash(colors[index]); banner(article,colors[index]); ufo(); shake();
  document.body.classList.add('disco'); setTimeout(() => document.body.classList.remove('disco'),1900);
}

function spin(forcedArticle = null) {
  if (running) return;
  unlockAudio();
  running = true; spinButton.disabled = true;
  document.body.classList.add('spinning');
  $('spinLabel').textContent = 'Schicksal laden falsch …';
  $('resultLabel').textContent = 'Universum bitte nicht stören';
  $('result').textContent = '…'; $('result').style.color = 'var(--purple)';
  $('quip').textContent = 'Kevin haben Kontrolle abgegeben.';
  $('stageText').textContent = 'Anschnallen. Artikel fliegen bald.';
  const duration = 5600;
  const from = angle;
  const targetSegments = forcedArticle ? [0,3,6,9].map(segment => segment + articles.indexOf(forcedArticle)) : null;
  const target = targetSegments ? targetSegments[randomInt(targetSegments.length)] : randomInt(12);
  const to = destination(from,target,8,randomInt(17)-8);
  let started, lastSegment = segmentAt(angle);
  tone(130,.25,0,'sine',520,.08);
  function frame(now) {
    if (started === undefined) started = now;
    const t = Math.min((now-started)/duration,1);
    angle = from + (to-from)*progress(t);
    wheel.style.transform = `rotate(${angle}deg)`;
    const currentSegment = segmentAt(angle);
    if (currentSegment !== lastSegment) { tick(); lastSegment = currentSegment; }
    if (t < 1) requestAnimationFrame(frame); else { angle = to; finish(); }
  }
  requestAnimationFrame(frame);
}

async function wiktionaryArticle(word) {
  const controller = new AbortController();
  const deadline = setTimeout(() => controller.abort(),6500);
  try {
    for (const page of candidates(word)) {
      const url = `https://de.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json&origin=*`;
      const response = await fetch(url,{signal:controller.signal});
      const data = await response.json();
      const article = parseWiktionary(data?.parse?.wikitext?.['*']);
      if (article) return article;
    }
  } catch {} finally { clearTimeout(deadline); }
  return null;
}

async function spinFromSecretWord() {
  const word = normalizeWord(secretWord);
  secretWord = '';
  if (!word || running) { spin(); return; }
  let article = localArticle(word);
  if (!article) article = await wiktionaryArticle(word);
  if (!article) article = guess(word);
  spin(article);
}

spinButton.addEventListener('click',spinFromSecretWord);
document.addEventListener('keydown',event => {
  if (['SELECT','INPUT','TEXTAREA'].includes(event.target.tagName) || event.target.isContentEditable) return;
  if (event.key === 'Escape') { secretWord = ''; return; }
  if (event.key === 'Backspace' && secretWord) { secretWord = secretWord.slice(0,-1); return; }
  if (event.code === 'Space') { event.preventDefault(); spinFromSecretWord(); return; }
  if (event.key.length === 1 && /[\p{L}-]/u.test(event.key)) secretWord += event.key;
});
