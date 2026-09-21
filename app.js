const wheel = document.querySelector('#wheel');
const spinButton = document.querySelector('#spinButton');
const resultWord = document.querySelector('#resultWord');
const resultSub = document.querySelector('#resultSub');
const resultCard = document.querySelector('#resultCard');
const historyList = document.querySelector('#historyList');
const toast = document.querySelector('#toast');
const confettiLayer = document.querySelector('#confettiLayer');
const soundToggle = document.querySelector('#soundToggle');

let rotation = 0;
let spinning = false;
let soundOn = true;
let audioContext;
const outcomes = [
  {word:'DER', color:'var(--pink)', lines:['Der Kevin hat gesprochen.', 'Maskulin. Mächtig. Verdächtig.']},
  {word:'DIE', color:'var(--yellow)', lines:['Die Entscheidung ist gefallen.', 'Feminin. Elegant. Absolut wild.']},
  {word:'DAS', color:'var(--blue)', lines:['Das Schicksal sagt: DAS.', 'Neutral. Aber emotional.']}
];
const emojis = ['🦆','💸','🧀','🫡','🚨','🪩','🤡','🍌','✨','🦀'];

function ensureAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') audioContext.resume();
}

function tone(frequency, duration = .08, type = 'square', delay = 0) {
  if (!soundOn) return;
  ensureAudio();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(.0001, audioContext.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(.12, audioContext.currentTime + delay + .01);
  gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + delay + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(audioContext.currentTime + delay);
  oscillator.stop(audioContext.currentTime + delay + duration + .02);
}

function playTick() { tone(130 + Math.random() * 80, .045, 'square'); }
function playWin() { [392, 523, 659, 784].forEach((note, i) => tone(note, .18, 'triangle', i * .07)); }

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2200);
}

function burstConfetti(amount = 42) {
  const colors = ['#ff5c7a','#ffd35a','#6dd5ed','#9d7bff','#29213b'];
  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement('i');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty('--x', `${(Math.random() - .5) * 240}px`);
    piece.style.setProperty('--r', `${Math.random() * 80 - 40}deg`);
    piece.style.setProperty('--c', colors[i % colors.length]);
    piece.style.animationDelay = `${Math.random() * .2}s`;
    confettiLayer.appendChild(piece);
    window.setTimeout(() => piece.remove(), 2200);
  }
}

function popEmoji() {
  const emoji = document.createElement('span');
  emoji.className = 'emoji-pop';
  emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  emoji.style.left = `${35 + Math.random() * 30}%`;
  emoji.style.top = `${55 + Math.random() * 15}%`;
  confettiLayer.appendChild(emoji);
  window.setTimeout(() => emoji.remove(), 1500);
}

function addHistory(outcome) {
  const empty = historyList.querySelector('.empty-history');
  if (empty) empty.remove();
  const chip = document.createElement('div');
  chip.className = 'history-chip';
  chip.innerHTML = `${outcome.word}<small>${new Date().toLocaleTimeString('de-AT', {hour:'2-digit', minute:'2-digit'})}</small>`;
  historyList.prepend(chip);
  while (historyList.children.length > 8) historyList.lastElementChild.remove();
}

function spin() {
  if (spinning) return;
  spinning = true;
  document.body.classList.add('is-spinning');
  spinButton.disabled = true;
  ensureAudio();
  resultWord.textContent = '???';
  resultSub.textContent = 'Das Universum würfelt …';
  resultCard.style.transform = 'rotate(-2deg)';
  const outcomeIndex = Math.floor(Math.random() * outcomes.length);
  const target = outcomeIndex * 120 + 60;
  rotation += 2160 + (360 - (rotation % 360)) + target;
  wheel.style.transform = `rotate(${rotation}deg)`;
  let ticks = 0;
  const tickTimer = window.setInterval(() => {
    playTick();
    ticks += 1;
    if (ticks >= 26) window.clearInterval(tickTimer);
  }, 200);
  window.setTimeout(() => {
    const outcome = outcomes[outcomeIndex];
    resultWord.textContent = outcome.word;
    resultWord.style.color = outcome.color;
    resultSub.textContent = outcome.lines[Math.floor(Math.random() * outcome.lines.length)];
    resultCard.style.transform = 'rotate(2deg) scale(1.03)';
    spinButton.disabled = false;
    spinning = false;
    document.body.classList.remove('is-spinning');
    addHistory(outcome);
    playWin();
    burstConfetti(56);
    popEmoji();
    showToast(`${outcome.word} — Kevin akzeptiert sein Schicksal.`);
    window.setTimeout(() => resultCard.style.transform = '', 450);
  }, 5200);
}

spinButton.addEventListener('click', spin);
document.querySelector('#chaosButton').addEventListener('click', () => {
  burstConfetti(85);
  for (let i = 0; i < 4; i += 1) window.setTimeout(popEmoji, i * 110);
  [180, 240, 320].forEach((note, i) => tone(note, .12, 'sawtooth', i * .08));
  showToast('Chaos-Level: Kevin.');
});
document.querySelector('#clearHistory').addEventListener('click', () => {
  historyList.innerHTML = '<div class="empty-history">Noch kein Drama protokolliert.</div>';
  showToast('Die Beweise wurden vernichtet.');
});
soundToggle.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? '🔊 Sounds an' : '🔇 Sounds aus';
  soundToggle.setAttribute('aria-pressed', String(soundOn));
  if (soundOn) { tone(520, .1, 'triangle'); showToast('Kevin hört jetzt zu.'); }
});
