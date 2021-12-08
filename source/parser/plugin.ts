//

import {
  Builder,
  ChildrenArgs,
  Nodes,
  ZenmlAttributes,
  ZenmlMarks,
  ZenmlParser,
  ZenmlPlugin,
  ZenmlPluginFunction
} from "@zenml/zenml";
import {
  Parser
} from "parsimmon";
import {
  ZoticaParser
} from "./parser";


export class ZoticaZenmlPlugin implements ZenmlPlugin {

  private zenmlParser!: ZenmlParser;
  private zoticaParser!: ZoticaParser;
  private builder!: Builder;
  private pluginFunction: ZenmlPluginFunction;

  public constructor(pluginFunction: ZenmlPluginFunction) {
    this.pluginFunction = pluginFunction;
  }

  // TODO: ZenML パーサーからプラグイン情報を継承するような処理を追加してください。
  public initialize(zenmlParser: ZenmlParser): void {
    this.zenmlParser = zenmlParser;
    this.zoticaParser = new ZoticaParser(zenmlParser.implementation);
  }

  public updateDocument(document: Document): void {
    this.builder = new Builder(document);
    this.zoticaParser.setDocument(document);
  }

  public getParser(): Parser<Nodes> {
    return this.zoticaParser.nodes({});
  }

  public createElement(tagName: string, marks: ZenmlMarks, attributes: ZenmlAttributes, childrenArgs: ChildrenArgs): Nodes {
    return this.pluginFunction(this.builder, tagName, marks, attributes, childrenArgs);
  }

}