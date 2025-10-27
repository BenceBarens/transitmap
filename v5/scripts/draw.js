// ===== Grid & Coords =====
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

// ===== Lines =====
function drawLines(){
  clearNode(gLines);

  lines.forEach((line, index) => {
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
    poly.setAttribute("data-index", index);
    poly.setAttribute("fill","none");
    poly.setAttribute("stroke", line.color || "#000");

    const style = lineStyleMap[line.style || "solid"] || "";
    if (style) poly.setAttribute("stroke-dasharray", style);

    const widthPx = lineWidthMap[line.width || "normal"] || 10;
    poly.setAttribute("stroke-width", widthPx);

    poly.setAttribute("points", points.map(p => p.join(",")).join(" "));
    poly.style.cursor = "pointer";

    poly.addEventListener("click", () => openLinePopup(index));

    gLines.appendChild(poly);
  });
}

// ===== Stations & Labels =====
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
    stationType(st.type, group, cellSize);

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

console.info("%c✔%c draw.js %cloaded in fully", "background-color: #b8e986; border-color: #417505; border-radius: 100px; padding: 3px", "font-weight: bold;", "  ");
