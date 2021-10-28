import { getTimeline } from "./index";
import { nodes } from "./data";


let chart;

export function getChart() {
  return chart;
}

// combine.addEventListener("click", () => {
//   console.log("combine clicked in chart");
// });

function clickHandler({ id }) {
  console.log("in clickHandler");
  if (chart.getItem(id)) {
    const neighbours = chart.graph().neighbours(id).nodes;
    chart.foreground((node) => node.id === id || neighbours.includes(node.id));
  } else {
    chart.foreground((node) => true);
  }
}

function isComboNode(id) {
  return chart.combo().isCombo(id, { type: "node" });
}

// prendo tutti quelli che non sono combo nodes
function isTopLevel(id) {
  return chart.combo().find(id) === null;
}

function isTopLevelComboNodeSelected() {
  return chart.selection().some((id) => isComboNode(id) && isTopLevel(id));
}

// prendo tutti i nodi selezionati
function selectedNodes() {
  return chart
    .selection()
    .filter(
      (id) =>
        chart.getItem(id).type === "node" && chart.getItem(id).t !== "Cluster"
    );
}
// filtro i nodi selezionati usando toplevel per filtrarli
function selectedTopLevelNodes() {
  return selectedNodes().filter(isTopLevel);
}

function multipleNodesSelected() {
  return selectedTopLevelNodes().length > 1;
}

// generate a list of all combos ordered by how deeply nested they are
function getComboList() {
  const comboIds = [];
  chart.each({ type: "node", items: "all" }, ({ id }) => {
    if (chart.combo().isCombo(id)) {
      comboIds.push(id);
    }
  });
  return comboIds;
}

export async function combineSelected() {
  
  const chart_ready = new CustomEvent("chart-ready", { detail: chart });
  window.document.dispatchEvent(chart_ready);
  let selected = chart.selection();
  console.log("selected top level nodes", selected);
  await chart.combo().combine({
    ids: selectedTopLevelNodes(),
    label: "Cluster",
    open: true,
    c: "green",
    e: 1.2,
  });
}

export async function uncombineSelected() {
  await chart
    .combo()
    .uncombine(chart.selection())
    .then(() => {
      chart.each({ type: "node" }, (item) => {
        console.log(item);
      });
    });
}

function onSelection() {
  console.log(chart.selection());
}



function hoverHandler({ id }) {
  console.log("hover id", id);
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("page loaded. chart.js");

  const chartDiv = "kl";
  const combine = document.getElementById("combine");
  const uncombine = document.getElementById("uncombine");
  const load = document.getElementById("load_button");

  //*****CREAZIONE CHART ***** */
  KeyLines.promisify();
  KeyLines.create({ container: chartDiv }).then((loadedChart) => {
    chart = loadedChart;
    chart.load(nodes);
    chart.layout("standard");
    chart.on("selection-change", onSelection);
    //chart.on("hover", hoverHandler);
    const event = new CustomEvent('chart-ready', {detail:chart});
    window.document.dispatchEvent(event);
    //setUpEventHandlers();
  });



  //* SETTING LISTENERS */
  // combine.addEventListener("click", () => {
    

  //   const event = new CustomEvent("chart-combined");
  //   combineSelected().then(() => {   
  //     window.document.dispatchEvent(event)});
  // });

  load.addEventListener("click", () => {
    console.log("load clicked in chart");
    const event = new CustomEvent("get-components", { detail: chart });
    window.document.dispatchEvent(event);
  });

  
});

// document.addEventListener("DOMContentLoaded", () => {});
