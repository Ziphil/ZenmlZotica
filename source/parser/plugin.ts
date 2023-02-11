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
} from "@zenml/zenml/dist/parsimmon";
import {
  ZoticaParser
} from "./parser";


export class ZoticaZenmlPlugin implements ZenmlPlugin {

  private zoticaParser!: ZoticaParser;
  private builder!: Builder;
  private pluginFunction: ZenmlPluginFunction;

  public constructor(pluginFunction: ZenmlPluginFunction) {
    this.pluginFunction = pluginFunction;
  }

  public initialize(zenmlParser: ZenmlParser): void {
    const options = {parentPluginManager: zenmlParser.pluginManager};
    this.zoticaParser = new ZoticaParser(zenmlParser.implementation, options);
  }

  public updateDocument(document: Document): void {
    this.builder = new Builder(document);
    this.zoticaParser.setDocument(document);
  }

  public getParser(): Parser<Nodes> {
    return this.zoticaParser.mathRoot;
  }

  public createElement(tagName: string, marks: ZenmlMarks, attributes: ZenmlAttributes, childrenArgs: ChildrenArgs): Nodes {
    return this.pluginFunction(this.builder, tagName, marks, attributes, childrenArgs);
  }

}