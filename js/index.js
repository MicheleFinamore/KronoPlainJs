// index.js
import { createTimeline } from "kronograph";
import { nodes } from "./data";
import { getChart, combineSelected, uncombineSelected } from "./chart";


// converto i nodi e i link di keylines in entità ed eventi kronograph
const convertNodesToEntities = () => {
  var ite = nodes.items;
  var entities = {};
  var events = {};

  // itero gli items di keylines
  ite.forEach((item) => {
    // se il tipo è node costruisco un entità di kronograph
    if (item.type === "node") {
      let name = item.t;
      let cluster = item.d.cluster;
      entities[item.id] = {
        color: item.c,
        label: name,
        data: {
          cluster: cluster,
        },
        type: "person",
      };
    }
    // se è link costruisco un evento
    if (item.type === "link") {
      //console.log("link analizzato", item);
      let entity_a = ite.find((element) => element.id === item.id1).id;
      let entity_b = ite.find((element) => element.id === item.id2).id;
      let callID = item.id;
      events[callID] = {
        entityIds: [entity_a, entity_b],
        time: item.d,
        color: "from",
      };
    }
  });

  // console.log("entities", entities);
  // console.log("events", events);

  // console.log("new Data", newData);
  // setKronoEntities(entities);
  // setKronoEvents(events);

  return [entities, events];
};
var [entities, events] = convertNodesToEntities();





