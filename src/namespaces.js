import {svg} from "charmingjs";
import {scaleLinear} from "d3-scale";
import {extent, sum} from "d3-array";
import {curveCatmullRom, line} from "d3-shape";
import {randomLcg, randomUniform} from "d3-random";
import {treemapBinary, hierarchy, treemap} from "d3-hierarchy";

export const cm = {
  svg,
};

export const d3 = {
  scaleLinear,
  extent,
  curveCatmullRom,
  line,
  sum,
  randomLcg,
  randomUniform,
  treemapBinary,
  hierarchy,
  treemap,
};
