const version = "3.10.0";
document.querySelector("#version-text").innerHTML = "Version " + version;

const canvas = document.querySelector("#canvas");
const c = canvas.getContext("2d");

const stations = [];


const lines = [];

const stationTypes = [
  {type: 1, name: "Station"},
  {type: 2, name: "Transfer station"},
  {type: 3, name: "Train station"},
  {type: 4, name: "Large train station"}
];

let cellSize = 50;
let gridCols = 30;
let gridRows = 30;

function resizeCanvas() { 
  canvas.width = gridCols * cellSize;
  canvas.height = gridRows * cellSize;
}

document.querySelector("#mapWidthMin").addEventListener("click", widthMin);
document.querySelector("#mapWidthPlus").addEventListener("click", widthPlus);
document.querySelector("#mapHeightMin").addEventListener("click", heightMin);
document.querySelector("#mapHeightPlus").addEventListener("click", heightPlus);

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

  if (toggleShowGridLines.checked) {
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

  if (toggleShowCoordinates.checked) {
    c.fillStyle = "rgba(0, 0, 0, 0.5)";
    c.font = "1rem Inter, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";

    for (let x = 1; x <= gridCols; x++) {
      const xPos = x * cellSize + (cellSize / 2);
      c.fillText(x, xPos, cellSize/2);
    }
    for (let y = 1; y <= gridRows; y++) {
      const yPos = y * cellSize + (cellSize / 2);
      c.fillText(y, cellSize/2, yPos);
    }
  }
  c.stroke;
}

function drawLines() {
  lines.forEach(line => {
    c.strokeStyle = line.color;
    if (line.width === "thin") {
      c.lineWidth = 4;
    } else if (line.width === "thick") {
      c.lineWidth = 14;
    } else {
      c.lineWidth = 8;
    }

    if (line.style === "dashed") {
      c.setLineDash([10, 5]);
    } else if (line.style === "dotted") {
      c.setLineDash([2, 4]);
    } else {
      c.setLineDash([]);
    }
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
    c.setLineDash([]);
  });
}

function drawStations() {
  stations.forEach(station => {
    const x = station.x * cellSize;
    const y = station.y * cellSize;
    c.beginPath();
    
    if(station.type == 1) {
      c.fillStyle = "#232322";
      c.rect(x + cellSize / 4, y + cellSize / 4, cellSize / 2, cellSize / 2);
      c.fill();
    }

    if(station.type == 2) {
      c.strokeStyle = "#232322";
      c.rect(x + cellSize / 4, y + cellSize / 4, cellSize / 2, cellSize / 2);
      c.lineWidth = 10;
      c.stroke();
      c.fillStyle = "#F7F4ED";
      c.fill();
    }

    if (station.type == 3) {
      c.fillStyle = "#232322";
      c.beginPath();
      c.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
      c.fill();
    }

    if (station.type == 4) {
      c.strokeStyle = "#232322";
      c.lineWidth = 10;
      c.beginPath();
      c.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = "#F7F4ED";
      c.fill();
    }
    
    if (toggleShowStationNames.checked) {
      c.beginPath();
      c.fillStyle = "#232322";
      c.strokeStyle = "#F7F4ED";
      c.save();
      c.translate(x, y);
      c.rotate(-45 * Math.PI / 180);
      c.font = "1rem Inter, sans-serif";
      c.textAlign = "left";
      c.textBaseline = "middle";
      c.strokeText(station.name, 15, 15);
      c.fillText(station.name, 15, 15);
      c.restore();
    }
  });
  c.stroke;
}


