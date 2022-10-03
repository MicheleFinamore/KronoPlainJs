import { schede, data_schede } from "./data";
import { card_data, chart_card } from "./chart";


// console.log("dentro controller");

// get html elements
const combine = document.getElementById("combine");
const uncombine = document.getElementById("uncombine");
const load = document.getElementById("load_button");
const date_input = document.getElementById("datetime");
const backgroundSelect = document.getElementById("background-select");
const positionSelect = document.getElementById("position-select");
const labelSelect = document.getElementById("label-color-select");
const input_filter = document.getElementById("key_filter");
const filter_button = document.getElementById('filter')
const reset = document.getElementById("reset_button");

let timeline;
let chart;
let entities;
let events;
let timelineOptions;
let defaultEntityType;
let entityTypes;
let data;
let currentNode = null;
let currentClicked = null;
let currentDataSet;
let timelineCurrentHover = null;

//*** CUSTOM EVENTS ***/

// timeline ready
window.document.addEventListener("timeline-ready", (ev) => {
  timeline = ev.detail.timeline;
  entities = ev.detail.entities;
  events = ev.detail.events;
  timelineOptions = ev.detail.timelineOptions;
  defaultEntityType = ev.detail.defaultEntityType;
  entityTypes = ev.detail.entityTypes;
  data = ev.detail.data;
  timeline.on("drag-start", dragStartHandler);
  timeline.on("hover", timelineHoverHandler);
  timeline.on("focus",timelineFocusHandler);
  timeline.on('click',timelineCLickHandler);
  console.log("timeline in controller");
});

// chart ready
window.document.addEventListener("chart-ready", (ev) => {
  chart = ev.detail;
  chart.on("hover", hoverHandler);
  chart.on("click", clickHandler);
  console.log("chart in controller");
});

window.document.addEventListener("get-components", (ev) => {
  console.log("components events", ev);
});

window.document.addEventListener("chart-combined", () => {
  let selected = chart.selection();
  console.log("chart combined in controller and selection", selected);
});

//*** HANDLERS ***/


filter_button.addEventListener('click', () =>{
  const value = input_filter.value
  timeline.focus(value)


})

// quando la keyfilter cambia effettuo il focus su kronograph
// input_filter.addEventListener("change", (event) => {
//   let val = event.target.value;
//   console.log("val", val);
//   console.log('timeline', timeline);
//   console.log(timeline.getEntity(val));
//   timeline.focus(val);
// });

// setting del marker temorale
date_input.addEventListener("change", (event) => {
  console.log("data acquisita", event.target.value);
  timeline.markers([
    {
      label: "first marker",
      time: new Date(event.target.value),
    },
  ]);
});

// setting background
backgroundSelect.addEventListener("change", (e) => {
  const value = e.target.value;
  timelineOptions.backgroundColor = value;
  timeline.options(timelineOptions);
});

//setting position timeline
positionSelect.addEventListener("change", (e) => {
  console.log("in position");
  const value = e.target.value;
  if (value === "both") {
    timelineOptions.scales.showAtBottom = true;
    timelineOptions.scales.showAtTop = true;
  } else if (value === "top") {
    timelineOptions.scales.showAtBottom = false;
    timelineOptions.scales.showAtTop = true;
  } else {
    timelineOptions.scales.showAtBottom = true;
    timelineOptions.scales.showAtTop = false;
  }
  timeline.options(timelineOptions);
});

// setting label color
labelSelect.addEventListener("change", (e) => {
  const colour = e.target.value;
  defaultEntityType.labelColor = colour;
  entityTypes.default = defaultEntityType;
  data["entityTypes"] = entityTypes;
  timeline.set(data);
  timeline.fit();
});

// combina i nodi di keylines e clusterizza le corrispettive entità su kronograph
combine.addEventListener("click", () => {
  combineSelected().then(() => {
    let newEntities = {};
    chart.each({ type: "node" }, (item) => {
      let parentId = item.parentId;
      if (parentId !== undefined && parentId !== null) {
        let name = item.t;
        newEntities[item.id] = {
          color: item.c,
          label: name,
          data: {
            cluster: parentId,
          },
          type: "person",
        };
      } else {
        let name = item.t;
        let cluster = item.d.cluster;
        newEntities[item.id] = {
          color: item.c,
          label: name,
          data: {
            cluster: cluster,
          },
          type: "person",
        };
      }
    });
    const currentData = {
      entities: newEntities,
      events: events,
      entityTypes: {
        person: {
          groupBy: ["cluster"],
        },
      },
    };

    timeline.set(currentData);
  });
});

