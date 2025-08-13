// ===== Version & basic elements =====
const version = "4.00.0";
document.querySelector("#version-text").textContent = "Version " + version;

// ===== State =====
let cellSize = 50;
let gridCols = 30;
let gridRows = 30;

const stations = [];
const lines = [];
const stationTypes = [
  { type: 1, name: "Station" },
  { type: 2, name: "Transfer station" },
  { type: 3, name: "Train station" },
  { type: 4, name: "Large train station" }
];

// ===== DOM =====
const svg = document.querySelector("#map");
const gGrid = document.querySelector("#layer-grid");
const gLines = document.querySelector("#layer-lines");
const gStations = document.querySelector("#layer-stations");
const gLabels = document.querySelector("#layer-labels");

const toggleAddStation = document.querySelector("#toggleAddStation");
const toggleShowGridLines = document.querySelector("#toggleShowGridLines");
const toggleShowCoordinates = document.querySelector("#toggleShowCoordinates");
const toggleShowStationNames = document.querySelector("#toggleShowStationNames");
const toggleShowLegend = document.querySelector("#toggleShowLegend");

// ===== Helpers =====
const lineWidthMap = { thin: 6, normal: 10, thick: 16 };
const lineStyleMap = {
  solid: "",
  dash: "20 14",
  dot: "3 10",
};

function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

function setSvgSize(){
  const w = gridCols * cellSize;
  const h = gridRows * cellSize;
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
}

function gridToPxX(x){ return x * cellSize; }
function gridToPxY(y){ return y * cellSize; }
function gridCenterX(x){ return x * cellSize + cellSize/2; }
function gridCenterY(y){ return y * cellSize + cellSize/2; }

function clearNode(node){ while(node.firstChild) node.removeChild(node.firstChild); }

// ===== Render: Grid & Coords =====
function drawGrid(){
  clearNode(gGrid);
  const w = gridCols * cellSize;
  const h = gridRows * cellSize;

  // background
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("x", 0); bg.setAttribute("y", 0);
  bg.setAttribute("width", w); bg.setAttribute("height", h);
  bg.setAttribute("fill", "#F7F4ED");
  gGrid.appendChild(bg);

  if (toggleShowGridLines.checked){
    const gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    gridGroup.setAttribute("stroke", "rgba(35,35,34,.2)");
    gridGroup.setAttribute("stroke-width", "1");

    // verticals
    for (let x=0; x<=gridCols; x++){
      const pos = gridToPxX(x) + (cellSize/2);
      const line = document.createElementNS("http://www.w3.org/2000/svg","line");
      line.setAttribute("x1", pos);
      line.setAttribute("x2", pos);
      line.setAttribute("y1", 0);
      line.setAttribute("y2", h);
      gridGroup.appendChild(line);
    }

    // horizontals
    for (let y=0; y<=gridRows; y++){
      const pos = gridToPxY(y) + (cellSize/2);
      const line = document.createElementNS("http://www.w3.org/2000/svg","line");
      line.setAttribute("x1", 0);
      line.setAttribute("x2", w);
      line.setAttribute("y1", pos);
      line.setAttribute("y2", pos);
      gridGroup.appendChild(line);
    }

    gGrid.appendChild(gridGroup);
  }

  if (toggleShowCoordinates.checked){
    // top row numbers
    for (let x=1; x<=gridCols; x++){
      const tx = document.createElementNS("http://www.w3.org/2000/svg", "text");
      tx.setAttribute("x", gridToPxX(x) + cellSize/2);
      tx.setAttribute("y", cellSize/2);
      tx.setAttribute("text-anchor", "middle");
      tx.setAttribute("dominant-baseline", "middle");
      tx.setAttribute("class", "coord-label");
      tx.textContent = x;
      gGrid.appendChild(tx);
    }
    // left col numbers
    for (let y=1; y<=gridRows; y++){
      const ty = document.createElementNS("http://www.w3.org/2000/svg", "text");
      ty.setAttribute("x", cellSize/2);
      ty.setAttribute("y", gridToPxY(y) + cellSize/2);
      ty.setAttribute("text-anchor", "middle");
      ty.setAttribute("dominant-baseline", "middle");
      ty.setAttribute("class", "coord-label");
      ty.textContent = y;
      gGrid.appendChild(ty);
    }
  }
}

