// index.js
import { createTimeline } from "kronograph";
import { nodes } from "./data";
import { getChart, combineSelected, uncombineSelected } from "./chart";


// Script che inizializza i componenti di KronoGraph e KeyLines
// Costruiscec il chart importando i noti dallo script data.js dopodichè usa il metodo convertNodesToEntities 
// per mappare il chart in entità ed eventi kronograph
// Una volta instanziati i componenti vengono lanciati due eventi catturati dal controller che conterrà le istanze dei due components




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

let chart;



document.addEventListener("DOMContentLoaded", () => {
  console.log("page loaded. index.js");
  const load = document.getElementById("load_button");

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

  // costruzione effettiva timeline
  const entityTypes = { default: defaultEntityType };
  data["entityTypes"] = entityTypes;
  timeline.options(timelineOptions);
  timeline.setOrdering("alphabetical");
  timeline.set(data);
  timeline.fit();

  //***COSTRUZIONE KEYLINES */
  KeyLines.promisify();
  KeyLines.create({ container: "kl" }).then((loadedChart) => {
    const options = { backColour: "#333" };
    chart = loadedChart;
    chart.options(options);
    chart.load(nodes);
    chart.layout("standard");
    // chart.on("selection-change", onSelection);
    //chart.on("hover", hoverHandler);
    const event = new CustomEvent("chart-ready", { detail: chart });
    window.document.dispatchEvent(event);
    //setUpEventHandlers();
  });

  const timeline_event = new CustomEvent("timeline-ready", {
    detail: {
      timeline: timeline,
      events: events,
      entities: entities,
      entityTypes: entityTypes,
      timelineOptions: timelineOptions,
      defaultEntityType: defaultEntityType,
      entityTypes: entityTypes,
      data: data,
    },
  });
  window.document.dispatchEvent(timeline_event);


});