// come combine ma al contrario
uncombine.addEventListener("click", () => {
  uncombineSelected().then(() => {
    let newEntities = {};
    chart.each({ type: "node" }, (item) => {
      let parentId = item.parentId;
      if (parentId === undefined || parentId === null) {
        let name = item.t;
        newEntities[item.id] = {
          color: item.c,
          label: name,
          data: {
            cluster: item.id,
          },
          type: "person",
        };
      } else {
        let name = item.t;
        newEntities[item.id] = {
          color: item.c,
          label: name,
          data: {
            cluster: parentId,
          },
          type: "person",
        };
      }
    });

    const currentData = {
      entities: newEntities,
      events: events,
      entityTypes: {
        person: {
          groupBy: ["cluster"],
        },
      },
    };

    timeline.set(currentData);
  });
});

// prende i dati provenienti dal chart e reinizializza il grafo relazionale e quello temporale
load.addEventListener("click", () => {
  console.log("load");
  
  // // chart.load(schede);
  let chart_to_load = {
    type: "LinkChart",
    items: card_data.chart_elements,
  };
  chart.load(chart_to_load);
  chart.layout("standard");
  console.log()
  // timeline.set(data_schede);
  timeline.set({
    events: card_data.events,
    entities: card_data.entities,
  });
  timeline.setOrdering("alphabetical");
  timeline.fit();

  data = { ...data, events: card_data.events, entities: card_data.entities };
});

// fa la fit del timeline
reset.addEventListener("click", () => {
  timeline.fit();
});


// gestisce l'hover su keyline
function hoverHandler({ id }) {
  // console.log("id", id);
  // console.log("currentNode", currentNode);
  if (id === null) {
    if (currentNode === null) {
      return;
    } else {
      const item = chart.getItem(currentNode);
      chart.setProperties({ id: item.id, b: "No border" });
      timeline.highlight("");
      currentNode = null;
    }
  } else {
    const item = chart.getItem(id);
    // and update the chart
    chart.setProperties({ id: item.id, b: "#07ed1a" });
    timeline.highlight(id);
    currentNode = id;
  }
}

// gestisce il click su keyline
function clickHandler({ id }) {
  // console.log("id", id);
  // console.log("currentClicked", currentClicked);

  if (id === null) {
    if (currentClicked === null) {
      return;
    } else {
      chart.selection([]);
      timeline.focus([]);
      currentClicked = null;
    }
  } else {
    const item = chart.getItem(id);
    // and update the chart
    timeline.focus(id);
    currentClicked = id;
  }
}

// consente di settare una finestra temporale di analisi su kronograph usando il mouse destro
function dragStartHandler({ setDragOptions, button }) {
  if (button === 2) {
    setDragOptions({
      type: "marqueeRange",
    });
  }
}

// gestisce l'hover sul timeline
function timelineHoverHandler(event) {
  // console.log("targetType", event.targetType);
  // console.log("id", event.id);
  // console.log('timelinecurrent start', timelineCurrentHover);
  if (event.id === null) {
    if (timelineCurrentHover === null) {
      return;
    } else {
      console.log('timelinecurrent', timelineCurrentHover);
      chart.setProperties({ id: timelineCurrentHover, b: "No border" });
    }
  } else {
    const item = chart.getItem(event.id);
    if (event.targetType === "entity") {
      chart.setProperties({ id: item.id, b: "#07ed1a" });
    }else{
     if(event.targetType ==='event'){
      chart.selection(item.id);
     }else{
       return;
     } 
      
    }
    timelineCurrentHover = event.id;
  }
}

