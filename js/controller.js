

// get html elements
// const combine = document.getElementById("combine");
// const uncombine = document.getElementById("uncombine");
// const load = document.getElementById("load");
// const input = document.getElementById("datetime");

console.log("dentro controller");
let timeline;
let chart;
window.document.addEventListener('timeline-ready', ev => {
  timeline = ev.detail;
  console.log("timeline in controller", timeline);
});

window.document.addEventListener('get-components', ev => {
  console.log("components events", ev);
})

window.document.addEventListener('chart-ready', ev => {
  chart = ev.detail;
  console.log("chart in controller", chart);
});

window.document.addEventListener("chart-combined",() => {
  let selected = chart.selection();
  console.log("chart combined in controller and selection", selected);
});

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
