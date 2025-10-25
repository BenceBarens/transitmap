const elements = ['button', 'a', '.toggle-label', '#toggleAddStationLabel', '.import-label', "summary"];
const soundHover = document.getElementById('soundHover');
const soundClick = document.getElementById('soundClick');
const soundToggle = document.getElementById('toggleSoundEffects');

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let bufferHover, bufferClick;

Promise.all([
  fetch(soundHover.src).then(r => r.arrayBuffer()).then(d => audioCtx.decodeAudioData(d)),
  fetch(soundClick.src).then(r => r.arrayBuffer()).then(d => audioCtx.decodeAudioData(d))
]).then(([hoverBuf, clickBuf]) => {
  bufferHover = hoverBuf;
  bufferClick = clickBuf;
});

function playBuffer(buffer, volume = 1) {
  if (!soundToggle.checked) return;
  if (!buffer) return;
  const source = audioCtx.createBufferSource();
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = volume;
  source.buffer = buffer;
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  source.start(0);
}

function matchesElement(target) {
  return target instanceof Element && elements.some(sel => target.matches(sel));
}

document.addEventListener('mouseenter', e => {
  if (matchesElement(e.target)) playBuffer(bufferHover, 0.6);
}, true);

document.addEventListener('click', e => {
  if (matchesElement(e.target)) playBuffer(bufferClick, 1);
}, true);

console.info("%c✔%c sound.js %cloaded in fully", "background-color: #b8e986; border-color: #417505; border-radius: 100px; padding: 3px", "font-weight: bold;", "  ");