// gestisce il focus di kronograph effettuando il foreground dell'entità selezionata sul chart di keyline
function timelineFocusHandler(event){
  let elements = event.focus;
  let id = elements[0];
  if (chart.getItem(id)) {
    const neighbours = chart.graph().neighbours(id).nodes;
    chart.foreground((node) => node.id === id || neighbours.includes(node.id));
  } else {
    chart.foreground((node) => true);
  }
}

function timelineCLickHandler(event){
  console.log("timeline click handler", event);
}





//*** LOGICA CHART *** */

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

async function combineSelected() {
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

async function uncombineSelected() {
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

//     KeyLines.components[canvas_container].each({ type: "node" }, (item) => {
//       let parentId = item.parentId;
//       if (parentId !== undefined && parentId !== null) {
//         console.log("combonode", item);
//         let name = item.t;
//         newEntities[item.id] = {
//           color: item.c,
//           label: name,
//           data: {
//             cluster: parentId,
//           },
//           type: "person",
//         };
//       } else {
//         let name = item.t;
//         let cluster = item.d.cluster;
//         newEntities[item.id] = {
//           color: item.c,
//           label: name,
//           data: {
//             cluster: cluster,
//           },
//           type: "person",
//         };
//       }
//     });
//     console.log("entities modificate", newEntities);
//     const currentData = {
//       entities: newEntities,
//       events: events,
//       entityTypes: {
//         person: {
//           groupBy: ["cluster"],
//         },
//       },
//     };

//     timeline.set(currentData);

// // export class Controller {
// //   constructor(timeline, chart) {
// //     this.timeline = timeline;
// //     this.chart = chart;
// //   }
// // }

// //***************** EVENT HANDLERS************************* */
// load.addEventListener("click", () => {
//   let chart = getChart();
//   letsel = chart.selection();
//   console.log("load selection", sel);
//   console.log("timeline load", getTimeline());
//   console.log("chart ottenuto in load", getChart());
// });

// combine.addEventListener("click", () => {
//   console.log("dentro combine listener in controller js");
//   combineSelected().then(() => {
//     let canvas_container = document.getElementById("kl").firstChild.id;
//     let newEntities = {};
//     KeyLines.components[canvas_container].each({ type: "node" }, (item) => {
//       let parentId = item.parentId;
//       if (parentId !== undefined && parentId !== null) {
//         console.log("combonode", item);
//         let name = item.t;
//         newEntities[item.id] = {
//           color: item.c,
//           label: name,
//           data: {
//             cluster: parentId,
//           },
//           type: "person",
//         };
//       } else {
//         let name = item.t;
//         let cluster = item.d.cluster;
//         newEntities[item.id] = {
//           color: item.c,
//           label: name,
//           data: {
//             cluster: cluster,
//           },
//           type: "person",
//         };
//       }
//     });
//     console.log("entities modificate", newEntities);
//     const currentData = {
//       entities: newEntities,
//       events: events,
//       entityTypes: {
//         person: {
//           groupBy: ["cluster"],
//         },
//       },
//     };

//     let timeline = getTimeline();
//     timeline.set(currentData);
//   });

//   // let canvas_container = document.getElementById("kl").firstChild.id;
//   // setTimeout(() => {
//   //   let newEntities = {};
//   //   KeyLines.components[canvas_container].each({ type: "node" }, (item) => {
//   //     let parentId = item.parentId;
//   //     if (parentId !== undefined && parentId !== null) {
//   //       console.log("combonode", item);
//   //       let name = item.t;
//   //       newEntities[item.id] = {
//   //         color: item.c,
//   //         label: name,
//   //         data: {
//   //           cluster: parentId,
//   //         },
//   //         type: "person",
//   //       };
//   //     } else {
//   //       let name = item.t;
//   //       let cluster = item.d.cluster;
//   //       newEntities[item.id] = {
//   //         color: item.c,
//   //         label: name,
//   //         data: {
//   //           cluster: cluster,
//   //         },
//   //         type: "person",
//   //       };
//   //     }
//   //   });
//   //   console.log("entities modificate", newEntities);
//   //   const currentData = {
//   //     entities: newEntities,
//   //     events: events,
//   //     entityTypes: {
//   //       person: {
//   //         groupBy: ["cluster"],
//   //       },
//   //     },
//   //   };

//   //   timeline.set(currentData);
//   // }, 1000);
// });