// ===== Render: Lines =====
function drawLines(){
  clearNode(gLines);

  lines.forEach(line => {
    // bouw polyline in grid-center-punten (met "45-correctie" zoals je had)
    let points = [];
    let prev = null;

    line.stations.forEach(stationId => {
      const station = stations.find(s => s.id === stationId);
      if (!station) return;

      const x = gridCenterX(station.x);
      const y = gridCenterY(station.y);

      if (prev){
        const dx = x - prev.x;
        const dy = y - prev.y;
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);
        if (ax !== ay && dx !== 0 && dy !== 0){
          const corr = Math.min(ax, ay);
          const midX = prev.x + corr * Math.sign(dx);
          const midY = prev.y + corr * Math.sign(dy);
          points.push([midX, midY]);
        }
      }
      points.push([x,y]);
      prev = {x,y};
    });

    if (points.length < 2) return;

    const poly = document.createElementNS("http://www.w3.org/2000/svg","polyline");
    poly.setAttribute("data-role","line");
    poly.setAttribute("fill","none");
    poly.setAttribute("stroke", line.color || "#000");

    const style = lineStyleMap[line.style || "solid"] || "";
    if (style) poly.setAttribute("stroke-dasharray", style);

    const widthPx = lineWidthMap[line.width || "normal"] || 10;
    poly.setAttribute("stroke-width", widthPx);

    poly.setAttribute("points", points.map(p => p.join(",")).join(" "));
    gLines.appendChild(poly);
  });
}

// ===== Render: Stations & Labels =====
function drawStations(){
  clearNode(gStations);
  clearNode(gLabels);

  stations.forEach((st, idx) => {
    const cx = gridCenterX(st.x);
    const cy = gridCenterY(st.y);

    const group = document.createElementNS("http://www.w3.org/2000/svg","g");
    group.setAttribute("transform", `translate(${gridToPxX(st.x)}, ${gridToPxY(st.y)})`);
    group.setAttribute("data-role","station");
    group.setAttribute("data-index", idx);
    group.style.cursor = "pointer";

    // shape
    if (st.type == 1){
      const r = document.createElementNS("http://www.w3.org/2000/svg","rect");
      r.setAttribute("x", cellSize/4);
      r.setAttribute("y", cellSize/4);
      r.setAttribute("width", cellSize/2);
      r.setAttribute("height", cellSize/2);
      r.setAttribute("fill", "#232322");
      group.appendChild(r);
    } else if (st.type == 2){
      const r = document.createElementNS("http://www.w3.org/2000/svg","rect");
      r.setAttribute("x", cellSize/4);
      r.setAttribute("y", cellSize/4);
      r.setAttribute("width", cellSize/2);
      r.setAttribute("height", cellSize/2);
      r.setAttribute("fill", "#F7F4ED");
      r.setAttribute("stroke", "#232322");
      r.setAttribute("stroke-width", 10);
      group.appendChild(r);
    } else if (st.type == 3){
      const c = document.createElementNS("http://www.w3.org/2000/svg","circle");
      c.setAttribute("cx", cellSize/2);
      c.setAttribute("cy", cellSize/2);
      c.setAttribute("r", cellSize/4);
      c.setAttribute("fill", "#232322");
      group.appendChild(c);
    } else if (st.type == 4){
      const c = document.createElementNS("http://www.w3.org/2000/svg","circle");
      c.setAttribute("cx", cellSize/2);
      c.setAttribute("cy", cellSize/2);
      c.setAttribute("r", cellSize/4);
      c.setAttribute("fill", "#F7F4ED");
      c.setAttribute("stroke", "#232322");
      c.setAttribute("stroke-width", 10);
      group.appendChild(c);
    }

    group.addEventListener("click", () => editStation(idx));
    gStations.appendChild(group);

    // label
    if (toggleShowStationNames.checked){
      const text = document.createElementNS("http://www.w3.org/2000/svg","text");
      text.setAttribute("x", gridToPxX(st.x));
      text.setAttribute("y", gridToPxY(st.y));
      text.setAttribute("transform", `translate(35,5) rotate(-45 ${gridToPxX(st.x)} ${gridToPxY(st.y)})`);
      text.setAttribute("class","station-label");
      text.setAttribute("text-anchor","start");
      text.setAttribute("dominant-baseline","middle");
      text.textContent = st.name;
      gLabels.appendChild(text);
    }
  });
}

