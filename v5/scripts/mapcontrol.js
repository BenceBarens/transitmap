const svgWrap = document.querySelector(".svg-wrap");
const inner = document.querySelectorAll("#layer-grid, #layer-lines, #layer-stations, #layer-labels");

let transform = { x: 0, y: 0, scale: 1 };
let velocity = { x: 0, y: 0 };

//Change to tweak map control behaviour
const MIN_SCALE = 1;
const MAX_SCALE = 3;
const INERTIA = 0.87; //Scale from 0-1
const STOP_THRESHOLD = 0.01;
const ZOOM_SPEED = 0.006;

const pointers = new Map();
let lastDistance = null;

function updateTransform() {
  inner.forEach(layer => {
    layer.setAttribute("transform", `translate(${transform.x},${transform.y}) scale(${transform.scale})`);
  });
}

svg.addEventListener("pointerdown", e => {
  svg.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  velocity.x = 0;
  velocity.y = 0;
});

svg.addEventListener("pointermove", e => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  const entries = Array.from(pointers.values());

  if (entries.length === 1) {
  const dx = e.movementX;
  const dy = e.movementY;
  const speed = 2; // tweak voor snellere panning

  transform.x += dx * speed;
  transform.y += dy * speed;
  velocity.x = dx * speed;
  velocity.y = dy * speed;

  updateTransform();

  } else if (entries.length === 2) {
    const [p1, p2] = entries;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.hypot(dx, dy);

    if (lastDistance != null) {
      const delta = dist / lastDistance;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, transform.scale * delta));

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const zoomFactor = newScale / transform.scale;
      transform.x = midX - (midX - transform.x) * zoomFactor;
      transform.y = midY - (midY - transform.y) * zoomFactor;
      transform.scale = newScale;

      updateTransform();
    }
    lastDistance = dist;
  }
});

svg.addEventListener("pointerup", e => {
  pointers.delete(e.pointerId);
  lastDistance = null;

  // wacht even zodat inertia eerst werkt
  setTimeout(() => {
    if (pointers.size === 0 && (Math.abs(velocity.x) < 0.5 && Math.abs(velocity.y) < 0.5)) {
      smoothClamp();
    }
  }, 200);
});

svg.addEventListener("pointercancel", e => {
  pointers.delete(e.pointerId);
  lastDistance = null;
});


// Scroll/touchpad zoom
svg.addEventListener("wheel", e => {
  e.preventDefault();
  const rect = svg.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  const delta = -e.deltaY * ZOOM_SPEED;
  const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, transform.scale * (1 + delta)));
  if (newScale === transform.scale) return;

  const zoomFactor = newScale / transform.scale;
  transform.x = offsetX - (offsetX - transform.x) * zoomFactor;
  transform.y = offsetY - (offsetY - transform.y) * zoomFactor;
  transform.scale = newScale;

  updateTransform();
}, { passive: false });

// Inertia
function animateInertia() {
  if (pointers.size === 0) {
    transform.x += velocity.x;
    transform.y += velocity.y;
    velocity.x *= INERTIA;
    velocity.y *= INERTIA;

    if (Math.abs(velocity.x) < STOP_THRESHOLD) velocity.x = 0;
    if (Math.abs(velocity.y) < STOP_THRESHOLD) velocity.y = 0;

    clampTransform();
    updateTransform();
  }
  requestAnimationFrame(animateInertia);
}

function clampTransform() {
  const containerRect = svgWrap.getBoundingClientRect();
  const layerBBox = inner[0].getBBox();
  const scaledWidth = layerBBox.width * transform.scale;
  const scaledHeight = layerBBox.height * transform.scale;

  const maxOffsetX = scaledWidth * 0.2;
  const maxOffsetY = scaledHeight * 0.1;
  const minX = containerRect.width - scaledWidth - maxOffsetX;
  const maxX = maxOffsetX;
  const minY = containerRect.height - scaledHeight - maxOffsetY;
  const maxY = maxOffsetY;

  transform.x = Math.min(maxX, Math.max(minX, transform.x));
  transform.y = Math.min(maxY, Math.max(minY, transform.y));
}

animateInertia();

// Smooth clamp
function smoothClamp() {
  const containerRect = svgWrap.getBoundingClientRect();
  const layerBBox = inner[0].getBBox();
  const scaledWidth = layerBBox.width * transform.scale;
  const scaledHeight = layerBBox.height * transform.scale;

  const maxOffsetX = scaledWidth * 0.2;
  const maxOffsetY = scaledHeight * 0.1;
  const minX = containerRect.width - scaledWidth - maxOffsetX;
  const maxX = maxOffsetX;
  const minY = containerRect.height - scaledHeight - maxOffsetY;
  const maxY = maxOffsetY;

  const targetX = Math.min(maxX, Math.max(minX, transform.x));
  const targetY = Math.min(maxY, Math.max(minY, transform.y));

  const duration = 200;
  const startX = transform.x;
  const startY = transform.y;
  const startTime = performance.now();

  function animateClamp(time) {
    const t = Math.min(1, (time - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    transform.x = startX + (targetX - startX) * eased;
    transform.y = startY + (targetY - startY) * eased;
    updateTransform();
    if (t < 1) requestAnimationFrame(animateClamp);
  }
  requestAnimationFrame(animateClamp);
}

console.info("%c✔%c mapcontrol.js %cloaded in fully", "background-color: #b8e986; border-color: #417505; border-radius: 100px; padding: 3px", "font-weight: bold;", "  ");