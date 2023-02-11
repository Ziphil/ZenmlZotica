//

import type {
  ZoticaOperatorType,
  ZoticaSpaceType
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
    const char = this.json.identifier[kind] ?? null;
    return char;
  }

  public isOperatorKind(kind: string): boolean {
    return this.json.operator[kind] !== undefined;
  }

  public getOperatorSymbolSpec(kind: string): ZoticaOperatorSymbolSpec | null {
    const symbolSpec = this.json.operator[kind] ?? null;
    return symbolSpec;
  }

  public getOperatorSymbolSpecByChar(char: string): ZoticaOperatorSymbolSpec | null {
    const operatorEntries = Object.entries(this.json.operator);
    const symbol = operatorEntries.find(([, symbolSpec]) => char === symbolSpec?.symbol)?.[1] ?? null;
    return symbol;
  }

  public getRadicalSymbol(level: number): string | null {
    const symbol = this.json.radical[level] ?? null;
    return symbol;
  }

  public isIntegralKind(kind: string): boolean {
    return this.json.integral[kind] !== undefined;
  }

  public getIntegralSymbol(kind: string, size: "inl" | "lrg"): string | null {
    const symbol = this.json.integral[kind]?.[size] ?? null;
    return symbol;
  }

  public isSumKind(kind: string): boolean {
    return this.json.sum[kind] !== undefined;
  }

  public getSumSymbol(kind: string, size: "inl" | "lrg"): string | null {
    const symbol = this.json.sum[kind]?.[size] ?? null;
    return symbol;
  }

  public isFenceKind(kind: string): boolean {
    return this.json.fence[kind] !== undefined;
  }

  public getLeftFenceSymbol(kind: string, level: number): string | null {
    const symbol = this.json.fence[kind]?.left?.[level] ?? null;
    return symbol;
  }

  public getRightFenceSymbol(kind: string, level: number): string | null {
    const symbol = this.json.fence[kind]?.left?.[level] ?? null;
    return symbol;
  }

  public isAccentKind(kind: string): boolean {
    return this.json.accent[kind] !== undefined;
  }

  public getUnderAccentSymbol(kind: string): string | null {
    const symbol = this.json.accent[kind]?.un ?? null;
    return symbol;
  }

  public getOverAccentSymbol(kind: string): string | null {
    const symbol = this.json.accent[kind]?.ov ?? null;
    return symbol;
  }

  public isWideKind(kind: string): boolean {
    return this.json.wide[kind] !== undefined;
  }

  public getUnderWideSymbol(kind: string, level: number): string | null {
    const symbol = this.json.wide[kind]?.un?.[level] ?? null;
    return symbol;
  }

  public getOverWideSymbol(kind: string, level: number): string | null {
    const symbol = this.json.wide[kind]?.ov?.[level] ?? null;
    return symbol;
  }

  public isSpaceTagName(tagName: string): boolean {
    return this.json.space[tagName] !== undefined;
  }

  public getSpaceType(tagName: string): ZoticaSpaceType | string | null {
    const type = this.json.space[tagName] ?? null;
    return type;
  }

  public isAlternativeKind(kind: string): boolean {
    return this.json.alternative[kind] !== undefined;
  }

  public getAlternativeChar(kind: string, char: string): string | null {
    const nextChar = this.json.alternative[kind]?.[char] ?? null;
    return nextChar;
  }

  public getAlternativeContent(kind: string, content: string): string {
    const nextContent = [...content].map((char) => this.getAlternativeChar(kind, char) ?? "").join("");
    return nextContent;
  }

  public getReplacedChar(char: string): string | null {
    const nextChar = this.json.replaced[char] ?? null;
    return nextChar;
  }

  public getGreekChar(char: string): string | null {
    const greekChar = this.json.greek[char] ?? null;
    return greekChar;
  }

}


export type ZoticaOperatorSymbolSpec = {symbol: string, types: Array<ZoticaOperatorType | string>};

export type ZoticaDataJson = {
  leaf: Array<string>,
  function: Array<string>,
  identifier: {[K in string]?: string},
  operator: {[K in string]?: {symbol: string, types: Array<string>}},
  radical: {[L in number]?: string | undefined} & {height: Array<number>},
  integral: {[K in string]?: {inl: string, lrg: string}},
  sum: {[K in string]?: {inl: string, lrg: string}},
  fence: {[K in string]?: {left: ZoticaFenceDataJson, right: ZoticaFenceDataJson}},
  accent: {[K in string]?: {un: string | null, ov: string | null}},
  wide: {[K in string]?: {un: ZoticaWideDataJson | null, ov: ZoticaWideDataJson | null}},
  arrow: {[K in string]?: {edge: string, x: number, y: number, width: number, height: number, extrusion: number, command: string}},
  space: {[T in string]?: string},
  alternative: {[K in string]?: {[C in string]?: string}},
  replaced: {[C in string]?: string},
  greek: {[C in string]?: string}
};
type ZoticaFenceDataJson = {[L in number]?: string} & {start?: string, bar?: string, middle?: string, end?: string};
type ZoticaWideDataJson = ({[L in number]?: string} & {start?: string, bar?: string, middle?: string, end?: string, width?: Array<number>});

export const ZOTICA_DATA = new ZoticaData(ZOTICA_DATA_JSON);