// ===== Render lists / legend =====
function renderStationList() {
  const stationList = document.querySelector('#station-list');
  stationList.innerHTML = '';

  stations.forEach((station, index) => {
    const li = document.createElement('li');
    const btn = document.createElement("button");
    btn.textContent = `✏️ ${station.name} (${station.x}, ${station.y})`;
    btn.addEventListener("click", () => editStation(index));
    li.appendChild(btn);
    stationList.appendChild(li);
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
    const btn = document.createElement("button");
    btn.textContent = `✏️ ${line.name}`;
    btn.addEventListener("click", () => openLinePopup(index));

    const dot = document.createElement("span");
    dot.style.cssText = "display:inline-block;width:.8rem;height:.8rem;border-radius:50%;margin-left:.5rem";
    dot.style.backgroundColor = line.color;
    btn.appendChild(dot);

    li.appendChild(btn);
    list.appendChild(li);
  });

  // legend
  lines.forEach(line => {
    const li = document.createElement("li");
    li.style.display = "flex"; li.style.alignItems = "center"; li.style.gap = "8px";
    const bar = document.createElement("span");
    bar.style.display = "inline-block";
    bar.style.width = "3rem";
    bar.style.height = ".8rem";
    bar.style.backgroundColor = line.color;
    if ((lineStyleMap[line.style||"solid"]||"") !== "") {
      bar.style.backgroundImage = "linear-gradient(90deg, rgba(255,255,255,.0) 0, rgba(255,255,255,.0) 50%, rgba(255,255,255,.0) 50%)";
      // (we laten alleen kleur zien; precieze dash in legend is optioneel)
    }
    li.appendChild(bar);
    li.appendChild(document.createTextNode(line.name));
    legend.appendChild(li);
  });

  document.body.classList.toggle("legend-hidden", !toggleShowLegend.checked);
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
    shape.style.cssText = "display:inline-block;width:1rem;height:1rem;margin-right:.5rem;vertical-align:-2px;";

    if (type === 1) {
      shape.style.backgroundColor = "#232322";
    } else if (type === 2) {
      shape.style.width = ".7rem"; shape.style.height = ".7rem";
      shape.style.border = ".2rem solid #232322";
      shape.style.backgroundColor = "#F7F4ED";
    } else if (type === 3) {
      shape.style.borderRadius = "50%";
      shape.style.backgroundColor = "#232322";
    } else if (type === 4) {
      shape.style.width = ".7rem"; shape.style.height = ".7rem";
      shape.style.border = ".2rem solid #232322"; shape.style.borderRadius = "50%";
      shape.style.backgroundColor = "#F7F4ED";
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
    saveBtn.addEventListener("click", () => {
      inputMap.forEach((input, type) => {
        const foundType = stationTypes.find(t => t.type === type);
        if (foundType) foundType.name = input.value;
      });
      renderUsedStationTypes();
    });
    controls.appendChild(saveBtn);
  }
}

// ===== Master draw =====
function draw(){
  setSvgSize();
  drawGrid();
  drawLines();
  drawStations();
  renderLineList();
}

// ===== Zoom & map size =====
function zoomIn(){
  if (cellSize < 100){ cellSize += 5; draw(); }
}
function zoomOut(){
  if (cellSize > Math.ceil(2100/(gridCols+gridRows))) { cellSize -= 5; draw(); }
}

document.querySelector("#zoomIn").addEventListener("click", zoomIn);
document.querySelector("#zoomOut").addEventListener("click", zoomOut);

document.querySelector("#mapWidthMin").addEventListener("click", () => { gridCols = Math.max(2, gridCols - 2); draw(); });
document.querySelector("#mapWidthPlus").addEventListener("click", () => { gridCols += 2; draw(); });
document.querySelector("#mapHeightMin").addEventListener("click", () => { gridRows = Math.max(2, gridRows - 2); draw(); });
document.querySelector("#mapHeightPlus").addEventListener("click", () => { gridRows += 2; draw(); });

// ===== Map click: add station =====
svg.addEventListener("click", (e) => {
  if (!toggleAddStation.checked) return;

  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const ctm = svg.getScreenCTM().inverse();
  const loc = pt.matrixTransform(ctm);

  const col = Math.floor(loc.x / cellSize);
  const row = Math.floor(loc.y / cellSize);

  if (col < 0 || row < 0 || col >= gridCols || row >= gridRows) return;

  const exists = stations.some(s => s.x == col && s.y == row);
  if (!exists){
    stations.push({
      id: Date.now(),
      name: `Station ${stations.length + 1}`,
      x: col, y: row, lines: [], type: 1,
    });
    renderStationList();
    draw();
  }
});

// ===== Station editing =====
let selectedStationIndex = null;

function editStation(index){
  selectedStationIndex = index;
  const s = stations[index];
  document.querySelector('#station-name-input').value = s.name;
  document.querySelector('#station-type-input').value = s.type;
  document.querySelector('#station-x-input').value = s.x;
  document.querySelector('#station-y-input').value = s.y;
  document.querySelector('#station-popup').classList.remove('hidden');
}

