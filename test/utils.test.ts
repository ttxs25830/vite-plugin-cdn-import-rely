import * as utils from "../src/utils";
test("GetPackageVersion", () => {
  expect(utils.getPackageVersion("@jest/environment")).toBe("29.0.3");
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