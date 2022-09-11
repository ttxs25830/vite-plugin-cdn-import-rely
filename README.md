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
          name: "element-plus",
          var: "ElementPlus",
          path: "index.full.min.js",
          relys: ["vue"],
        },
        {
          name: "element-plus/es/locale/lang/zh-cn",
          pkgName: "element-plus",
          var: "ElementPlusLocaleZhCn",
          path: "locale/zh-cn.min.js",
          relys: ["element-plus"],
        },
        {
          name: "element-plus/dist/index.css",
          pkgName: "element-plus",
          path: "index.min.css",
          isCSS: true,
        },
        {
          name: "vue",
          var: "Vue",
          path: "vue.global.prod.min.js",
        },
        {
          name: "vue-router",
          var: "VueRouter",
          path: "vue-router.global.prod.min.js",
          relys: ["vue"],
        },
        {
          name: "pinia",
          var: "Pinia",
          path: "pinia.iife.prod.min.js",
          relys: ["vue-demi"],
        },
        {
          name: "vue-demi",
          var: "VueDemi",
          path: "index.iife.min.js",
          version: "0.13.11",
          relys: ["vue"],
        },
      ],
      "https://cdnjs.cloudflare.com/ajax/libs/{name}/{version}/{path}"
    ),
  ],
});
```
## Todo
- Fix Bugs
- Write full test
- Write API document
- Write ZH_CN document