document.querySelector("#btn-savestationedits").addEventListener("click", () => {
  if (selectedStationIndex === null) return;
  const s = stations[selectedStationIndex];
  s.name = document.querySelector('#station-name-input').value;
  s.type = parseInt(document.querySelector('#station-type-input').value,10);
  s.x = parseInt(document.querySelector('#station-x-input').value,10);
  s.y = parseInt(document.querySelector('#station-y-input').value,10);
  renderStationList();
  draw();
  closeStationPopup();
});

document.querySelector("#btn-deletestation").addEventListener("click", () => {
  if (selectedStationIndex === null) return;
  const deleted = stations[selectedStationIndex];
  // verwijder station id uit alle lijnen
  lines.forEach(line => {
    line.stations = line.stations.filter(id => id !== deleted.id);
  });
  stations.splice(selectedStationIndex, 1);
  renderStationList();
  draw();
  closeStationPopup();
});

document.querySelector("#btn-closepopup").addEventListener("click", closeStationPopup);
function closeStationPopup(){
  document.querySelector('#station-popup').classList.add('hidden');
  selectedStationIndex = null;
}

// ===== Lines editing =====
let selectedLineIndex = null;

function openLinePopup(index){
  selectedLineIndex = index;
  const line = lines[index];
  document.querySelector("#line-name-input").value = line.name || "";
  document.querySelector("#line-color-input").value = line.color || "#000000";
  document.querySelector("#line-style-input").value = line.style || "solid";
  document.querySelector("#line-width-input").value = line.width || "normal";
  document.querySelector("#line-popup").classList.remove("hidden");

  renderEditStationSelectOptions();
  renderEditableStationList();
}

document.querySelector("#btn-closelinepopup").addEventListener("click", closeLinePopup);
function closeLinePopup(){
  document.querySelector("#line-popup").classList.add("hidden");
  selectedLineIndex = null;
}

document.querySelector("#btn-savelineedits").addEventListener("click", () => {
  if (selectedLineIndex === null) return;
  const line = lines[selectedLineIndex];
  line.name = document.querySelector("#line-name-input").value;
  line.color = document.querySelector("#line-color-input").value;
  line.style = document.querySelector("#line-style-input").value;
  line.width = document.querySelector("#line-width-input").value;

  renderLineList();
  draw();
  closeLinePopup();
});

document.querySelector("#btn-deleteline").addEventListener("click", () => {
  if (selectedLineIndex === null) return;
  lines.splice(selectedLineIndex, 1);
  renderLineList();
  draw();
  closeLinePopup();
});

function renderEditStationSelectOptions(){
  const select = document.querySelector("#stationSelect");
  select.innerHTML = "";
  stations.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name;
    select.appendChild(opt);
  });
}

function renderEditableStationList(){
  const tbody = document.querySelector("#stationList");
  tbody.innerHTML = "";
  if (selectedLineIndex === null) return;
  const line = lines[selectedLineIndex];

  line.stations.forEach((stationId, index) => {
    const st = stations.find(s => s.id === stationId);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <th>${st ? st.name : "(missing station)"}</th>
      <td>
        <button data-act="up" data-idx="${index}">⬆️</button>
        <button data-act="down" data-idx="${index}">⬇️</button>
        <button data-act="del" data-idx="${index}">❌</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const act = e.currentTarget.getAttribute("data-act");
      const idx = parseInt(e.currentTarget.getAttribute("data-idx"),10);
      if (act === "del") removeStationFromLine(idx);
      if (act === "up") moveStationInLine(idx, -1);
      if (act === "down") moveStationInLine(idx, +1);
    });
  });
}

document.querySelector("#btn-addstationtoline").addEventListener("click", () => {
  const id = parseInt(document.querySelector("#stationSelect").value,10);
  if (selectedLineIndex === null) return;
  const line = lines[selectedLineIndex];
  if (!line.stations.includes(id)){
    line.stations.push(id);
    renderEditableStationList();
    draw();
  }
});

function removeStationFromLine(index){
  if (selectedLineIndex === null) return;
  const line = lines[selectedLineIndex];
  line.stations.splice(index,1);
  renderEditableStationList();
  draw();
}

function moveStationInLine(index, dir){
  if (selectedLineIndex === null) return;
  const line = lines[selectedLineIndex];
  const ni = index + dir;
  if (ni < 0 || ni >= line.stations.length) return;
  [line.stations[index], line.stations[ni]] = [line.stations[ni], line.stations[index]];
  renderEditableStationList();
  draw();
}

