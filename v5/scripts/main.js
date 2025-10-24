// ===== Version & basic elements =====
const version = "5.00.4";
document.querySelector("#version-text").textContent = "Version " + version;
document.querySelector("#version-text2").textContent = "Version " + version;

// ===== State =====
let cellSize = 35;
let gridCols = 30;
let gridRows = 30;

const maxGridCols = 120;
const maxGridRows = 120;

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

// ===== Rendering =====
let renderScheduled = false;

function scheduleRender() {
  if (!renderScheduled) {
    renderScheduled = true;
    requestAnimationFrame(() => {
      draw();
      renderScheduled = false;
    });
  }
}

function draw(){
  setSvgSize();
  drawGrid();
  drawLines();
  drawStations();
  renderLineList();
}

// ===== Helpers =====
const lineWidthMap = { thin: 6, normal: 8, thick: 12 };
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

// ==== stations.push and lines.push ====

function addStation(station){
  stations.push(station)
  if (!window.startHidden && (stations.length > 0 || lines.length > 0)) {
    hideGetStarted()
    window.startHidden = true
  }
}

function addLine(line){
  lines.push(line)
  if (!window.startHidden && (stations.length > 0 || lines.length > 0)) {
    hideGetStarted()
    window.startHidden = true
  }
}

// ===== Render lists / legend =====
function renderStationList() {
  const stationList = document.querySelector('#station-list');
  stationList.innerHTML = '';
  stations.sort((a, b) => a.name.localeCompare(b.name));

  stations.forEach((station, index) => {
    const li = document.createElement('li');
    const btn = document.createElement("button");
    btn.textContent = `${station.name} (${station.x}, ${station.y})`;
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

  lines.sort((a, b) => a.name.localeCompare(b.name));
  lines.forEach((line, index) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = `${line.name}`;
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
    li.style.display = "flex"; li.style.alignItems = "center"; li.style.gap = "1rem";
    const bar = document.createElement("span");
    bar.style.display = "inline-block";
    bar.style.width = "3rem";
    bar.style.height = ".8rem";
    bar.style.backgroundColor = line.color;
    if ((lineStyleMap[line.style||"solid"]||"") !== "") {
      bar.style.backgroundImage = "linear-gradient(90deg, rgba(255,255,255,.0) 0, rgba(255,255,255,.0) 50%, rgba(255,255,255,.0) 50%)";
    }
    li.appendChild(bar);
    li.appendChild(document.createTextNode(line.name));
    legend.appendChild(li);
  });

  document.querySelector("#legend").classList.toggle("hidden", !toggleShowLegend.checked);
}

function renderUsedStationTypes() {
  const controls = document.querySelector("#controls-legend-list");
  const legend = document.querySelector("#legend-station-list");
  legend.innerHTML = "";
  controls.innerHTML = "";

  const inputMap = new Map();

  stationTypes.forEach(({ type, name }) => {
    // check of er stations van dit type bestaan
    const isUsed = stations.some(s => Number(s.type) === Number(type));
    if (!isUsed) return;

    const shape = document.createElement("span");
    shape.style.cssText = "display:inline-block;width:1rem;height:1rem;margin-right:.5rem;vertical-align:-2px;";

    Object.assign(shape.style, getStationStyle(type));

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
        const foundType = stationTypes.find(t => Number(t.type) === Number(type));
        if (foundType) foundType.name = input.value;
      });
      renderUsedStationTypes();
    });
    controls.appendChild(saveBtn);
  }
}

// ===== Map size =====

function updateMapInfo() {
  document.querySelector("#map-width").textContent = gridCols;
  document.querySelector("#map-height").textContent = gridRows;
}

document.querySelector("#mapWidthMin").addEventListener("click", () => { gridCols = Math.max(2, gridCols - 2); scheduleRender(); updateMapInfo();});
document.querySelector("#mapWidthPlus").addEventListener("click", () => { gridCols += 2; scheduleRender(); updateMapInfo();});
document.querySelector("#mapHeightMin").addEventListener("click", () => { gridRows = Math.max(2, gridRows - 2); scheduleRender(); updateMapInfo();});
document.querySelector("#mapHeightPlus").addEventListener("click", () => { gridRows += 2; scheduleRender(); updateMapInfo();});

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
    addStation({
      id: "l"+(Date.now()-1757416518623).toString(36), 
      name: `Station ${stations.length + 1}`,
      x: col, y: row, lines: [], type: 1,
    });
    renderStationList();
    scheduleRender();
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
  document.getElementById("dialog-station").showModal();

}

