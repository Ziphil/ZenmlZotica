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

  public getIdentifierChar(kind: string): string {
    let char = this.json.identifier[kind] ?? "";
    return char;
  }

}


export type ZoticaDataJson = typeof ZOTICA_DATA_JSON;
export const ZOTICA_DATA = new ZoticaData(ZOTICA_DATA_JSON);