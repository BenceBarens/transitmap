
const canvas = document.querySelector("#canvas");
const c = canvas.getContext("2d");

const stations = [
  { x: 3, y: 4, name: "Station 1", type: 1 },
  { x: 4, y: 4, name: "Station 2", type: 1 },
  { x: 14, y: 6, name: "Station 3", type: 1 },
  { x: 12, y: 4, name: "Station 4", type: 1 },
  { x: 8, y: 8, name: "Station 5", type: 1 },
  { x: 4, y: 8, name: "Station 6", type: 1 },
  { x: 10, y: 6, name: "Station 7", type: 2 },
];

const lines = [
  { name: "Line A",
    color: "#E91E63",
    stations: [{ x: 3, y: 4 }, { x: 4, y: 4 }, {x: 10, y: 6}, { x: 14, y: 6 }]
  },
  { name: "Line B",
    color: "#5925E9",
    stations: [{ x: 12, y: 4 }, {x: 10, y: 6}, { x: 8, y: 8 }, { x: 4, y: 8 },]
  }
];

let cellSize = 50;
const gridCols = 30;
const gridRows = 30;

function resizeCanvas() { 
  canvas.width = gridCols * cellSize;
  canvas.height = gridRows * cellSize;
  console.log("DRAW: Canvas grootte ingesteld (" + cellSize + "px)");
}

//Drawing  -------------------------------------------------------------------

function drawGrid() {
  c.beginPath();
  c.fillStyle = "#F7F4ED";
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.strokeStyle = "rgba(35, 35, 34, 0.2)";
  c.beginPath();

  for (let x = 0; x <= gridCols; x++) {
    const pos = x * cellSize + (cellSize / 2);
    c.moveTo(pos, 0);
    c.lineTo(pos, canvas.height);
  }

  for (let y = 0; y <= gridRows; y++) {
    const pos = y * cellSize + (cellSize / 2);
    c.moveTo(0, pos);
    c.lineTo(canvas.width, pos);
  }

  c.stroke();
}

function drawLines() {
  lines.forEach(line => {
    c.strokeStyle = line.color;
    c.lineWidth = 10;
    c.beginPath();

    line.stations.forEach((station, index) => {
      const x = station.x * cellSize + cellSize / 2;
      const y = station.y * cellSize + cellSize / 2;

      c.lineTo(x, y);
    });

    c.stroke();
  });
}

function drawStations() {
  stations.forEach(station => {
    const x = station.x * cellSize;
    const y = station.y * cellSize;
    c.beginPath();
    
    if(station.type === 1) {
    c.fillStyle = "#232322";
    c.rect(x + cellSize / 4, y + cellSize / 4, cellSize / 2, cellSize / 2);
    c.fill();
    }

    if(station.type === 2) {
    c.strokeStyle = "#232322";
    c.rect(x + cellSize / 4, y + cellSize / 4, cellSize / 2, cellSize / 2);
    c.strokeWidth = 2;
    c.stroke();
    c.fillStyle = "#F7F4ED";
    c.fill();
    }

    c.beginPath();
    c.fillStyle = "#232322";
    c.save();
    c.translate(x, y);
    c.rotate(-45 * Math.PI / 180);
    c.font = "1rem Inter, sans-serif";
    c.fillText(station.name, 15, 15);
    c.restore();
  });
}


function draw() {
  resizeCanvas();
  drawGrid();
  drawLines();
  drawStations();
}

//Rendering station and line lists ------------------------------------------------

function renderStationList() {
  const stationList = document.querySelector('#station-list');
  stationList.innerHTML = '';

  stations.forEach((station, index) => {
    const stationItem = document.createElement('li');
    stationItem.className = 'station-item';
    
    stationItem.innerHTML = `<button onclick="editStation(${index})">✏️ ${station.name} (${station.x}, ${station.y})</button>`;
    stationList.appendChild(stationItem);
    draw();
  });
}