document.querySelector("#btn-savestationedits").addEventListener("click", () => {
  if (selectedStationIndex === null) return;
  const s = stations[selectedStationIndex];
  s.name = document.querySelector('#station-name-input').value;
  s.type = parseInt(document.querySelector('#station-type-input').value,10);
  s.x = parseInt(document.querySelector('#station-x-input').value,10);
  s.y = parseInt(document.querySelector('#station-y-input').value,10);
  renderStationList();
  scheduleRender();
  closeStationPopup();
});

document.querySelector("#btn-deletestation").addEventListener("click", () => {
  if (selectedStationIndex === null) return;
  const deleted = stations[selectedStationIndex];
  lines.forEach(line => {
    line.stations = line.stations.filter(id => id !== deleted.id);
  });
  stations.splice(selectedStationIndex, 1);
  renderStationList();
  scheduleRender();
  closeStationPopup();
});

document.querySelector("#btn-closepopup").addEventListener("click", closeStationPopup);
function closeStationPopup(){
  document.getElementById("dialog-station").close();
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
  document.getElementById("dialog-line").showModal();


  renderEditStationSelectOptions(line);
  renderEditableStationList();
}

document.querySelector("#btn-closelinepopup").addEventListener("click", closeLinePopup);
function closeLinePopup(){
  document.getElementById("dialog-line").close();
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
  scheduleRender();
  closeLinePopup();
});

document.querySelector("#btn-deleteline").addEventListener("click", () => {
  if (selectedLineIndex === null) return;
  lines.splice(selectedLineIndex, 1);
  renderLineList();
  scheduleRender();
  closeLinePopup();
});

function renderEditStationSelectOptions(line){
  const select = document.querySelector("#stationSelect");
  select.innerHTML = "";
  stations
    .filter(s => !line.stations.includes(s.id))
    .forEach(s => {
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
        <button data-act="up" data-idx="${index}"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M444-192v-438L243-429l-51-51 288-288 288 288-51 51-201-201v438h-72Z"/></svg></button>
        <button data-act="down" data-idx="${index}"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M444-768v438L243-531l-51 51 288 288 288-288-51-51-201 201v-438h-72Z"/></svg></button>
        <button data-act="del" data-idx="${index}"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z"/></svg></button>
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
  const id = document.querySelector("#stationSelect").value;
  if (selectedLineIndex === null) return;
  const line = lines[selectedLineIndex];
  if (!line.stations.includes(id)) {
    line.stations.push(id);
    renderEditableStationList();
    scheduleRender();
  }
});

function removeStationFromLine(index){
  if (selectedLineIndex === null) return;
  const line = lines[selectedLineIndex];
  line.stations.splice(index,1);
  renderEditableStationList();
  scheduleRender();
}

function moveStationInLine(index, dir){
  if (selectedLineIndex === null) return;
  const line = lines[selectedLineIndex];
  const ni = index + dir;
  if (ni < 0 || ni >= line.stations.length) return;
  [line.stations[index], line.stations[ni]] = [line.stations[ni], line.stations[index]];
  renderEditableStationList();
  scheduleRender();
}

// Add line
document.querySelector("#btn-addline").addEventListener("click", () => {
  const color = "#"+Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,"0");
  const lineNumber = lines.length + 1;
  addLine({
    name: `Line ${lineNumber}`,
    color,
    style: "solid",
    width: "normal",
    stations: [],
  });
  renderLineList();
  scheduleRender();
});

// ===== Toggles =====
toggleShowGridLines.addEventListener("change", draw);
toggleShowCoordinates.addEventListener("change", draw);
toggleShowLegend.addEventListener("change", renderLineList);
toggleShowStationNames.addEventListener("change", draw);