function draw() {
  resizeCanvas();
  drawGrid();
  drawLines();
  drawStations();
  console.log("Draw executed");
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

  renderUsedStationTypes();
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

function renderUsedStationTypes() {
  const controls = document.querySelector("#controls-legend-list");
  const legend = document.querySelector("#legend-station-list");
  legend.innerHTML = "";
  controls.innerHTML = "";

  const inputMap = new Map();

  stationTypes.forEach(({ type, name }) => {
    const isUsed = stations.some(s => s.type === type);
    if (!isUsed) return;

    const shape = document.createElement("span");
    shape.style.cssText = "display:inline-block;width:1rem;height:1rem;margin-right:.5rem";

    if (type === 1) {
      shape.style.backgroundColor = "#232322";
    } else if (type === 2) {
      shape.style.cssText += ";width:.7rem;height:.7rem;border:.2rem solid #232322";
    } else if (type === 3) {
      shape.style.borderRadius = "50%";
      shape.style.backgroundColor = "#232322";
    } else if (type === 4) {
      shape.style.cssText += ";width:.7rem;height:.7rem;border:.2rem solid #232322;border-radius:50%";
    }

    const legendItem = document.createElement("li");
    legendItem.append(shape.cloneNode(true), document.createTextNode(name));
    legend.appendChild(legendItem);

    const controlsItem = document.createElement("li");
    controlsItem.id = `controls-legend-list-${type}`;

    const input = document.createElement("input");
    input.type = "text";
    input.value = name;
    input.style.marginLeft = ".5rem";

    inputMap.set(type, input);

    controlsItem.append(shape.cloneNode(true), input);
    controls.appendChild(controlsItem);
  });

  if (inputMap.size > 0) {
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save changes";
    saveBtn.style.marginTop = "1rem";

    saveBtn.onclick = () => {
      inputMap.forEach((input, type) => {
        const foundType = stationTypes.find(t => t.type === type);
        if (foundType) foundType.name = input.value;
      });
      renderUsedStationTypes();
    };

    controls.appendChild(saveBtn);
  }
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
  document.querySelector("#line-style-input").value = line.style || "solid";
  document.querySelector("#line-width-input").value = line.width || "normal";

  renderEditStationSelectOptions();
  renderEditableStationList();
}

document.querySelector("#btn-closelinepopup").addEventListener("click", closeLinePopup);

function closeLinePopup() {
  document.querySelector("#line-popup").classList.add("hidden");
  selectedLineIndex = null;
}

document.querySelector("#btn-savelineedits").addEventListener("click", saveLineEdits);

function saveLineEdits() {
  if (selectedLineIndex === null) return;
  const name = document.querySelector("#line-name-input").value;
  const color = document.querySelector("#line-color-input").value;
  const style = document.querySelector("#line-style-input").value;
  const width = document.querySelector("#line-width-input").value;

  lines[selectedLineIndex].name = name;
  lines[selectedLineIndex].color = color;
  lines[selectedLineIndex].style = style;
  lines[selectedLineIndex].width = width;

  renderLineList();
  closeLinePopup();
  draw();
}

document.querySelector("#btn-deleteline").addEventListener("click", deleteLine);

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

document.querySelector("#btn-addstationtoline").addEventListener("click", addStationToLine);

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
      style: "solid",
      width: "normal",
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
    document.querySelector("#controls-legend-list").style.display = "block";
  } else {
    document.querySelector("#legend").style.display = "none";
    document.querySelector("#controls-legend-list").style.display = "none";
  }
});

//Edit stations \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
let selectedStationIndex = null;

function editStation(index) {
  selectedStationIndex = index;
  const station = stations[index];

  document.querySelector('#station-name-input').value = station.name;
  document.querySelector('#station-type-input').value = station.type;
  document.querySelector('#station-x-input').value = station.x;
  document.querySelector('#station-y-input').value = station.y;
  document.querySelector('#station-popup').classList.remove('hidden');
}

document.querySelector("#btn-savestationedits").addEventListener("click", saveStationEdits);

function saveStationEdits() {
  if (selectedStationIndex !== null) {
    stations[selectedStationIndex].name = document.querySelector('#station-name-input').value;
    stations[selectedStationIndex].x = document.querySelector('#station-x-input').value;
    stations[selectedStationIndex].y = document.querySelector('#station-y-input').value;
    stations[selectedStationIndex].type = parseInt(document.querySelector('#station-type-input').value, 10);
    renderStationList();
    draw();
    closePopup();
  }
}

document.querySelector("#btn-deletestation").addEventListener("click", deleteStation);

