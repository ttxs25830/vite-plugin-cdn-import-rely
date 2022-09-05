import { getPackageVersion, getSRIFromURL, renderUrl } from "./utils"
import { ConfigEnv, Plugin, UserConfig } from 'vite'
import { IRely, IRelyData } from "./index.type"
import externalGlobals from 'rollup-plugin-external-globals'


/**
 * Create plugin
 * @param relys A array of relys need to be import from CDN
 * @param cdnSource CDN resouce url format
 */
export default async function importFromCDN(relys: IRely[], cdnSource: string): Promise<Plugin> {
    const relyDatas = await Promise.all(relys.map(async (rely: IRely): Promise<IRelyData> => {
        const url = renderUrl(cdnSource, {
            name: rely.name,
            version: (rely.version) ? rely.version : getPackageVersion(rely.name),
            path: rely.path
        })
        const integrity = (rely.integrity === false) ?
            null :
            ((typeof rely.integrity == "string") ?
                rely.integrity :
                await getSRIFromURL(url))
        const cors = (typeof rely.cors == "undefined") ?
            ((integrity) ? "anonymous" : null) : //Auto set CORS from does integrity in use
            ((rely.cors) ? "use-credentials" : "anonymous") //Use user cors
        return {
            name: rely.name,
            url: url,
            integrity: integrity,
            cors: cors,
            isModule: Boolean(rely.isModule),
            isCSS: Boolean(rely.isCSS),
            var: rely.var
        }
    }))
    return {
        name: "vite-plugin-cdn-import-rely",
        enforce: "pre",
        apply: "build",
        config: (config: UserConfig, env: ConfigEnv) => {
            let globals: { [index: string]: string } = {}
            relyDatas.forEach((value: IRelyData) => globals[value.name] = value.var)
            return {
                build: {
                    rollupOptions: {
                        plugins: [externalGlobals(globals)]
                    }
                }
            }
        },
        transformIndexHtml(html) {
            const codes = relyDatas.map((value: IRelyData) => {
                let code = ""
                if (value.isCSS) {
                    code = code.concat(`<link`)
                    code = code.concat(` href="${value.url}"`)
                } else {
                    code = code.concat(`<script`)
                    code = code.concat(` src="${value.url}"`)
                }
                if (value.integrity) {
                    code = code.concat(` integrity="${value.integrity}"`)
                }
                if (value.cors !== null) {
                    code = code.concat(`crossorigin="`)
                    if (value.cors) {
                        code.concat(`use-credentials`)
                    } else {
                        code.concat(`anonymous`)
                    }
                    code = code.concat(`"`)
                }
                if (value.isCSS) {
                    code = code.concat(` rel="stylesheet">`)
                } else {
                    code = code.concat(`></script>`)
                }
                return code
            })
            const div = "\n    "
            return html.replace(
                /<\/title>/i,
                `</title>${div}${div}${codes.join(div)}${div}`
            )
        },
    }
}