// ===== Export / Import =====
let selectedLegendPosition = "br";
let legendPosition = {x: 0, y: 0};

document.querySelectorAll('input[name="legend-position"]').forEach(radio => {
  radio.addEventListener("change", () => {
    selectedLegendPosition = radio.value;
    generateExportPreview();
  });
});

document.querySelector("#btn-export").addEventListener("click", () => {
  generateExportPreview();
});

let exportPreviewDataURL = null;

function generateExportPreview() {
  scheduleRender();

  const svg = document.getElementById("map");
  const clone = svg.cloneNode(true);

  // Add legend
  const legend = document.getElementById("legend");
  
  if (legend) {
    const bbox = legend.getBoundingClientRect();

    const svgWidth = svg.viewBox.baseVal.width || svg.clientWidth;
    const svgHeight = svg.viewBox.baseVal.height || svg.clientHeight;
    const offset = 32;

    switch (selectedLegendPosition) {
      case "none":
        legendPosition = {x: svgWidth + offset, y: offset};
        break;
      case "tl":
        legendPosition = {x: offset, y: offset};
        break;
      case "tr":
        legendPosition = {x: svgWidth - bbox.width - offset, y: offset};
        break;
      case "bl":
        legendPosition = {x: offset, y: svgHeight - bbox.height - offset*1.5};
        break;
      case "br":
        legendPosition = {x: svgWidth - bbox.width - offset, y: svgHeight - bbox.height - offset*1.5};
        break;
    }

    const foreign = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    foreign.setAttribute("x", legendPosition.x);
    foreign.setAttribute("y", legendPosition.y);
    foreign.setAttribute("width", bbox.width);
    foreign.setAttribute("height", bbox.height + offset);

    const legendClone = legend.cloneNode(true);
    legendClone.style.position = "static";
    foreign.appendChild(legendClone);
    clone.appendChild(foreign);
  }

  // CSS inline
  const css = Array.from(document.styleSheets)
    .map(ss => {
      try { return Array.from(ss.cssRules).map(r => r.cssText).join("\n"); }
      catch (e) { return ""; }
    }).join("\n");

  const styleElem = document.createElement("style");
  styleElem.textContent = css;
  clone.insertBefore(styleElem, clone.firstChild);

  const xml = new XMLSerializer().serializeToString(clone);
  const svg64 = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = gridCols * cellSize;
    canvas.height = gridRows * cellSize;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#F7F4ED";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const previewImg = document.getElementById("export-preview-img");
    exportPreviewDataURL = canvas.toDataURL("image/png");
    previewImg.src = exportPreviewDataURL;

    scheduleRender();
  };

  img.onerror = () => {
    alert("Couldn't generate preview.");
    scheduleRender();
  };

  img.src = svg64;
}

generateExportPreview();

