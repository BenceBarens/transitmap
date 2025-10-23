const svgmaptest = document.getElementById("map");
let isPanning = false;
let startX = 0;
let startY = 0;
let transform = { x: 0, y: 0, scale: 1 };

const MIN_SCALE = 0.5;
const MAX_SCALE = 1.2;

function updateTransform() {
    svgmaptest.setAttribute("transform", `translate(${transform.x},${transform.y}) scale(${transform.scale})`);
}

// pan start
svgmaptest.addEventListener("mousedown", e => {
    if (e.button !== 0) return;
    isPanning = true;
    startX = e.clientX - transform.x;
    startY = e.clientY - transform.y;
});

// pan move
window.addEventListener("mousemove", e => {
    if (!isPanning) return;
    transform.x = e.clientX - startX;
    transform.y = e.clientY - startY;
    updateTransform();
});

// pan end
window.addEventListener("mouseup", () => { isPanning = false; });

// wheel zoom
svgmaptest.addEventListener("wheel", e => {
    e.preventDefault();
    const rect = svgmaptest.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    let scaleAmount = e.deltaY < 0 ? 1.1 : 0.9;
    let newScale = transform.scale * scaleAmount;
    newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    scaleAmount = newScale / transform.scale;

    transform.x = offsetX - (offsetX - transform.x) * scaleAmount;
    transform.y = offsetY - (offsetY - transform.y) * scaleAmount;
    transform.scale = newScale;

    updateTransform();
}, { passive: false });