// Add line
document.querySelector("#btn-addline").addEventListener("click", () => {
  const color = "#"+Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,"0");
  const lineNumber = lines.length + 1;
  lines.push({
    name: `Line ${lineNumber}`,
    color,
    style: "solid",
    width: "normal",
    stations: [],
  });
  renderLineList();
  draw();
});

// ===== Toggles =====
toggleShowGridLines.addEventListener("change", draw);
toggleShowCoordinates.addEventListener("change", draw);
toggleShowLegend.addEventListener("change", renderLineList);
toggleShowStationNames.addEventListener("change", draw);

// ===== Export / Import =====
document.querySelector("#export-json-btn").addEventListener("click", () => {
  const info = "Transit Map Maker version " + version + ", Made by Bence (bencebarens.nl)";
  const date = Date.now();
  const data = {
    info, date, version, stations, lines, stationTypes,
    cellSize, gridCols, gridRows
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "My Transit Map.json";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

document.querySelector("#export-png-btn").addEventListener("click", async () => {
  // SVG → PNG
  const w = gridCols * cellSize;
  const h = gridRows * cellSize;
  const xml = new XMLSerializer().serializeToString(svg);
  const svg64 = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const link = document.createElement("a");
    link.download = "My Transit Map.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
  img.src = svg64;
});

// import (file)
document.querySelectorAll(".import-json").forEach(input => {
  input.addEventListener("change", importMapData);
});

function importMapData(ev){
  const file = ev.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try{
      const data = JSON.parse(e.target.result);
      if (!data.info || !data.info.startsWith("Transit Map Maker")){
        alert("This JSON file doesn't seem to originate from Transit Map Maker.");
        return;
      }
      stations.length = 0; lines.length = 0; stationTypes.length = 0;

      data.stations?.forEach(st => stations.push(st));
      data.lines?.forEach(ln => lines.push(ln));
      data.stationTypes?.forEach(t => stationTypes.push(t));

      cellSize = data.cellSize ?? cellSize;
      gridCols = data.gridCols ?? gridCols;
      gridRows = data.gridRows ?? gridRows;

      renderStationList();
      draw();
    }catch(err){
      alert("This file seems to be corrupt.");
    }
  };
  reader.readAsText(file);
}

// ===== Clear / Changelog =====
document.querySelector("#btn-clearall").addEventListener("click", () => {
  if (confirm("Are you sure you want to start over? All existing stations and lines will be erased and saved data will be deleted.")){
    stations.length = 0; lines.length = 0;
    localStorage.removeItem("savedMapData");
    renderStationList();
    draw();
  }
});

document.querySelector("#btn-changelog").addEventListener("click", () => {
  document.querySelector("#change-log-popup").classList.remove("hidden");
});
document.querySelector("#btn-closechangelog").addEventListener("click", () => {
  document.querySelector("#change-log-popup").classList.add("hidden");
});

// ===== Load examples (paths moeten bestaan) =====
document.querySelector("#intro-option-2").addEventListener("click", () => {
  loadMetroData("example/ams-metro.json");
});
document.querySelector("#intro-option-3").addEventListener("click", () => {
  loadMetroData("example/bud-metro.json");
});

function loadMetroData(path){
  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      stations.length = 0; lines.length = 0; stationTypes.length = 0;

      data.stations?.forEach(st => stations.push(st));
      data.lines?.forEach(ln => lines.push(ln));
      data.stationTypes?.forEach(t => stationTypes.push(t));

      cellSize = data.cellSize ?? cellSize;
      gridCols = data.gridCols ?? gridCols;
      gridRows = data.gridRows ?? gridRows;

      renderStationList();
      draw();
    })
    .catch(err => alert("Error loading example: " + err.message));
}

// ===== Autosave on unload & restore on load =====
window.addEventListener("beforeunload", () => {
  const date = Date.now();
  const data = {
    stations, lines, stationTypes, cellSize, gridCols, gridRows, date
  };
  localStorage.setItem("savedMapData", JSON.stringify(data));
});

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  draw();
  renderStationList();

  const saved = localStorage.getItem("savedMapData");
  if (saved){
    try{
      const data = JSON.parse(saved);
      stations.length = 0; lines.length = 0; stationTypes.length = 0;
      data.stations?.forEach(st => stations.push(st));
      data.lines?.forEach(ln => lines.push(ln));
      data.stationTypes?.forEach(t => stationTypes.push(t));

      cellSize = data.cellSize ?? cellSize;
      gridCols = data.gridCols ?? gridCols;
      gridRows = data.gridRows ?? gridRows;

      renderStationList();
      draw();
    }catch{}
  }
});