document.querySelector("#export-json-btn").addEventListener("click", () => {
  const info = "Transit Map Maker version " + version + ", Made by Bence (bencebarens.nl)";
  const date = Date.now();
  const data = {
    info, date, version, stations, lines, stationTypes, gridCols, gridRows
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "My Transit Map.json";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

// Export PDF button
document.querySelector("#export-pdf-btn").addEventListener("click", () => {
  const oldTitle = document.title;
  document.title = "My Transit Map";
  window.print();
  setTimeout(() => { document.title = oldTitle }, 10);
});


window.addEventListener('beforeprint', () => {

  setSvgSize();
  drawGrid();
  drawLines();
  drawStations();

  document.querySelector("#legend").classList.toggle("hidden", !toggleShowLegend.checked);
});

window.addEventListener('afterprint', () => {
  scheduleRender();
});

// Export PNG button
document.querySelector("#export-png-btn").addEventListener("click", () => {
  if (!exportPreviewDataURL) {
    alert("Please wait for the preview image to finish loading.");
    return;
  }
  const link = document.createElement("a");
  link.href = exportPreviewDataURL;
  link.download = `My Transit Map.png`;
  link.click();
});

// Export SVG button
const offset = 32;
document.querySelector("#export-svg-btn").addEventListener("click", () => {
  scheduleRender();

  // clone SVG
  const svg = document.getElementById("map");
  const clone = svg.cloneNode(true);

  // legenda als foreignObject toevoegen
  const legend = document.getElementById("legend");
  if (legend) {
    const bbox = legend.getBoundingClientRect();
    const foreign = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    foreign.setAttribute("x", legendPosition.x);
    foreign.setAttribute("y", legendPosition.y);
    foreign.setAttribute("width", bbox.width);
    foreign.setAttribute("height", bbox.height + offset);
    const legendClone = legend.cloneNode(true);
    legendClone.style.position = "static";
    foreign.appendChild(legendClone);
    clone.appendChild(foreign);
  }

  // CSS inline zetten
  const css = Array.from(document.styleSheets)
    .map(ss => {
      try {
        return Array.from(ss.cssRules).map(r => r.cssText).join("\n");
      } catch (e) {
        return "";
      }
    })
    .join("\n");
  const styleElem = document.createElement("style");
  styleElem.textContent = css;
  clone.insertBefore(styleElem, clone.firstChild);

  // exporteren
  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "My Transit Map.svg";
  link.click();
  URL.revokeObjectURL(url);

  scheduleRender();
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

      data.stations?.forEach(st => addStation(st));
      data.lines?.forEach(ln => addLine(ln));
      data.stationTypes?.forEach(t => stationTypes.push(t));

      gridCols = data.gridCols ?? gridCols;
      gridRows = data.gridRows ?? gridRows;

      renderStationList();
      scheduleRender();
      console.log("Import succesful")
    }catch(e){
      alert("This file seems to be corrupt.");
      console.error("Error importing map data: ", e);
    }
  };
  reader.readAsText(file);
  document.querySelectorAll("dialog[open]").forEach(d => d.close());
}

// === Share ====

// Base64 URL helper
function toBase64Url(uint8Array) {
  let str = btoa(String.fromCharCode(...uint8Array));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

document.querySelector("#share-btn").addEventListener("click", () => {
  const data = {
    s: stations,
    l: lines,
    t: stationTypes,
    w: gridCols,
    h: gridRows
  };

  const compressed = pako.deflateRaw(JSON.stringify(data));
  const encoded = toBase64Url(compressed);
  const url = `${location.origin}${location.pathname}?data=${encoded}`;

  if (url.length > 2000) {
    alert("Sorry, this map is too large to share via a link (max URL-size is 2000 characters). Please try exporting it and sharing the file instead.");
    return;
  }

  prompt("To share this map online, copy this URL:", url);
});


// ===== Clear =====
document.querySelector("#btn-clearall").addEventListener("click", () => {clearAllData();});
document.querySelector("#intro-option-5").addEventListener("click", () => {clearAllData();});

function clearAllData(){
  if (confirm("Are you sure you want to start over? All existing stations and lines will be erased and saved data will be deleted.")){
    stations.length = 0; lines.length = 0;
    localStorage.removeItem("savedMapData");
    renderStationList();
    scheduleRender();
  }
};

// ===== Load examples =====
document.querySelector("#intro-option-2").addEventListener("click", () => {
  loadMetroData("example/ams-metro.json");
  console.log("AMS loaded");
});
document.querySelector("#intro-option-3").addEventListener("click", () => {
  loadMetroData("example/bud-metro.json");
  console.log("BUD loaded");
});

function loadMetroData(path){
  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      stations.length = 0; lines.length = 0; stationTypes.length = 0;

      data.stations?.forEach(st => addStation(st));
      data.lines?.forEach(ln => addLine(ln));
      data.stationTypes?.forEach(t => stationTypes.push(t));

      gridCols = data.gridCols ?? gridCols;
      gridRows = data.gridRows ?? gridRows;

      renderStationList();
      scheduleRender();
      updateMapInfo();
    })
    .catch(err => alert("Error loading example: " + err.message));
}

// ===== Autosave on unload & restore on load =====

const soundToggleUI = document.getElementById('toggleSoundEffects')
const welcomeToggle = document.getElementById('toggleWelcomePreference')
const toggleWelcomePopup = document.getElementById('toggleWelcomePopup')

window.addEventListener("beforeunload", () => {
  const date = Date.now();
  const data = {
    stations, lines, stationTypes, gridCols, gridRows, date
  };
  localStorage.setItem("savedMapData", JSON.stringify(data));
  localStorage.setItem("uiSound", soundToggleUI.checked ? "true" : "false");
  localStorage.setItem("welcomePopup", welcomeToggle.checked ? "true" : "false");
});

// ===== Init =====
function fromBase64Url(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function showGetStarted(){
  document.querySelector("aside").querySelectorAll("section").forEach(section => section.classList.add("hidden"));
  document.querySelector("aside").querySelector("section:first-child").classList.remove("hidden");
  document.querySelector("aside").querySelector("section:nth-child(2)").classList.remove("hidden");
  document.querySelector("aside").querySelector("section:last-child").classList.remove("hidden");
  document.querySelector("#intro-option-6").classList.add("hidden");
  document.querySelector("#intro-option-5").classList.add("hidden");
  document.querySelector("#intro-option-4").classList.remove("hidden");
  toggleShowLegend.checked = false;
  renderLineList();
}

function hideGetStarted(){
  document.querySelector("aside").querySelectorAll("section").forEach(section => section.classList.remove("hidden"));
  document.querySelector("aside").querySelector("section:nth-child(2)").classList.add("hidden");
  document.querySelector("#intro-option-6").classList.remove("hidden");
  document.querySelector("#intro-option-5").classList.remove("hidden");
  document.querySelector("#intro-option-4").classList.add("hidden");
  toggleShowLegend.checked = true;
  renderLineList();
}

document.addEventListener("DOMContentLoaded", () => {
  function loadMapData(data) {
    stations.length = 0; lines.length = 0; stationTypes.length = 0;
    data.s?.forEach(st => addStation(st));
    data.l?.forEach(ln => addLine(ln));
    data.t?.forEach(t => stationTypes.push(t));
    gridCols = data.w ?? gridCols;
    gridRows = data.h ?? gridRows;
    scheduleRender();
    renderStationList();
    updateMapInfo();
  }

  const params = new URLSearchParams(location.search);
  if (params.has("data")) {
    try {
      const compressed = fromBase64Url(params.get("data"));
      const jsonStr = pako.inflateRaw(compressed, { to: "string" });
      const data = JSON.parse(jsonStr);
      loadMapData(data);
      console.log("Retrieved map data from URL");
    } catch (e) {
      console.error("Failed to load map from URL: ", e);
    }
  } else {
    const saved = localStorage.getItem("savedMapData");
    if (saved){
      try {
        const data = JSON.parse(saved);
        const mappedData = {
          s: data.stations,
          l: data.lines,
          t: data.stationTypes,
          w: data.gridCols,
          h: data.gridRows
        };
        loadMapData(mappedData);
        console.log("Retrieved map data from local storage: ", mappedData);
      } catch {}
    } else {
      scheduleRender();
      renderStationList();
      updateMapInfo();
    }
  }

  if (stations.length === 0 && lines.length === 0) {
    showGetStarted();
  }

  if (localStorage.getItem("uiSound") === "true") {
    soundToggleUI.checked = true;
  } else {
    soundToggleUI.checked = false;
  }

  if (localStorage.getItem("welcomePopup") !== "false") {
    welcomeToggle.checked = true;
    toggleWelcomePopup.checked = true;
    document.getElementById('dialog-welcome').showModal();
  } else {
    welcomeToggle.checked = false;
    toggleWelcomePopup.checked = false;
  }

  toggleWelcomePopup.addEventListener("change", () => {welcomeToggle.checked = toggleWelcomePopup.checked;});


  console.log("\n%c Transit Map Maker %c\n\nInitiation succesful%c | Made with love by Bence\n", "font-family: Helvetica; font-weight: bold; color: #232322; font-size: 25px; background-color: #f7f4ed; border-style: solid; border-color: #232322; border-width: 2px; border-radius: 5px;", "font-family: Helvetica; font-weight: bold;", "font-family: Helvetica;");

});