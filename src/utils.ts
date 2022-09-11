import path from "path";
import fs from "fs";
import axios from "axios";
import getSRI from "get-sri";
import { IRelyCSS, IRelyData, IRelyDataJS, IRelyJS } from "./index.type";

/**
 * Get package version from package-lock.json
 * @param name package's name
 * @returns version in string
 */
export const getPackageVersion = (name: string) => {
  const root = process.cwd();
  const pkglockFile = path.join(root, "package-lock.json");
  if (fs.existsSync(pkglockFile)) {
    const pkgs = JSON.parse(fs.readFileSync(pkglockFile, "utf8"))["packages"];
    for (const i in pkgs) {
      if (i == `node_modules/${name}`) {
        if ("version" in pkgs[i]) {
          return pkgs[i]["version"];
        }
      }
    }
    throw new Error(`Package ${name} not found in package-lock.json`);
  } else {
    throw new Error(`Can not find package-lock.json file at ${pkglockFile}`);
  }
};

/**
 * Check is the path a full url
 */
const isFullURL = (path: string) => {
  return path.startsWith("https://") || path.startsWith("http://");
};

/**
 * Render path to full url by rely datas
 * @param base CDN url format
 * @param data Rely datas
 * @returns Full url
 */
export const renderUrl = (
  base: string,
  data: {
    name: string;
    version: string;
    path: string;
  }
) => {
  return isFullURL(data.path)
    ? data.path
    : base
        .replace(/\{name\}/g, data.name)
        .replace(/\{version\}/g, data.version)
        .replace(/\{path\}/g, data.path);
};

export const getSRIFromURL = async (url: string) => {
  const req = await axios.get(url).catch((reason: any) => {
    throw new Error(
      `Fail request to url ${url} with status ${reason.response.status}`
    );
  });
  return getSRI(req.data, getSRI.SHA512, true);
};

/**
 * Analyze rely tree into a order make every rely
 * will not be loaded before there rely loaded
 */
export const jsRelyTreeAnalyze = (relys: IRelyJS[]) => {
  let needSort = relys.map((v) => v.name);
  const relation: Record<string, string[]> = {};
  relys.forEach((v) => (relation[v.name] = v.relys ? v.relys : []));
  const out: string[] = [];
  while (needSort.length > 0) {
    const unRelys = needSort.filter((value: string) => {
      let flag = false;
      for (let i in relation) {
        relation[i].forEach((v) => (flag = flag || v == value));
        if (flag) {
          return false;
        }
      }
      return true;
    });
    if (unRelys.length == 0) {
      throw new Error(`Circular dependency in ${needSort.join(", ")}`);
    }
    out.push(...unRelys);
    needSort = needSort.filter((v) => unRelys.indexOf(v) == -1);
    unRelys.forEach((v) => delete relation[v]);
  }
  return out.map((v) => relys.find((v2) => v2.name == v) as IRelyJS).reverse();
};
export const cssRelyQueueAnalyze = (relys: IRelyCSS[]) => {
  return relys.slice().sort((a,b) => (b.priority?b.priority:0) - (a.priority?a.priority:0))
}
export const relyDataIsJS = (data: IRelyData): data is IRelyDataJS => {
  return 'var' in data
}