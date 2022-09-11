export interface IRelyJS {
  name: string;
  var: string;
  path: string;
  version?: string;
  integrity?: string | false;
  cors?: boolean;
  isCSS?: false;
  relys?: string[];
}
export interface IRelyCSS {
  name: string;
  path: string;
  pkgName: string;
  version?: string;
  integrity?: string | false;
  cors?: boolean;
  isCSS: true;
  priority?: number;
}
export type IRely = IRelyJS | IRelyCSS;
export interface IRelyDataJS {
  name: string;
  var: string;
  url: string;
  integrity: string | null;
  cors: "anonymous" | "use-credentials" | null;
}
export interface IRelyDataCSS {
  name: string;
  url: string;
  integrity: string | null;
  cors: "anonymous" | "use-credentials" | null;
}
export type IRelyData = IRelyDataJS | IRelyDataCSS;
