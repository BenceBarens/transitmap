const svgmaptest = document.getElementById("map");
let isPanning = false;
let startX = 0;
let startY = 0;
let transform = { x: 0, y: 0, scale: 1 };

// Update svgmaptest transform
function updateTransform() {
    svgmaptest.setAttribute("transform", `translate(${transform.x},${transform.y}) scale(${transform.scale})`);
}

// Mouse down: start panning
svgmaptest.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return; // only left mouse
    isPanning = true;
    startX = e.clientX - transform.x;
    startY = e.clientY - transform.y;
});

// Mouse move: pan
window.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    transform.x = e.clientX - startX;
    transform.y = e.clientY - startY;
    updateTransform();
});

// Mouse up: stop panning
window.addEventListener("mouseup", () => {
    isPanning = false;
});

// Wheel: zoom
svgmaptest.addEventListener("wheel", (e) => {
    e.preventDefault();
    const scaleAmount = e.deltaY < 0 ? 1.1 : 0.9;
    const rect = svgmaptest.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // adjust pan so zoom is relative to mouse
    transform.x = offsetX - (offsetX - transform.x) * scaleAmount;
    transform.y = offsetY - (offsetY - transform.y) * scaleAmount;
    transform.scale *= scaleAmount;
    updateTransform();
}, { passive: false });

// Reset button (optioneel)
document.getElementById("resetView")?.addEventListener("click", () => {
    transform = { x: 0, y: 0, scale: 1 };
    updateTransform();
});
