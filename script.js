const canvas = document.querySelector("#canvas");
const c = canvas.getContext("2d");

const stations = [
  { x: 5, y: 3 },
  { x: 10, y: 7 }
];


let cellSize = 50;
const gridCols = 60;
const gridRows = 50;

function resizeCanvas() {
  canvas.width = gridCols * cellSize;
  canvas.height = gridRows * cellSize;
}

function drawGrid() {
  //ECHTE GRID
  //De grid waarop coordinaten worden weergegeven
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.strokeStyle = "rgba(255, 0, 0, 0.16)";
  c.beginPath();

  for (let x = 0; x <= gridCols; x++) {
    const pos = x * cellSize;
    c.moveTo(pos, 0);
    c.lineTo(pos, canvas.height);
  }

  for (let y = 0; y <= gridRows; y++) {
    const pos = y * cellSize;
    c.moveTo(0, pos);
    c.lineTo(canvas.width, pos);
  }

  c.stroke();
  //GEBRUIKER GRID
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
}

function draw() {
  resizeCanvas();
  drawGrid();
  drawStations();
}

//In- en uitzoomen ----------------------------------------------------------------

function zoomIn() {
  if (cellSize < 75) {
    cellSize += 5;
    draw();
  }
}

function zoomOut() {
  if (cellSize > 30) {
    cellSize -= 5;
    draw();
  }
}

document.getElementById("zoomIn").addEventListener("click", zoomIn);
document.getElementById("zoomOut").addEventListener("click", zoomOut);

// Controls ------------------------------------------------------------------------

//Add station
const toggleAddStation = document.querySelector('#toggleAddStation');

canvas.addEventListener('click', function() {
  if (toggleAddStation.checked) {
    console.log("er was een station");
  }
});

function drawStations() {

  stations.forEach(station => {
    const x = station.x * cellSize;
    const y = station.y * cellSize;

    c.fillStyle = "red";
    c.beginPath();
    c.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
    c.fill();
  });
}


//Toggle legenda
const toggleShowLegend = document.querySelector('#toggleShowLegend');

toggleShowLegend.addEventListener('change', function() {
  if (toggleShowLegend.checked) {
    document.querySelector("#legend").style.display = "block";
  } else {
    document.querySelector("#legend").style.display = "none";
  }
});

draw();

//Waarschuwing bij herladen --------------------------------------------------------

// window.addEventListener("beforeunload", function (e) {
//   e.preventDefault(); // sommige browsers vereisen dit
//   e.returnValue = ""; // verplicht voor de melding
// });

