const svgWrap = document.querySelector(".svg-wrap");
const inner = document.querySelectorAll("#layer-grid, #layer-lines, #layer-stations, #layer-labels");


let transform = { x: 0, y: 0, scale: 1 };
let isPanning = false;
let startX = 0;
let startY = 0;

// Constants voor tuning
const MIN_SCALE = 1;     // minimum zoom
const MAX_SCALE = 2.5;     // maximum zoom
const ZOOM_SPEED = 0.1;   // hogere waarde = sneller zoomen
const INERTIA = 0.9;       // 0-1, hoger = meer traagheid
const STOP_THRESHOLD = 0.1;

let velocity = { x: 0, y: 0 };

// Update SVG transform via CSS
function updateTransform() {
  inner.forEach(layer => {
    layer.setAttribute(
      "transform",
      `translate(${transform.x},${transform.y}) scale(${transform.scale})`
    );
  });
}

svg.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  isPanning = true;
  startX = e.clientX - transform.x;
  startY = e.clientY - transform.y;
});

//Dit moet niet de window zijn, maar alleen de area van de map!!!
window.addEventListener("mousemove", (e) => {
  if (!isPanning) return;

  const prevX = transform.x;
  const prevY = transform.y;

  transform.x = e.clientX - startX;
  transform.y = e.clientY - startY;

  velocity.x = (transform.x - prevX) * 0.6;
  velocity.y = (transform.y - prevY) * 0.6;

  updateTransform();
});

// Panning stoppen
window.addEventListener("mouseup", () => {
  isPanning = false;
});

// Wheel zoom
svg.addEventListener("wheel", (e) => {
  e.preventDefault();
  const rect = svg.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;
  const scaleAmount = e.deltaY < 0 ? 1 + ZOOM_SPEED : 1 - ZOOM_SPEED;

  const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, transform.scale * scaleAmount));
  if (newScale === transform.scale) return; // blokkeert verder scrollen bij grens

  const zoomFactor = newScale / transform.scale;
  transform.x = offsetX - (offsetX - transform.x) * zoomFactor;
  transform.y = offsetY - (offsetY - transform.y) * zoomFactor;
  transform.scale = newScale;

  updateTransform();
}, { passive: false });

// Inertia loop
function animateInertia() {
  if (!isPanning) {
    transform.x += velocity.x;
    transform.y += velocity.y;
    velocity.x *= INERTIA;
    velocity.y *= INERTIA;

    if (Math.abs(velocity.x) < STOP_THRESHOLD) velocity.x = 0;
    if (Math.abs(velocity.y) < STOP_THRESHOLD) velocity.y = 0;

    updateTransform();
  }
  requestAnimationFrame(animateInertia);
}
animateInertia();
