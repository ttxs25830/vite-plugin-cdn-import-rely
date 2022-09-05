export interface IRely{
    name: string,
    var: string,
    path: string,
    version?: string,
    integrity?: string | false,
    cors?: boolean,
    isCSS?: boolean,
    isModule?: boolean
}
export interface IRelyData {
    name: string,
    url: string,
    integrity: string | null,
    cors: "anonymous" | "use-credentials" | null,
    isModule: boolean,
    isCSS: boolean,
    var: string
}