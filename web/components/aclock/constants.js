import * as d3 from "d3";
import {FONT_FAMILIES} from "apackjs";

export const VALID_FONTS = FONT_FAMILIES.filter((font) => font !== "markers");

export const DEFAULT_SORT = "random";
export const DEFAULT_INTERPOLATOR = "BrBG";
export const DEFAULT_FONT = "futural";

export const interpolators = {
  Greys: d3.interpolateGreys,
  Blues: d3.interpolateBlues,
  Reds: d3.interpolateReds,
  Greens: d3.interpolateGreens,
  Oranges: d3.interpolateOranges,
  Purples: d3.interpolatePurples,
  Turbo: d3.interpolateTurbo,
  Viridis: d3.interpolateViridis,
  Inferno: d3.interpolateInferno,
  Magma: d3.interpolateMagma,
  Plasma: d3.interpolatePlasma,
  Cividis: d3.interpolateCividis,
  Warm: d3.interpolateWarm,
  Cool: d3.interpolateCool,
  Cubehelix: d3.interpolateCubehelixDefault,
  BuGn: d3.interpolateBuGn,
  BuPu: d3.interpolateBuPu,
  GnBu: d3.interpolateGnBu,
  OrRd: d3.interpolateOrRd,
  PuBuGn: d3.interpolatePuBuGn,
  PuBu: d3.interpolatePuBu,
  PuRd: d3.interpolatePuRd,
  RdPu: d3.interpolateRdPu,
  YlGnBu: d3.interpolateYlGnBu,
  YlGn: d3.interpolateYlGn,
  YlOrBr: d3.interpolateYlOrBr,
  YlOrRd: d3.interpolateYlOrRd,
  BrBG: d3.interpolateBrBG,
  PRGn: d3.interpolatePRGn,
  PiYG: d3.interpolatePiYG,
  PuOr: d3.interpolatePuOr,
  RdBu: d3.interpolateRdBu,
  RdGy: d3.interpolateRdGy,
  RdYlBu: d3.interpolateRdYlBu,
  RdYlGn: d3.interpolateRdYlGn,
  Spectral: d3.interpolateSpectral,
  Rainbow: d3.interpolateRainbow,
  Sinebow: d3.interpolateSinebow,
};
