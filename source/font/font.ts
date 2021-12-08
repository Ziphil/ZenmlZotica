//

import MATH_ZOTICA_FONT_JSON from "./math.json";
import TIMES_ZOTICA_FONT_JSON from "./times.json";


export class ZoticaFont {

  private readonly json: ZoticaFontJson;

  public constructor(json: ZoticaFontJson) {
    this.json = json;
  }

  public getMetrics(codePoint: number): [number, number] | [null, null] {
    let rawMetrics = this.json[`${codePoint}`];
    if (rawMetrics !== undefined && rawMetrics.length === 2) {
      return [rawMetrics[0], rawMetrics[1]];
    } else {
      return [null, null];
    }
  }

}


export type ZoticaFontJson = {[codePoint: `${number}`]: Array<number> | undefined};

export const TIMES_ZOTICA_FONT = new ZoticaFont(TIMES_ZOTICA_FONT_JSON);
export const MATH_ZOTICA_FONT = new ZoticaFont(MATH_ZOTICA_FONT_JSON);