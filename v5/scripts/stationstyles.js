// stationStyles.js
window.stationType = function(type, group, cellSize) {
  let el;
  switch(type) {
    case 1: // square filled
      el = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      el.setAttribute("x", cellSize/4);
      el.setAttribute("y", cellSize/4);
      el.setAttribute("width", cellSize/2);
      el.setAttribute("height", cellSize/2);
      el.setAttribute("fill", "#232322");
      break;
    case 2: // square outlined
      el = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      el.setAttribute("x", cellSize/4);
      el.setAttribute("y", cellSize/4);
      el.setAttribute("width", cellSize/2);
      el.setAttribute("height", cellSize/2);
      el.setAttribute("fill", "#F7F4ED");
      el.setAttribute("stroke", "#232322");
      el.setAttribute("stroke-width", "0.3em");
      break;
    case 3: // circle filled
      el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      el.setAttribute("cx", cellSize/2);
      el.setAttribute("cy", cellSize/2);
      el.setAttribute("r", cellSize/4);
      el.setAttribute("fill", "#232322");
      break;
    case 4: // circle outlined
      el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      el.setAttribute("cx", cellSize/2);
      el.setAttribute("cy", cellSize/2);
      el.setAttribute("r", cellSize/4);
      el.setAttribute("fill", "#F7F4ED");
      el.setAttribute("stroke", "#232322");
      el.setAttribute("stroke-width", "0.3em");
      break;
    case 5: // diamond filled
        el = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        el.setAttribute(
            "points",
            `${cellSize/2},${cellSize/6} ` +
            `${cellSize/6},${cellSize/2} ` +
            `${cellSize/2},${cellSize*5/6} ` +
            `${cellSize*5/6},${cellSize/2}`
        );
        el.setAttribute("fill", "#232322");
    break;
    case 6: // diamond outlined
        el = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        el.setAttribute(
            "points",
            `${cellSize/2},${cellSize/6} ` +
            `${cellSize/6},${cellSize/2} ` +
            `${cellSize/2},${cellSize*5/6} ` +
            `${cellSize*5/6},${cellSize/2}`
        );
        el.setAttribute("fill", "#F7F4ED");
        el.setAttribute("stroke", "#232322");
        el.setAttribute("stroke-width", "0.3em");
    }
  if(el) group.appendChild(el);
};

window.getStationStyle = function(type) {
  switch(type) {
    case 1: return { backgroundColor: "#232322", borderRadius: "0", border: "none" };
    case 2: return { backgroundColor: "#F7F4ED", border: ".2rem solid #232322", borderRadius: "0" };
    case 3: return { backgroundColor: "#232322", borderRadius: "50%", border: "none" };
    case 4: return { backgroundColor: "#F7F4ED", border: ".2rem solid #232322", borderRadius: "50%" };
  }
  return {};
};