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

  public isLeafKind(kind: string): boolean {
    return this.json.leaf.includes(kind);
  }

  public isFunctionKind(kind: string): boolean {
    return this.json.function.includes(kind);
  }

  public isIdentifierKind(kind: string): boolean {
    return this.json.identifier[kind] !== undefined;
  }

  public getIdentifierChar(kind: string): string | null {
    let char = this.json.identifier[kind] ?? null;
    return char;
  }

  public isOperatorKind(kind: string): boolean {
    return this.json.operator[kind] !== undefined;
  }

  public getOperatorSymbolSpec(kind: string): ZoticaOperatorSymbolSpec | null {
    let symbolSpec = this.json.operator[kind] ?? null;
    return symbolSpec;
  }

  public getOperatorSymbolSpecByChar(char: string): ZoticaOperatorSymbolSpec | null {
    let operatorEntries = Object.entries(this.json.operator);
    let symbol = operatorEntries.find(([, symbolSpec]) => char === symbolSpec?.symbol)?.[1] ?? null;
    return symbol;
  }

  public isFenceKind(kind: string): boolean {
    return this.json.fence[kind] !== undefined;
  }

  public getLeftFenceSymbol(kind: string, level: number): string | null {
    let symbol = this.json.fence[kind]?.left?.[level] ?? null;
    return symbol;
  }

  public getRightFenceSymbol(kind: string, level: number): string | null {
    let symbol = this.json.fence[kind]?.left?.[level] ?? null;
    return symbol;
  }

  public getReplacement(char: string): string | null {
    let replacement = this.json.replacement[char] ?? null;
    return replacement;
  }

  public getAlternativeIdentifierContent(kind: string, content: string): string {
    let nextContent = [...content].map((char) => this.json.alternative[kind]?.[char] ?? "").join("");
    return nextContent;
  }

  public getGreekChar(char: string): string | null {
    let greekChar = this.json.greek[char] ?? null;
    return greekChar;
  }

}


export type ZoticaOperatorSymbolSpec = {symbol: string, types: Array<ZoticaOperatorType | string>};

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