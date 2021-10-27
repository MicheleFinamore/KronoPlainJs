import { nodes } from "./data";

const chartDiv = "kl";
let chart;
const combine = document.getElementById("combine");
const uncombine = document.getElementById("uncombine");

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
  // //prendo tutti i nodi selezionati sul chart
  // const filteredNodes = chart
  //   .selection()
  //   .filter(
  //     (id) =>
  //       chart.getItem(id).type === "node" &&
  //       chart.getItem(id).t !== "Combined"
  //   );

  // // costruisco l'id da dare al campo cluster dei nodi selezionati
  // let clusterId = "";
  // //console.log("nodes",filteredNodes);
  // filteredNodes.forEach((item) => (clusterId = clusterId + item));

  await chart
    .combo()
    .combine({
      ids: selectedTopLevelNodes(),
      label: "Cluster",
      open: true,
      c: "green",
      e: 1.2,
    });
    // .then(() => {
    //   // chart.getItem(filteredNodes).forEach((item) => {
    //   //   var data = item.d;
    //   //   data.cluster = clusterId;
    //   //   chart.setProperties({id:item.id, d:data});
    //   // });
    //   console.log("Combine completata");
    // // });
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
  console.log("selection-change");
}

function setUpEventHandlers() {
  console.log("setUpEventHandlers");
  // set up the button enabled states
  chart.on("selection-change", onSelection);

  // buttons
  combine.addEventListener("click", combineSelected);
  uncombine.addEventListener("click", uncombineSelected);

  // set up the initial look
  onSelection();
}

KeyLines.promisify();
KeyLines.create({ container: chartDiv }).then((loadedChart) => {
  chart = loadedChart;
  chart.load(nodes);
  chart.layout("standard");
  //setUpEventHandlers();
});


