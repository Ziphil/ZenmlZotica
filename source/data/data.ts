//

import ZOTICA_DATA_JSON from "./data.json";


export class ZoticaData {

  private readonly json: any;

  public constructor(json: any) {
    this.json = json;
  }

  public isLeafTagName(tagName: string): boolean {
    return this.json.leaf.includes(tagName);
  }

}


export const ZOTICA_DATA = new ZoticaData(ZOTICA_DATA_JSON);