function renderLineList() {
  const list = document.querySelector("#line-list");
  const legend = document.querySelector("#legend-list");
  list.innerHTML = "";
  legend.innerHTML = "";

  lines.forEach((line, index) => {
    const li = document.createElement("li");
    li.classList.add("line-item");

    const button = document.createElement("button");
    button.textContent = `✏️ ${line.name}`;
    button.onclick = () => openLinePopup(index);

    const colorCircle = document.createElement("span");
    colorCircle.style.display = "inline-block";
    colorCircle.style.width = ".8rem";
    colorCircle.style.height = ".8rem";
    colorCircle.style.borderRadius = "50%";
    colorCircle.style.marginLeft = ".5rem";
    colorCircle.style.backgroundColor = line.color;
    colorCircle.title = line.color;


    button.appendChild(colorCircle);
    li.appendChild(button);
    list.appendChild(li);
  });

  lines.forEach((line, index) => {
  const li = document.createElement("li");
  li.classList.add("line-item");
  li.style.display = "flex";
  li.style.alignItems = "center";

  const lineSample = document.createElement("span");
  lineSample.style.display = "inline-block";
  lineSample.style.width = "3rem";
  lineSample.style.height = ".8rem";
  lineSample.style.marginRight = "8px";
  lineSample.style.backgroundColor = line.color;
  lineSample.title = line.color;

  const text = document.createTextNode(line.name);

  li.appendChild(lineSample);
  li.appendChild(text);
  legend.appendChild(li);
  });
}



//In- en uitzoomen ----------------------------------------------------------------

function zoomIn() {
  if (cellSize < 75) {
    cellSize += 5;
    draw();
  }
  console.log("CONTROLS: zoom in, niveau " + cellSize);
}

function zoomOut() {
  if (cellSize > 40) {
    cellSize -= 5;
    draw();
  }
  console.log("CONTROLS: zoom out, niveau " + cellSize);
}

document.querySelector("#zoomIn").addEventListener("click", zoomIn);
document.querySelector("#zoomOut").addEventListener("click", zoomOut);

// Controls ------------------------------------------------------------------------

//Edit lines \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
let selectedLineIndex = null;

// Toon lijst met lijnen


// Popup openen
function openLinePopup(index) {
  selectedLineIndex = index;
  const line = lines[index];

  document.querySelector("#line-name-input").value = line.name;
  document.querySelector("#line-color-input").value = line.color;
  document.querySelector("#line-popup").classList.remove("hidden");
}

// Popup sluiten
function closeLinePopup() {
  document.querySelector("#line-popup").classList.add("hidden");
  selectedLineIndex = null;
}

// Bewerking opslaan
function saveLineEdits() {
  if (selectedLineIndex === null) return;
  const name = document.querySelector("#line-name-input").value;
  const color = document.querySelector("#line-color-input").value;

  lines[selectedLineIndex].name = name;
  lines[selectedLineIndex].color = color;

  renderLineList();
  closeLinePopup();
  draw(); // opnieuw tekenen
}

// Verwijderen
function deleteLine() {
  if (selectedLineIndex === null) return;
  lines.splice(selectedLineIndex, 1);
  renderLineList();
  closeLinePopup();
  draw();
}



//Add station \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const toggleAddStation = document.querySelector('#toggleAddStation');

canvas.addEventListener("click", function (event) {
  if (toggleAddStation.checked) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    const exists = stations.some(station => station.x === col && station.y === row);
    if (!exists) {
      const station = {
        id: Date.now(),
        name: `Station ${stations.length + 1}`,
        x: col,
        y: row,
        lines: [],
        type: 1,
      };
      stations.push(station);
      draw();
      renderStationList();
    }
  }
});

//Toggle legenda \\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const toggleShowLegend = document.querySelector('#toggleShowLegend');

toggleShowLegend.addEventListener('change', function() {
  if (toggleShowLegend.checked) {
    document.querySelector("#legend").style.display = "block";
  } else {
    document.querySelector("#legend").style.display = "none";
  }
  console.log("CONTROLS: legenda status: " + document.querySelector("#legend").style.display);
});

//Edit stations \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

let selectedStationIndex = null;

function editStation(index) {
  selectedStationIndex = index;
  const station = stations[index];

  document.querySelector('#station-name-input').value = station.name;
  document.querySelector('#station-type-input').value = station.type || 'regular'; // 'regular' als fallback
  document.querySelector('#station-popup').classList.remove('hidden');
  draw();
}

function saveStationEdits() {
  if (selectedStationIndex !== null) {
    stations[selectedStationIndex].name = document.querySelector('#station-name-input').value;
    stations[selectedStationIndex].type = parseInt(document.querySelector('#station-type-input').value, 10); // parse int
    renderStationList();
    draw();
    closePopup();
  }
}


function deleteStation() {
  if (selectedStationIndex !== null) {
    stations.splice(selectedStationIndex, 1);
    renderStationList();
    draw();
    closePopup();
  }
}

function closePopup() {
  document.querySelector('#station-popup').classList.add('hidden');
  selectedStationIndex = null;
}

//Export \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
document.querySelector("#export-btn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "My Transit Map.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});



//Waarschuwing bij herladen --------------------------------------------------------

draw();
renderStationList();
renderLineList();

// window.addEventListener("beforeunload", function (e) {
//   e.preventDefault();
//   e.returnValue = "";
// });