document.addEventListener("DOMContentLoaded", () => {
  console.log("page loaded. index.js");
  const combine = document.getElementById("combine");
  const uncombine = document.getElementById("uncombine");
  const load = document.getElementById("load_button");
  const input = document.getElementById("datetime");
  const backgroundSelect = document.getElementById("background-select");
  const positionSelect = document.getElementById("position-select");
  const labelSelect = document.getElementById("label-color-select");

  // ****** CREAZIONE TIMELINE ****** */
  // const timeline_container = document.getElementById("my-timeline");
  const timeline = createTimeline("my-timeline");

  // dati iniziali timeline
  const data = {
    entities: entities,
    events: events,
  };
  // opzioni timeline
  const timelineOptions = {
    backgroundColor: "#333",
    scales: {
      showAtTop: false,
      showAtBottom: true,
      textColor: "#f5f7fa",
    },
  };
  // entity types
  const defaultEntityType = {
    labelColor: "white",
    lineWidth: 6,
  };

  const orderingName = {
    orderingName: "firstevent",
  };

  // costruzione effettiva timeline
  const entityTypes = { default: defaultEntityType };
  data["entityTypes"] = entityTypes;
  timeline.options(timelineOptions);
  // timeline.setOrdering(orderingName);
  timeline.set(data);
  timeline.fit();

  const timeline_event = new CustomEvent('timeline-ready', {detail:timeline});
  window.document.dispatchEvent(timeline_event);

  //****** EVENT LISTENERS ******** */

  load.addEventListener("click", () => {
    console.log("load clicked in index");
    const event = new CustomEvent('get-components', {detail:timeline});
    window.document.dispatchEvent(event);
  });

  combine.addEventListener("click", () => {
    console.log("combine clicked");
    combineSelected().then(() => {
      let canvas_container = document.getElementById("kl").firstChild.id;
      let newEntities = {};
      KeyLines.components[canvas_container].each({ type: "node" }, (item) => {
        let parentId = item.parentId;
        if (parentId !== undefined && parentId !== null) {
          console.log("combonode", item);
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
      console.log("entities modificate", newEntities);
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

    // let canvas_container = document.getElementById("kl").firstChild.id;
    // setTimeout(() => {
    //   let newEntities = {};
    //   KeyLines.components[canvas_container].each({ type: "node" }, (item) => {
    //     let parentId = item.parentId;
    //     if (parentId !== undefined && parentId !== null) {
    //       console.log("combonode", item);
    //       let name = item.t;
    //       newEntities[item.id] = {
    //         color: item.c,
    //         label: name,
    //         data: {
    //           cluster: parentId,
    //         },
    //         type: "person",
    //       };
    //     } else {
    //       let name = item.t;
    //       let cluster = item.d.cluster;
    //       newEntities[item.id] = {
    //         color: item.c,
    //         label: name,
    //         data: {
    //           cluster: cluster,
    //         },
    //         type: "person",
    //       };
    //     }
    //   });
    //   console.log("entities modificate", newEntities);
    //   const currentData = {
    //     entities: newEntities,
    //     events: events,
    //     entityTypes: {
    //       person: {
    //         groupBy: ["cluster"],
    //       },
    //     },
    //   };

    //   timeline.set(currentData);
    // }, 1000);
  });

  uncombine.addEventListener("click", () => {
    uncombineSelected().then(() => {
      let newEntities = {};
      let canvas_container = document.getElementById("kl").firstChild.id;
      KeyLines.components[canvas_container].each({ type: "node" }, (item) => {
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
      console.log("entities modificate", newEntities);
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

  input.addEventListener("change", (event) => {
    console.log("data acquisita", event.target.value);
    timeline.markers([
      {
        label: "first marker",
        time: new Date(event.target.value),
      },
    ]);
  });

  backgroundSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    timelineOptions.backgroundColor = value;
    timeline.options(timelineOptions);
  });

  positionSelect.addEventListener("change", (e) => {
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

  labelSelect.addEventListener("change", (e) => {
    const colour = e.target.value;
    defaultEntityType.labelColor = colour;
    entityTypes.default = defaultEntityType;
    data["entityTypes"] = entityTypes;
    timeline.set(data);
  });
});

// document.addEventListener("DOMContentLoaded", function () {

//   // const chartDiv = "kl";
//   // let chart;
//   // console.log("dentro chart.js");

//   // const items = [
//   //   { id: "1", type: "node", t: "Person1", c: "#f86868", d: { cluster: "1" } },
//   //   { id: "2", type: "node", t: "Person2", c: "#f7d06e", d: { cluster: "2" } },
//   //   { id: "3", type: "node", t: "Person3", c: "#2676c7", d: { cluster: "3" } },
//   //   { id: "4", type: "node", t: "Person4", c: "#5dbbb4", d: { cluster: "4" } },
//   //   { id: "5", type: "node", t: "Person5", c: "#ff8834", d: { cluster: "5" } },
//   //   { id: "6", type: "node", t: "Person6", c: "#b360d6", d: { cluster: "6" } },
//   //   {
//   //     id: "link1",
//   //     id1: "1",
//   //     id2: "2",
//   //     a2: true,
//   //     type: "link",
//   //     c: "#2da167",
//   //     d: new Date(2020, 6, 1, 12, 0),
//   //   },
//   //   {
//   //     id: "link2",
//   //     id1: "1",
//   //     id2: "5",
//   //     a2: true,
//   //     type: "link",
//   //     c: "#2da167",
//   //     d: new Date(2020, 6, 1, 8, 0),
//   //   },
//   //   {
//   //     id: "link3",
//   //     id1: "2",
//   //     id2: "3",
//   //     a2: true,
//   //     type: "link",
//   //     c: "#2da167",
//   //     d: new Date(2020, 6, 1, 5, 0),
//   //   },
//   //   {
//   //     id: "link4",
//   //     id1: "3",
//   //     id2: "4",
//   //     a2: true,
//   //     type: "link",
//   //     c: "#2da167",
//   //     d: new Date(2020, 6, 1, 15, 0),
//   //   },
//   //   {
//   //     id: "link5",
//   //     id1: "3",
//   //     id2: "1",
//   //     a2: true,
//   //     type: "link",
//   //     c: "#2da167",
//   //     d: new Date(2020, 6, 1, 19, 0),
//   //   },
//   //   {
//   //     id: "link6",
//   //     id1: "6",
//   //     id2: "2",
//   //     a2: true,
//   //     type: "link",
//   //     c: "#2da167",
//   //     d: new Date(2020, 6, 1, 21, 0),
//   //   },
//   // ];

//   // let nodes = {
//   //   type: "LinkChart",
//   //   items: items,
//   // };

//   // console.log("nodes",nodes);
//   // KeyLines.promisify();
//   // KeyLines.create({container:chartDiv}).then((loadedChart) => {
//   //   chart = loadedChart;
//   //   chart.load(nodes);
//   // });
// });
