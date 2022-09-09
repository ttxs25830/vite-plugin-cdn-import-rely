import * as utils from "../src/utils";
test("GetPackageVersion", () => {
  expect(utils.getPackageVersion("@jridgewell/gen-mapping")).toBe("0.3.2");
});
test("GetSRIFromURL", async () => {
  expect(
    await utils.getSRIFromURL(
      "https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.38/vue.cjs.js"
    )
  ).toBe(
    "sha512-zdVl3VXeIbC+voYo4oJ7cIvMb8mP1l8LFe2pF0PlYlHwqEP0mcAyDIl1XSaQZwALrC2tYsFg+rww4TF4I/4lTA=="
  );
});
test("RenderURL", () => {
  expect(
    utils.renderUrl("{name}/{version}/{path}", {
      name: "NAME",
      version: "VERSION",
      path: "PATH",
    })
  ).toBe("NAME/VERSION/PATH");
});
test("RelyTreeAnalyzeNormal", () => {
  expect(
    JSON.stringify(
      utils.relyTreeAnalyze([
        {
          name: "a",
          var: "",
          path: "",
          relys: [],
        },
        {
          name: "b",
          var: "",
          path: "",
          relys: ["c"],
        },
        {
          name: "c",
          var: "",
          path: "",
          relys: ["a"],
        },
        {
          name: "d",
          var: "",
          path: "",
          relys: ["b"],
        },
        {
          name: "e",
          var: "",
          path: "",
          relys: [],
        },
      ])
    )
  ).toBe(
    '[{"name":"a","var":"","path":"","relys":[]},{"name":"c","var":"","path":"","relys":["a"]},{"name":"b","var":"","path":"","relys":["c"]},{"name":"e","var":"","path":"","relys":[]},{"name":"d","var":"","path":"","relys":["b"]}]'
  );
});
test("RelyTreeAnalyzeWithCircularDependency", () => {
  expect(() => {
    utils.relyTreeAnalyze([
      {
        name: "a",
        var: "",
        path: "",
      },
      {
        name: "b",
        var: "",
        path: "",
        relys: ["c"],
      },
      {
        name: "c",
        var: "",
        path: "",
        relys: ["b"],
      },
    ]);
  }).toThrow("Circular dependency");
  expect(() => {
    utils.relyTreeAnalyze([
      {
        name: "a",
        var: "",
        path: "",
        relys: ["c"],
      },
      {
        name: "b",
        var: "",
        path: "",
        relys: ["c"],
      },
      {
        name: "c",
        var: "",
        path: "",
        relys: ["b"],
      },
    ]);
  }).toThrow("Circular dependency");
});
