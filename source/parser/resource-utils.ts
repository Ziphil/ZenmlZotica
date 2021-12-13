//

import ZOTICA_SCRIPT_STRING from "!!raw-loader!../../dist/script.js";
import ZOTICA_STYLE_STRING from "!!raw-loader!sass-loader!../client/style/style.scss";


export class ZoticaResourceUtils {

  public static getScriptString(): string {
    let string = ZOTICA_SCRIPT_STRING;
    return string;
  }

  public static getStyleString(fontUrl: string): string {
    let string = ZOTICA_STYLE_STRING;
    string = string.replace("__mathfonturl__", fontUrl);
    return string;
  }

}