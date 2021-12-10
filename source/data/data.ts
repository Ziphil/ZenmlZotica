//

import type {
  ZoticaOperatorType
} from "../parser/builder";
import ZOTICA_DATA_JSON from "./data.json";


export class ZoticaData {

  private readonly json: ZoticaDataJson;

  public constructor(json: ZoticaDataJson) {
    this.json = json;
  }

  public isLeafTagName(tagName: string): boolean {
    return this.json.leaf.includes(tagName);
  }

  public getIdentifierChar(kind: string): string | null {
    let char = this.json.identifier[kind] ?? null;
    return char;
  }

  public getOperatorSymbol(kind: string): {symbol: string, types: Array<ZoticaOperatorType | string>} | null {
    let symbolSpec = this.json.operator[kind] ?? null;
    return symbolSpec;
  }

  public getOperatorSymbolByChar(char: string): {symbol: string, types: Array<ZoticaOperatorType | string>} | null {
    let operatorEntries = Object.entries(this.json.operator);
    let symbol = operatorEntries.find(([, symbolSpec]) => char === symbolSpec?.symbol)?.[1] ?? null;
    return symbol;
  }

  public getReplacement(char: string): string | null {
    let replacement = this.json.replacement[char] ?? null;
    return replacement;
  }

  public getAlternativeIdentifierText(kind: string, text: string): string {
    let nextText = [...text].map((char) => this.json.alternative[kind]?.[char] ?? "").join("");
    return nextText;
  }

  public getGreekChar(char: string): string | null {
    let greekChar = this.json.greek[char] ?? null;
    return greekChar;
  }

}


export type ZoticaDataJson = {
  leaf: Array<string>,
  replacement: {[C in string]?: string},
  fence: {[K in string]?: {left: ZoticaDataFenceJson, right: ZoticaDataFenceJson}},
  integral: {[K in string]?: {inl: string, lrg: string}},
  sum: {[K in string]?: {inl: string, lrg: string}},
  radical: {[L in number]?: string | undefined} & {height: Array<number>},
  accent: {[K in string]?: {un: string | null, ov: string | null}},
  wide: {[K in string]?: {un: ZoticaDataWideJson | null, ov: ZoticaDataWideJson | null}},
  function: Array<string>,
  identifier: {[K in string]?: string},
  operator: {[K in string]?: {symbol: string, types: Array<string>}},
  arrow: {[K in string]?: {edge: string, x: number, y: number, width: number, height: number, extrusion: number, command: string}},
  alternative: {[K in string]?: {[C in string]?: string}},
  greek: {[C in string]?: string}
};
type ZoticaDataFenceJson = {[L in number]?: string} & {start?: string, bar?: string, middle?: string, end?: string};
type ZoticaDataWideJson = ({[L in number]?: string} & {0: string} & {start?: string, bar?: string, middle?: string, end?: string, width: Array<number>}) | {start?: string, bar?: string, end?: string};

export const ZOTICA_DATA = new ZoticaData(ZOTICA_DATA_JSON);