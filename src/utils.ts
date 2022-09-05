import path from "path"
import fs from 'fs'
import axios from "axios"
import getSRI from 'get-sri'
import { IRely } from "./index.type"

/**
 * Get package version from package-lock.json
 * @param name package's name
 * @returns version in string
 */
export const getPackageVersion = (name: string) => {
    const root = process.cwd()
    const pkglockFile = path.join(root, 'package-lock.json')
    if (fs.existsSync(pkglockFile)) {
        const pkgs = JSON.parse(fs.readFileSync(pkglockFile, 'utf8'))["dependencies"]
        if (name in pkgs) {
            return pkgs[name]["version"]
        } else {
            throw new Error(`Package ${name} not found in package-lock.json`)
        }
    } else {
        throw new Error(`Can not find package-lock.json file at ${pkglockFile}`)
    }
}

/**
 * Check is the path a full url
 */
const isFullURL = (path: string) => {
    return path.startsWith("https://") || path.startsWith("http://")
}

/**
 * Render path to full url by rely datas
 * @param base CDN url format
 * @param data Rely datas
 * @returns Full url
 */
export const renderUrl = (base: string, data: {
    name: string,
    version: string,
    path: string
}) => {
    return (isFullURL(data.path)) ?
        data.path :
        base.replace(/\{name\}/g, data.name)
            .replace(/\{version\}/g, data.version)
            .replace(/\{path\}/g, data.path)
}

export const getSRIFromURL = async (url: string) => {
    return getSRI((await axios.get(url)).data, getSRI.SHA512, true)
}

/**
 * Analyze rely tree into a order make every rely
 * will not be loaded before there rely loaded
 */
export const relyTreeAnalyze = (relys: IRely[]) => {
    let scanQueue: IRely[] = []
    let scanHash: string[] = []
    let stack: IRely[] = []
    let stackHash: string[] = []
    let unroots: string[] = []
    relys.forEach((value: IRely) => {
        if (value.relys) {
            unroots.push(...value.relys)
        }
    })
    relys.forEach((value: IRely) => {
        if (unroots.indexOf(value.name) == -1) {
            stack.unshift(value)
            scanQueue.push(value)
        }
    })
    if (scanQueue.length == 0) {
        throw new Error("Circular dependency")
    }
    for (let i = 0; i < scanQueue.length; i++) {
        if (scanHash.indexOf(scanQueue[i].name) == -1) {
            scanHash.push(scanQueue[i].name)
            const subs = scanQueue[i].relys
            if (subs) {
                subs.forEach((value: string) => {
                    const tmp = relys.filter((v: IRely) => v.name == value)
                    stack.unshift(...tmp)
                    scanQueue.push(...tmp)
                })
            }
        } else {
            throw new Error("Circular dependency")
        }
    }
    const queue = stack.filter((value: IRely) => {
        if (stackHash.indexOf(value.name) == -1) {
            stackHash.push(value.name)
            return true
        } else {
            return false
        }
    })
    if(queue.length < relys.length) {
        throw new Error("Circular dependency")
    }
    return queue
}
