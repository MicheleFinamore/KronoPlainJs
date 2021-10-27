import { getChart, combineSelected, uncombineSelected } from "./chart";

const combine = document.getElementById("combine");
const uncombine = document.getElementById("uncombine");
const load = document.getElementById("load");
const input = document.getElementById("datetime");

export class Controller {
  constructor(timeline, chart) {
    this.timeline = timeline;
    this.chart = chart;
  }
}
