(function() {
  "use strict";
  const walk = require("walk");
  const path = require("path");
  const fs = require("fs");
  const extractSvgPath = require("extract-svg-path");
  const extract = require('extract-svg-viewbox');
  const prettier = require("prettier");
  const SOURCE_FOLER = __dirname + "/icons/";
  const DESTINATION_FOLDER = process.argv[2];
  const icons = [];
  const walker = walk.walk(SOURCE_FOLER);
  walker.on("file", async function(_root, fileStats, next) {
    var isSVG = path.parse(fileStats.name).ext === ".svg";
    if (isSVG) {
      var svgFilePath = SOURCE_FOLER + fileStats.name;
      var svg = fs.readFileSync(svgFilePath, 'utf8');
      var svgPath = extractSvgPath(svgFilePath);
      var svgViewBox = extract(svg);
      icons.push({
        name: path.parse(fileStats.name).name,
        path: svgPath,
        viewbox: svgViewBox
      });
    }
    next();
  });

  walker.on("errors", function(_root, _nodeStatsArray, next) {
    next();
  });

  walker.on("end", function() {
    // JSON
    fs.writeFile(
      DESTINATION_FOLDER + "/icons.json",
      JSON.stringify(icons),
      "utf8",
      function() {}
    );

    // Types
    const fileContents = `export const IconName = {
      ${icons.map(
        icon =>
          `${icon.name.toUpperCase().replace(/-/g, "_")}: "${icon.name}" as "${
            icon.name
          }"`
      )}
    }
    export type IconName = typeof IconName[keyof typeof IconName];`;
    fs.writeFile(
      DESTINATION_FOLDER + "/icons.ts",
      prettier.format(fileContents, {
        parser: "typescript"
      }),
      "utf8",
      function() {
        console.log(
          "🎉  Finished writing " +
            icons.length +
            " icons and their type definitions to " +
            DESTINATION_FOLDER +
            "/icons.ts"
        );
      }
    );
  });
})();