function deleteStation() {
  if (selectedStationIndex !== null) {
    const deletedStation = stations[selectedStationIndex];

    lines.forEach(line => {
      line.stations = line.stations.filter(id => id !== deletedStation.id);
    });

    stations.splice(selectedStationIndex, 1);

    renderStationList();
    draw();
    closePopup();
  }
}

document.querySelector("#btn-closepopup").addEventListener("click", closePopup);

function closePopup() {
  document.querySelector('#station-popup').classList.add('hidden');
  selectedStationIndex = null;
}

//Export as JPG \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
document.querySelector("#export-btn").addEventListener("click", () => {
  cellSizeBefore = cellSize;
  cellSize = 50;
  draw();
  const link = document.createElement("a");
  link.download = "My Transit Map.jpg";
  link.href = canvas.toDataURL("image/jpeg");
  link.click();
  cellSize = cellSizeBefore;
  draw();
});

//Export as JSON \\\\\\\\\\\\\\\\\\\\\\\\
document.querySelector("#export-json-btn").addEventListener("click", () => {
  exportMapData();
});

function exportMapData() {
  const info = "Transit Map Maker version " + version + ", Made by Bence (bencebarens.nl)";
  const date = Date.now();
  const data = {
    info,
    date,
    version,
    stations,
    lines,
    stationTypes,
    cellSize,
    gridCols,
    gridRows
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'My Transit Map.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

//Export as URL \\\\\\\\\\\\\\\\\\\\\

function toBase64Url(uint8Array) {
  return btoa(String.fromCharCode(...uint8Array))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4 !== 0) str += "=";
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

document.querySelector("#share-btn").addEventListener("click", () => {
  const data = {
    s: stations,
    l: lines,
    t: stationTypes,
    w: gridCols,
    h: gridRows,
    c: cellSize
  };

  const compressed = pako.deflateRaw(JSON.stringify(data));
  const encoded = toBase64Url(compressed);
  const url = `${location.origin}${location.pathname}?data=${encoded}`;

  if (url.length > 2000) {
    alert("Sorry, this map is too large to share via a link (max URL-size is 2000 characters). Please exporting the map as a JSON file or image instead.");
    return;
  }

  prompt("To share this map online, copy this URL:", url);
});


//Import JSON \\\\\\\\\\\\\\\\\\\\\\\\
document.querySelectorAll(".import-json").forEach(input => {
  input.addEventListener("change", importMapData);
});


function importMapData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);

      if (!data.info || !data.info.startsWith("Transit Map Maker")) {
        alert("This JSON file doens't seem to originate from Transit Map Maker. Please make sure you selected the right file.");
        return;
      }

      stations.length = 0;
      lines.length = 0;
      stationTypes.length = 0;

      data.stations?.forEach(station => stations.push(station));
      data.lines?.forEach(line => lines.push(line));
      data.stationTypes?.forEach(type => stationTypes.push(type));

      gridCols = data.gridCols;
      gridRows = data.gridRows;

      draw();
      renderStationList();
      renderLineList();
      closeTutorialPopup();
    } catch (err) {
      alert("This file seems to be corrupt. Please make sure that no changes where made to the file directly.");
    }
  };

  reader.readAsText(file);
}

//Show grid lines \\\\\\\\\\\\\\\\\\\\\\\
const toggleShowGridLines = document.querySelector('#toggleShowGridLines');
toggleShowGridLines.addEventListener('change', function() {
  draw();
});

const toggleShowStationNames = document.querySelector('#toggleShowStationNames');
toggleShowStationNames.addEventListener('change', function(){
  draw();
})

const toggleShowCoordinates = document.querySelector('#toggleShowCoordinates');
toggleShowCoordinates.addEventListener('change', function(){
  draw();
})

//Clear map \\\\\\\\\\\\\\\\\\\\\\\\\\\\\
document.querySelector("#btn-clearall").addEventListener("click", clearAll);

