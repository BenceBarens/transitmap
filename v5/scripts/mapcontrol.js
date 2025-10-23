let transform = { x: 0, y: 0, scale: 1 };
let isPanning = false;
let startX = 0;
let startY = 0;
let velocity = { x: 0, y: 0 };

const MIN_SCALE = 1;
const MAX_SCALE = 2.5;
const ZOOM_SPEED = 0.05;
const INERTIA = 0.85;
const STOP_THRESHOLD = 0.3;

function updateTransform() {
    svg.setAttribute("transform", `translate(${transform.x},${transform.y}) scale(${transform.scale})`);
}

svg.addEventListener("mousedown", e => {
    if (e.button !== 0) return;
    isPanning = true;
    startX = e.clientX - transform.x;
    startY = e.clientY - transform.y;
});

window.addEventListener("mousemove", e => {
    if (!isPanning) return;
    const dx = e.clientX - startX - transform.x;
    const dy = e.clientY - startY - transform.y;
    transform.x = e.clientX - startX;
    transform.y = e.clientY - startY;
    velocity.x = dx;
    velocity.y = dy;
    updateTransform();
});

window.addEventListener("mouseup", () => {
    isPanning = false;
});

svg.addEventListener("wheel", e => {
    e.preventDefault();

    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleAmount = e.deltaY < 0 ? 1 + ZOOM_SPEED : 1 - ZOOM_SPEED;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, transform.scale * scaleAmount));

    // zoom rond cursor in element-coördinaten
    const dx = (mouseX - transform.x) * (newScale / transform.scale - 1);
    const dy = (mouseY - transform.y) * (newScale / transform.scale - 1);

    transform.x -= dx;
    transform.y -= dy;
    transform.scale = newScale;

    updateTransform();
}, { passive: false });

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
