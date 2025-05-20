
console.log("TRANSIT MAP MAKER - MADE BY BENCE");

const canvas = document.querySelector("#canvas");
const c = canvas.getContext("2d");

const stations = [
  { x: 3, y: 4, name: "Station 1", type: 1 },
  { x: 4, y: 4, name: "Station 2", type: 1 },
  { x: 14, y: 7, name: "Station 3", type: 1 },
];

const lines = [
  {
    name: "Lijn A",
    color: "#E91E63",
    stations: [
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 14, y: 7 },
    ]
  }
];

let cellSize = 50;
const gridCols = 60;
const gridRows = 50;

function resizeCanvas() { 
  canvas.width = gridCols * cellSize;
  canvas.height = gridRows * cellSize;
  console.log("DRAW: Canvas grootte ingesteld (" + cellSize + "px)");
}

//Drawing functies -------------------------------------------------------------

function drawGrid() {
  //ECHTE GRID \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  //De grid waarop coordinaten worden weergegeven
  // c.clearRect(0, 0, canvas.width, canvas.height);
  // c.strokeStyle = "rgba(255, 0, 0, 0.16)";
  // c.beginPath();

  // for (let x = 0; x <= gridCols; x++) {
  //   const pos = x * cellSize;
  //   c.moveTo(pos, 0);
  //   c.lineTo(pos, canvas.height);
  // }

  // for (let y = 0; y <= gridRows; y++) {
  //   const pos = y * cellSize;
  //   c.moveTo(0, pos);
  //   c.lineTo(canvas.width, pos);
  // }

  // c.stroke();

  //GEBRUIKER GRID \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  //De grid die de gebruiker ziet
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

  console.log("DRAW: Grid ingetekend (" + gridCols + " x " + gridRows + " cellen)");
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
    console.log("DRAW: Lijn ingetekend");
  });
}

function drawStations() {
  stations.forEach(station => {
    const x = station.x * cellSize;
    const y = station.y * cellSize;
    c.beginPath();
    c.fillStyle = "#232322";
    
    c.rect(x + cellSize / 4, y + cellSize / 4, cellSize / 2, cellSize / 2);
    c.fill();
    
    c.save();
    c.translate(x, y);
    c.rotate(-45 * Math.PI / 180);
    c.font = "1rem Inter, sans-serif";
    c.fillText(station.name, 15, 15);
    c.restore();

    console.log("DRAW: Station ingetekend");
  });
}


function draw() {
  console.log(" ");
  console.log("DRAW START ----------------------------------");
  resizeCanvas();
  drawGrid();
  drawLines();
  drawStations();
  console.log("DRAW IS UITGEVOERD --------------------------");
  console.log(" ");
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
  if (cellSize > 30) {
    cellSize -= 5;
    draw();
  }
  console.log("CONTROLS: zoom out, niveau " + cellSize);
}

document.getElementById("zoomIn").addEventListener("click", zoomIn);
document.getElementById("zoomOut").addEventListener("click", zoomOut);

// Controls ------------------------------------------------------------------------

//Add station \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const toggleAddStation = document.querySelector('#toggleAddStation');

canvas.addEventListener("click", function (event) {
  if (toggleAddStation.checked) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Coördinaten omzetten naar grid
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    // Station aanmaken en toevoegen
    const station = {
      id: Date.now(),
      name: `Station ${stations.length + 1}`,
      x: col,
      y: row,
      lines: [],
    };
    stations.push(station);
    console.log("CONTROLS: station toegevoegd (" + station.name + ")");
    draw();
    renderStationList();
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

function renderStationList() {
  const stationList = document.getElementById('station-list');
  stationList.innerHTML = '';

  stations.forEach((station, index) => {
    const stationItem = document.createElement('div');
    stationItem.className = 'station-item';
    stationItem.innerHTML = `
      <span>${station.name}</span>
      <button onclick="editStation(${index})">✏️</button>
    `;
    stationList.appendChild(stationItem);
    draw();
  });
}

function editStation(index) {
  selectedStationIndex = index;
  const station = stations[index];

  document.getElementById('station-name-input').value = station.name;
  document.getElementById('station-type-input').value = station.type || 'regular';
  document.getElementById('station-popup').classList.remove('hidden');
  draw();
}

function saveStationEdits() {
  if (selectedStationIndex !== null) {
    stations[selectedStationIndex].name = document.getElementById('station-name-input').value;
    stations[selectedStationIndex].type = document.getElementById('station-type-input').value;
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
  document.getElementById('station-popup').classList.add('hidden');
  selectedStationIndex = null;
}












//Waarschuwing bij herladen --------------------------------------------------------

draw();
renderStationList();

// window.addEventListener("beforeunload", function (e) {
//   e.preventDefault();
//   e.returnValue = "";
// });