function clearAll() {
  if (confirm("Are you sure you want to start over? All existing stations and lines will be erased and saved data will be deleted.")) {
    stations.length = 0;
    lines.length = 0;
    draw();
    renderStationList();
    renderLineList();
    localStorage.removeItem("savedMapData");
    closeTutorialPopup();
  }
}

// Tutorial ------------------------------------------------------------------------
function showTutorialPopup() {
  const popup = document.getElementById('tutorial-popup');
  if (popup) popup.classList.remove('hidden');
}

document.querySelector("#intro-option-1").addEventListener("click", clearAll);
document.querySelector("#intro-option-4").addEventListener("click", closeTutorialPopup);
document.querySelector("#btn-closetutorial").addEventListener("click", closeTutorialPopup);
function closeTutorialPopup() {
  const popup = document.getElementById('tutorial-popup');
  if (popup) popup.classList.add('hidden');
}

document.querySelector("#intro-option-2").addEventListener("click", () => {
  loadMetroData("example/ams-metro.json");
});

document.querySelector("#intro-option-3").addEventListener("click", () => {
  loadMetroData("example/bud-metro.json");
});


function loadMetroData(path) {
  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      stations.length = 0;
      lines.length = 0;
      stationTypes.length = 0;

      data.stations?.forEach(station => stations.push(station));
      data.lines?.forEach(line => lines.push(line));
      data.stationTypes?.forEach(type => stationTypes.push(type));

      cellSize = data.cellSize;
      gridCols = data.gridCols;
      gridRows = data.gridRows;

      draw();
      renderStationList();
      renderLineList();
      closeTutorialPopup();
    })
}

//Autosave data ------------------------------------------------------------------------

window.addEventListener("beforeunload", (e) => {
  const date = Date.now();
  const data = {
    stations,
    lines,
    stationTypes,
    cellSize,
    gridCols,
    gridRows,
    date
  };
  localStorage.setItem("savedMapData", JSON.stringify(data));
});

//Change log ------------------------------------------------------------------------

function showChangeLog(){
  const changeLogPopup = document.querySelector("#change-log-popup");
  changeLogPopup.classList.remove('hidden');
}

document.querySelector("#btn-closechangelog").addEventListener("click", closeChangeLog);
function closeChangeLog(){
  const changeLogPopup = document.querySelector("#change-log-popup");
  changeLogPopup.classList.add('hidden');
}

//Initiatie ------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  draw();
  renderStationList();
  renderLineList();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("data")) {
    try {
      const encoded = urlParams.get("data");
      const compressed = fromBase64Url(encoded);
      const json = pako.inflateRaw(compressed, { to: "string" });
      const data = JSON.parse(json);

      stations.length = 0;
      lines.length = 0;
      stationTypes.length = 0;

      data.s?.forEach(station => stations.push(station));
      data.l?.forEach(line => lines.push(line));
      data.t?.forEach(type => stationTypes.push(type));
      gridCols = data.w;
      gridRows = data.h;
      cellSize = data.c;

      draw();
      renderStationList();
      renderLineList();
      closeTutorialPopup();
    } catch (err) {
      alert("Sorry, something went wrong when loading this map.");
      initator();
    }
  }
  else{
    initator();
  }
});

function initator(){
if (localStorage.getItem('hideTutorial') !== 'true') {
  showTutorialPopup();
}

  const dontShowAgainBtn = document.querySelector('#dont-show-again');
  if (dontShowAgainBtn) {
    dontShowAgainBtn.addEventListener('click', () => {
      localStorage.setItem('hideTutorial', 'true');
      closeTutorialPopup();
    });
  }

  const savedData = localStorage.getItem("savedMapData");
  if (savedData) {
    const data = JSON.parse(savedData);
    stations.length = 0;
    lines.length = 0;
    stationTypes.length = 0;

    document.querySelector("#intro-option-4").classList.remove("hidden");

    data.stations?.forEach(station => stations.push(station));
    data.lines?.forEach(line => lines.push(line));
    data.stationTypes?.forEach(type => stationTypes.push(type));

    cellSize = data.cellSize;
    gridCols = data.gridCols;
    gridRows = data.gridRows;
    draw();
    renderStationList();
    renderLineList();
  }
}