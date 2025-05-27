
const canvas = document.querySelector("#canvas");
const c = canvas.getContext("2d");

const stations = [
  { id: 1, x: 3, y: 4, name: "Station 1", type: 1 },
  { id: 2, x: 4, y: 4, name: "Station 2", type: 1 },
  { id: 3, x: 14, y: 6, name: "Station 3", type: 1 },
  { id: 4, x: 12, y: 4, name: "Station 4", type: 1 },
  { id: 5, x: 8, y: 8, name: "Station 5", type: 1 },
  { id: 6, x: 4, y: 8, name: "Station 6", type: 1 },
  { id: 7, x: 10, y: 6, name: "Station 7", type: 2 },
];


const lines = [
  { name: "Line 1", color: "#E91E63", stations: [1, 2, 7, 3] },
  { name: "Line 2", color: "#5925E9", stations: [4, 7, 5, 6] },
];

let cellSize = 50;
let gridCols = 30;
let gridRows = 30;

function resizeCanvas() { 
  canvas.width = gridCols * cellSize;
  canvas.height = gridRows * cellSize;
}

function widthPlus(){
  gridCols += 2;
  draw();
}
function widthMin(){
  gridCols -= 2;
  draw();
}
function heightPlus(){
  gridRows += 2;
  draw();
}
function heightMin(){
  gridRows -= 2;
  draw();
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

    let prevX = null;
    let prevY = null;

    line.stations.forEach((stationId) => {
      const station = stations.find(s => s.id === stationId);
      if (station) {
        const x = station.x * cellSize + cellSize / 2;
        const y = station.y * cellSize + cellSize / 2;

        if (prevX !== null && prevY !== null) {
          const deltax = x - prevX;
          const deltay = y - prevY;

          const absDeltaX = Math.abs(deltax);
          const absDeltaY = Math.abs(deltay);

          if (absDeltaX !== absDeltaY && deltax !== 0 && deltay !== 0) {
            const correction = Math.min(absDeltaX, absDeltaY);
            const midX = prevX + correction * Math.sign(deltax);
            const midY = prevY + correction * Math.sign(deltay);
            c.lineTo(midX, midY);
          }
        }

        c.lineTo(x, y);
        prevX = x;
        prevY = y;
      }
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
    c.strokeStyle = "#F7F4ED";
    c.save();
    c.translate(x, y);
    c.rotate(-45 * Math.PI / 180);
    c.font = "1rem Inter, sans-serif";
    c.strokeText(station.name, 15, 15);
    c.fillText(station.name, 15, 15);
    c.restore();
  });
}


function draw() {
  resizeCanvas();
  drawGrid();
  drawLines();
  drawStations();
  console.log("DRAW UITGEVOERD -----------");
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
  if (cellSize < 80) {
    cellSize += 5;
    draw();
  }
}

function zoomOut() {
  if (cellSize > (2100/(gridCols+gridRows))) {
    cellSize -= 5;
    draw();
  }
}

document.querySelector("#zoomIn").addEventListener("click", zoomIn);
document.querySelector("#zoomOut").addEventListener("click", zoomOut);

// Controls ------------------------------------------------------------------------

//Edit lines \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
let selectedLineIndex = null;

function openLinePopup(index) {
  selectedLineIndex = index;
  const line = lines[index];

  document.querySelector("#line-name-input").value = line.name;
  document.querySelector("#line-color-input").value = line.color;
  document.querySelector("#line-popup").classList.remove("hidden");

  renderEditStationSelectOptions();
  renderEditableStationList();
}

function closeLinePopup() {
  document.querySelector("#line-popup").classList.add("hidden");
  selectedLineIndex = null;
}

function saveLineEdits() {
  if (selectedLineIndex === null) return;
  const name = document.querySelector("#line-name-input").value;
  const color = document.querySelector("#line-color-input").value;

  lines[selectedLineIndex].name = name;
  lines[selectedLineIndex].color = color;

  renderLineList();
  closeLinePopup();
  draw();
}

function deleteLine() {
  if (selectedLineIndex === null) return;
  lines.splice(selectedLineIndex, 1);
  renderLineList();
  closeLinePopup();
  draw();
}

//Edit line stations
function renderEditStationSelectOptions() {
  const select = document.querySelector("#stationSelect");
  select.innerHTML = "";
  stations.forEach(s => {
    const option = document.createElement("option");
    option.value = s.id;
    option.textContent = s.name;
    select.appendChild(option);
  });
}

function renderEditableStationList() {
  const stationList = document.querySelector("#stationList");
  stationList.innerHTML = "";
  if (selectedLineIndex === null) return;
  const line = lines[selectedLineIndex];

  line.stations.forEach((stationId, index) => {
    const station = stations.find(s => s.id === stationId);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <th>${station.name}</th>
      <th><button onclick="moveStationInLine(${index}, -1)">⬆️</button>
      <button onclick="moveStationInLine(${index}, 1)">⬇️</button>
      <button onclick="removeStationFromLine(${index})">❌</button></th>

    `;
    stationList.appendChild(tr);
  });
}

function addStationToLine() {
  const id = parseInt(document.querySelector("#stationSelect").value);
  if (selectedLineIndex === null) return;
  const line = lines[selectedLineIndex];
  if (!line.stations.includes(id)) {
    line.stations.push(id);
    renderEditableStationList();
    draw();
  }
}

function removeStationFromLine(index) {
  if (selectedLineIndex === null) return;
  lines[selectedLineIndex].stations.splice(index, 1);
  renderEditableStationList();
  draw();
}

function moveStationInLine(index, direction) {
  if (selectedLineIndex === null) return;
  const line = lines[selectedLineIndex];
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= line.stations.length) return;
  [line.stations[index], line.stations[newIndex]] = [line.stations[newIndex], line.stations[index]];
  renderEditableStationList();
  draw();
}

//Add line \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

document.querySelector("#btn-addline").addEventListener("click", () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    const lineNumber = lines.length + 1;
    const newLine = {
        name: `Line ${lineNumber}`,
        color: color,
        stations: []
    };

    lines.push(newLine);
    renderLineList();
  });


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

//Export as PNG \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
document.querySelector("#export-btn").addEventListener("click", () => {
  cellSize = 50;
  draw();
  const link = document.createElement("a");
  link.download = "My Transit Map.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

//Export as JSON \\\\\\\\\\\\\\\\\\\\\\\\
document.querySelector("#export-json-btn").addEventListener("click", () => {
  exportMapData();
});

function exportMapData() {
  const data = {
    stations,
    lines
  };
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.download = "My Transit Map.json";
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}

//Import JSON \\\\\\\\\\\\\\\\\\\\\\\\
function importMapData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = JSON.parse(e.target.result);

    // Vervang huidige data
    stations.length = 0;
    lines.length = 0;

    data.stations.forEach(station => stations.push(station));
    data.lines.forEach(line => lines.push(line));

    draw();
    renderStationList();
    renderLineList();
  };

  reader.readAsText(file);
}

//Clear map \\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function clearAll() {
  if (confirm("Are you sure you want to clear the whole map? All stations and lines will be erased.")) {
    stations.length = 0;
    lines.length = 0;
    draw();
    renderStationList();
    renderLineList();
  }
}


//Waarschuwing bij herladen --------------------------------------------------------

draw();
renderStationList();
renderLineList();

// window.addEventListener("beforeunload", function (e) {
//   e.preventDefault();
//   e.returnValue = "";
// });

