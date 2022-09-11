import {
  cssRelyQueueAnalyze,
  getPackageVersion,
  getSRIFromURL,
  jsRelyTreeAnalyze,
  relyDataIsJS,
  renderUrl,
} from "./utils";
import { ConfigEnv, Plugin, UserConfig } from "vite";
import {
  IRelyJS,
  IRelyCSS,
  IRely,
  IRelyDataJS,
  IRelyDataCSS,
  IRelyData,
} from "./index.type";
import externalGlobals from "rollup-plugin-external-globals";

async function dealJSRelys(relys: IRelyJS[], cdnSource: string) {
  // Analyze rely tree
  const relyQueue = jsRelyTreeAnalyze(relys);
  // Resolve datas
  const relyDatas = await Promise.all(
    relyQueue.map(async (rely: IRelyJS): Promise<IRelyDataJS> => {
      const url = renderUrl(cdnSource, {
        name: rely.name,
        version: rely.version ? rely.version : getPackageVersion(rely.name),
        path: rely.path,
      });
      const integrity =
        rely.integrity === false
          ? null // not use sri
          : typeof rely.integrity == "string"
          ? rely.integrity // use user sri
          : await getSRIFromURL(url); // auto gen sri
      const cors =
        typeof rely.cors == "undefined"
          ? integrity
            ? "anonymous"
            : null //Auto set CORS from integrity use stat
          : rely.cors
          ? "use-credentials"
          : "anonymous"; //Use user cors
      return {
        name: rely.name,
        var: rely.var,
        url: url,
        integrity: integrity,
        cors: cors,
      };
    })
  );
  return relyDatas;
}

async function dealCSSRelys(relys: IRelyCSS[], cdnSource: string) {
  // Analyze rely tree
  const relyQueue = cssRelyQueueAnalyze(relys);
  // Resolve datas
  const relyDatas = await Promise.all(
    relyQueue.map(async (rely: IRelyCSS): Promise<IRelyDataCSS> => {
      const url = renderUrl(cdnSource, {
        name: rely.pkgName,
        version: rely.version ? rely.version : getPackageVersion(rely.pkgName),
        path: rely.path,
      });
      const integrity =
        rely.integrity === false
          ? null // not use sri
          : typeof rely.integrity == "string"
          ? rely.integrity // use user sri
          : await getSRIFromURL(url); // auto gen sri
      const cors =
        typeof rely.cors == "undefined"
          ? integrity
            ? "anonymous"
            : null //Auto set CORS from integrity use stat
          : rely.cors
          ? "use-credentials"
          : "anonymous"; //Use user cors
      return {
        name: rely.name,
        url: url,
        integrity: integrity,
        cors: cors,
      };
    })
  );
  return relyDatas;
}

/**
 * Create plugin
 * @param relys A array of relys need to be import from CDN
 * @param cdnSource CDN resouce url format
 */
export default async function importFromCDN(
  relys: IRely[],
  cdnSource: string
): Promise<Plugin> {
  // Check is rely names are unique
  const relyNameHash: string[] = [];
  relys.forEach((value: IRely) => {
    if (relyNameHash.indexOf(value.name) != -1) {
      throw new Error(`There are more than one rely called ${value.name}`);
    }
    relyNameHash.push(value.name);
  });
  // splite js and css
  const jsRelys = relys.filter((v) => !Boolean(v.isCSS)) as IRelyJS[];
  const cssRelys = relys.filter((v) => Boolean(v.isCSS)) as IRelyCSS[];
  const data = ([] as IRelyData[]).concat(
    ...(await dealJSRelys(jsRelys, cdnSource)),
    ...(await dealCSSRelys(cssRelys, cdnSource))
  );

  return {
    name: "vite-plugin-cdn-import-rely",
    enforce: "pre",
    apply: "build",
    config: (config: UserConfig, env: ConfigEnv) => {
      let globals: { [index: string]: string } = {};
      data.forEach((v) => (globals[v.name] = relyDataIsJS(v) ? v.var : "NaN"));
      return {
        build: {
          rollupOptions: {
            // Insert rollup config
            plugins: [externalGlobals(globals)],
          },
        },
      };
    },
    transformIndexHtml(html) {
      // Render resource import DOM
      const codes = data.map((value: IRelyData) => {
        let code = "";
        if (relyDataIsJS(value)) {
          code = code.concat(`<script`);
          code = code.concat(` src="${value.url}"`);
        } else {
          code = code.concat(`<link`);
          code = code.concat(` href="${value.url}"`);
        }
        if (value.integrity !== null) {
          code = code.concat(` integrity="${value.integrity}"`);
        }
        if (value.cors !== null) {
          code = code.concat(` crossorigin="${value.cors}"`);
        }
        if (relyDataIsJS(value)) {
          code = code.concat(`></script>`);
        } else {
          code = code.concat(` rel="stylesheet">`);
        }
        return code;
      });
      const div = "\n    ";
      return html.replace(
        /<\/title>/i,
        `</title>${div}${div}${codes.join(div)}${div}`
      );
    },
  };
}
