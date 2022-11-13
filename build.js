#!/usr/bin/node
const fs = require("fs");
const statik = require("node-static");
function build() {
  var gitId="undefined"
  if (fs.existsSync(".git")){
    var head=fs.readFileSync(".git/HEAD",{encoding:"utf8"}).split(" ")[1].replace("\n","")
    gitId=fs.readFileSync(".git/"+head,{encoding:"utf8"}).replace("\n","").slice(0,7)
    gitId="'"+gitId+"'"
  }
  require("esbuild")
    .build({
      entryPoints: ["src/index.js"],
      bundle: true,
      define:{GITID:gitId},
      sourcemap: true,
      loader: { ".css": "text" },
      outfile: "build/index.js",
    })
    .catch(() => process.exit(1))
    .then(() => {
      fs.copyFile("src/index.html", "build/index.html", () => {});
      if (process.argv.includes("electron")) {
        fs.copyFile("src/electron.js", "build/electron.js", () => {});
        fs.copyFile("./package.electron.json", "build/package.json", () => {});
      } else {
        fs.copyFile("src/sw.js", "build/sw.js", () => {});
        fs.copyFile("src/menifest.json", "build/menifest.json", () => {});
        fs.copyFile("src/pwa_icon.png", "build/pwa_icon.png", () => {});
      }
      console.log("Build finished!");
    });
}
build();
if (process.argv.includes("watch")) {
  fs.watch("./src", build);
}
if (process.argv.includes("serve")) {
  const file = new statik.Server("./build");

  require("http")
    .createServer(function (request, response) {
      request
        .addListener("end", function () {
          //
          // Serve files!
          //
          file.serve(request, response);
        })
        .resume();
    })
    .listen(8080);
}
