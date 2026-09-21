'use strict';
const {articles, normalize, segmentAt, articleAt, destination, progress} = KevinWheel;
const $ = id => document.getElementById(id);
const wheel = $('wheel');
const spinButton = $('spin');
const colors = ['#ff8fae', '#f6d879', '#81dacb'];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let angle = 0, running = false, sound = true, audio, spins = 0, toastTimer;
let pointerAnimation;
const history = [];
if (reducedMotion.matches) $('mode').value = 'gentle';

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
  if (!sound) return;
  try {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    if (!audio) audio = new Context();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
  } catch { audio = undefined; }
}

function tone(frequency, duration = .06, delay = 0, type = 'triangle', endFrequency = frequency) {
  if (!sound || !audio || audio.state !== 'running') return;
  const oscillator = audio.createOscillator(), gain = audio.createGain();
  const start = audio.currentTime + delay;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(.065, start + .008);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
}

function toast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').classList.add('show');
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2400);
}

function confetti(chaos = false) {
  if (reducedMotion.matches || $('mode').value === 'gentle') return;
  const layer = $('effects');
  if (layer.childElementCount > 120) return;
  const glyphs = chaos ? ['🦆','🧀','🗿','🍌','🤡','🪩','💀','🎰'] : ['✦','●','▰','★'];
  for (let i = 0; i < (chaos ? 42 : 65); i++) {
    const item = document.createElement('span');
    item.className = 'particle';
    item.textContent = glyphs[randomInt(glyphs.length)];
    item.style.cssText = `--left:${20 + randomInt(61)}%;--size:${chaos ? 30 : 13 + randomInt(13)}px;--dx:${randomInt(501)-250}px;--dy:${-180-randomInt(500)}px;--turn:${randomInt(720)-360}deg;--delay:${randomInt(180)}ms;color:${colors[i % 3]}`;
    layer.append(item);
    setTimeout(() => item.remove(), 2200);
  }
}

function tick(gentle) {
  tone(360, .025, 0, 'square', 160);
  if (gentle || reducedMotion.matches) return;
  pointerAnimation?.cancel();
  pointerAnimation = $('pointer').animate([
    {transform:'translateX(-50%) rotate(-20deg)'},
    {transform:'translateX(-50%) rotate(0deg)'}
  ], {duration:100,easing:'ease-out'});
}

function finish() {
  angle = normalize(angle);
  wheel.style.transform = `rotate(${angle}deg)`;
  const article = articleAt(angle), index = articles.indexOf(article);
  running = false;
  document.body.classList.remove('spinning');
  spinButton.disabled = false;
  $('mode').disabled = false;
  $('spinLabel').textContent = 'Nochmal riskieren';
  $('resultLabel').textContent = 'Das Rad hat entschieden';
  $('result').textContent = article;
  $('result').style.color = colors[index];
  const quips = ['Der Kevin. Der Wahnsinn. Der Artikel.', 'Die Grammatik hat kurz weggeschaut.', 'Das war jetzt absolut wissenschaftlich.'];
  $('quip').textContent = quips[index];
  $('stageText').textContent = `Der Zeiger sagt „${article}“. Diskussion beendet.`;
  spins++;
  $('count').textContent = `${spins} ${spins === 1 ? 'Spin' : 'Spins'}`;
  history.unshift(article);
  history.splice(10);
  $('history').replaceChildren(...history.map(word => {
    const chip = document.createElement('li');
    chip.textContent = word;
    chip.style.setProperty('--chip', colors[articles.indexOf(word)]);
    return chip;
  }));
  [392, 523, 659, 784, 1047].forEach((note, i) => tone(note, .2, i * .09));
  confetti();
}

function spin() {
  if (running) return;
  running = true;
  unlockAudio();
  spinButton.disabled = true;
  $('mode').disabled = true;
  document.body.classList.add('spinning');
  $('spinLabel').textContent = 'Schicksal lädt …';
  $('resultLabel').textContent = 'Bitte das Universum nicht stören';
  $('result').textContent = '…';
  $('result').style.color = 'var(--purple)';
  $('quip').textContent = 'Kevin hat die Kontrolle abgegeben.';
  $('stageText').textContent = 'Anschnallen. Artikel im Anflug.';
  const mode = $('mode').value;
  const gentle = mode === 'gentle';
  const duration = gentle ? 1500 : mode === 'quick' ? 2200 : 6000;
  const turns = gentle ? 1 : mode === 'quick' ? 4 : 8;
  const from = angle;
  const to = destination(from, randomInt(12), turns, randomInt(17) - 8);
  let started, lastSegment = segmentAt(angle);
  tone(130, .25, 0, 'sine', 520);

  function frame(now) {
    if (started === undefined) started = now;
    const t = Math.min((now - started) / duration, 1);
    angle = from + (to - from) * progress(t);
    wheel.style.transform = `rotate(${angle}deg)`;
    const currentSegment = segmentAt(angle);
    if (currentSegment !== lastSegment) {
      tick(gentle);
      lastSegment = currentSegment;
    }
    if (t < 1) requestAnimationFrame(frame);
    else { angle = to; finish(); }
  }
  requestAnimationFrame(frame);
}

spinButton.addEventListener('click', spin);
document.addEventListener('keydown', event => {
  if (event.code !== 'Space' || event.repeat || /BUTTON|SELECT|INPUT|TEXTAREA|A/.test(event.target.tagName) || event.target.isContentEditable) return;
  event.preventDefault();
  spin();
});
$('sound').addEventListener('click', () => {
  sound = !sound;
  $('sound').textContent = sound ? '♫ Sound an' : '♪ Sound aus';
  $('sound').setAttribute('aria-pressed', String(sound));
  if (sound) unlockAudio();
});
$('chaos').addEventListener('click', () => {
  unlockAudio();
  tone(550, .3, 0, 'sawtooth', 75);
  tone(90, .25, .25, 'sine', 700);
  confetti(true);
  toast(['Ente gut, alles gut. 🦆','Kevin.exe funktioniert überraschend.','Grammatik verlassen. Chaos betreten.','Der Duden möchte deinen Standort wissen.'][randomInt(4)]);
});
