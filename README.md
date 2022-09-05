# vite-plugin-cdn-import-rely
A vite plugin make import rely from CDN easier
## Installation
### npm
`npm i vite-plugin-cdn-import-rely --save-dev`
## Usage
### Example
```js
import importFromCDN from "vite-plugin-cdn-import-rely";

export default defineConfig({
  plugins: [
    importFromCDN(
      [
        {
          name: "vue",
          var: "Vue",
          path: "vue.global.prod.min.js",
        },
        {
          name: "vue-router",
          var: "VueRouter",
          path: "vue-router.global.prod.min.js",
        },
        {
          name: "vue-demi",
          var: "VueDemi",
          path: "index.iife.min.js",
          version: "0.13.11",
        },
        {
          name: "pinia",
          var: "Pinia",
          path: "pinia.iife.prod.min.js",
        },
      ],
      "https://cdnjs.cloudflare.com/ajax/libs/{name}/{version}/{path}"
    ),
  ],
});
```
## Options

| Name    | Description                                                                                  | Type                                                  |
| ------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| rely | A array of objects describe relys we want to import from CDN | Rely[]                                                |
| cdnSource | A string contain `{name}`, `{version}`, `{path}`. So it can be format to a full url point to rely's url | string

## Interfaces
### Rely
| Property | Description | Type | Can be Empty | Default | Example |
| -------- | ----------- | ---- | ------------ | ------- | ------- |
| name | Rely's package name | string | No | / | `vue` |
| var | The global variable's name on user space | string | No | / | `"Vue"` |
| path | The extra path in resource URL | string | No | / | `"vue.global.prod.min.js"` |
| version | The version of rely package. If not given, it will be resolve from `package-lock.json` | string | Yes | / | `"3.2.38"` |
| integrity | A SRI string will use to check if the resource is incomplete or modified when this rssource is load by browser. Will auto generate SHA-512 SRI if is empty. You can still disable it by set it to false | string or `false` | Yes | / | `"sha512-npQPwoPEoxzuLDSytF9RIdsHJd122lMGlUoLuQo2vCYtk6R1DEB03wIknFzHNQNHJKQlPjwcrEqflYWp417eVw=="` |
| cors | If and how we use CORS. CORS will set to `"anonymous"` when this is false, or set to `"use-credentials"` if this is true. When this is empty, CORS will disable if integrity is disable, or set to `"anonymous"` when integrity is enable | boolean | Yes | / | `"anonymous"` |
| isCSS | Is this rely is css or js | boolean | Yes | false | false |
| isModule | Reserved for the future | boolean | Yes | false | / |
| relys | Declare this rely to some other relys and they should load before this | string[] | Yes | [] | [] |

