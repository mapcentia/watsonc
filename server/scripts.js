/**
 * Handling requests to Python scripts
 */

var reproject = require("reproject");
var utmZone = require("./../../../browser/modules/utmZone.js");
var request = require("request");
const spawn = require("child_process").spawn;
var config = require("./../../../config/config");
var moduleConfig = require("./../config/config");
const { cwd } = require("process");

const profileScriptHandler = (req, res) => {
  if (!config.gc2.host) throw new Error(`GC2 host has to be specified`);

  //let zone = utmZone.getZone(req.body.profile.geometry.coordinates[0][1], req.body.profile.geometry.coordinates[0][0]);
  let zone = "32";
  let crss = {
    "EPSG:25832":
      "+proj=utm +zone=" +
      zone +
      " +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ",
  };
  // console.log("body", req.body);
  let reprojectedProfile = reproject.reproject(
    req.body.profile,
    "EPSG:4326",
    "EPSG:25832",
    crss
  );

  let inputJSON = {
    coordinates: reprojectedProfile.geometry.coordinates,
    DGU_nr: req.body.DGU_nr,
    Profile_depth: parseInt(req.body.depth),
  };

  if (req.body.compound) inputJSON.Compound = req.body.compound;

  if (req.body.layers && req.body.layers.length > 0) {
    inputJSON.layers = [];
    inputJSON.overlap = [];
    req.body.layers.map((item) => {
      inputJSON.layers.push(item.gid);
      inputJSON.overlap.push(item.intersectionSegments);
    });
  }

  let result = "";
  let errorOccured = false;
  const pythonProcess = spawn(
    moduleConfig.pythonCommand,
    [
      moduleConfig.profileScriptPath,
      '"' + JSON.stringify(inputJSON).replace(/"/g, "'") + '"',
    ],
    {
      cwd: moduleConfig.profileProjectPath,
      shell: true,
    }
  );

  pythonProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  pythonProcess.stdout.on("close", function (code) {
    let parsedData = false;

    let error = false;
    try {
      let localParsedData = JSON.parse(result);
      parsedData = localParsedData;
    } catch (e) {
      error = e.toString();
    }

    if (errorOccured === false) {
      if (error === false) {
        res.send(parsedData);
      } else {
        res.status(400);
        res.send({
          status: `error`,
          message: error,
          result: parsedData,
          process: pythonProcess.spawnargs,
          pycmd: [
            moduleConfig.pythonCommand,
            moduleConfig.profileScriptPath,
            '"' + JSON.stringify(inputJSON).replace(/"/g, "'") + '"',
          ],
        });
      }
    }
  });

  pythonProcess.stderr.on("data", (data) => {
    console.log("error", data.toString());
    errorOccured = true;
    res.status(400);
    res.send({
      status: `error`,
      message: data.toString(),
      process: pythonProcess.spawnargs,
      pycmd: [
        moduleConfig.pythonCommand,
        moduleConfig.profileScriptPath,
        '"' + JSON.stringify(inputJSON).replace(/"/g, "'") + '"',
      ],
    });
  });
};

const instersectionScriptHandler = (req, res) => {
  if (!config.gc2.host) throw new Error(`GC2 host has to be specified`);

  if (req.body.profile && req.body.profile.type) {
    let zone = "32";
    let crss = {
      "EPSG:25832":
        "+proj=utm +zone=" +
        zone +
        " +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ",
    };
    let reprojectedProfile = reproject.reproject(
      req.body.profile,
      "EPSG:4326",
      "EPSG:25832",
      crss
    );

    let inputJSON = {
      coordinates: reprojectedProfile.geometry.coordinates,
      bufferRadius: req.body.bufferRadius,
    };

    let errorOccured = false;
    const pythonProcess = spawn(
      moduleConfig.pythonCommand,
      [
        "--project " + moduleConfig.profileProjectPath,
        moduleConfig.intersectionsScriptPath,
        '"' + JSON.stringify(inputJSON).replace(/"/g, "'") + '"',
      ],
      { shell: true }
    );
    console.log(pythonProcess.spawnargs);
    // let table = `chemicals.boreholes_time_series_without_chemicals`;
    // let sql = `SELECT * FROM ${table} WHERE ST_Intersects(ST_Transform(ST_geomfromtext('${req.body.data}', 4326), 25832), the_geom)`;

    // let url = config.gc2.host + `/api/v1/sql/jupiter`;
    // let data = {
    //   q: Buffer.from(sql).toString("base64"),
    //   base64: true,
    //   srs: 4326,
    //   lifetime: 0,
    //   client_encoding: `UTF8`,
    // };

    // request.post({ url, form: data }, function (err, localRes) {
    // let boreholeNames = [];
    // let parsedResponse = JSON.parse(localRes.body);
    // parsedResponse.features.map((item) => {
    //   if (item.properties && item.properties.boreholeno) {
    //     boreholeNames.push(item.properties.boreholeno);
    //   }
    // });

    //let zone = utmZone.getZone(req.body.profile.geometry.coordinates[0][1], req.body.profile.geometry.coordinates[0][0]);

    pythonProcess.stdout.on("data", (data) => {
      let stringifieddata = data.toString();
      let error = false;
      let parsedData;
      if (stringifieddata.includes("return:")) {
        stringifieddata = stringifieddata.substring(8);
      } else {
        return;
      }
      try {
        parsedData = JSON.parse(stringifieddata);
      } catch (e) {
        error = e.toString();
      }

      if (errorOccured === false) {
        if (error === false) {
          res.send({
            result: parsedData,
            // boreholeNames,
          });
        } else {
          console.error("Error occured:", parsedData);

          res.status(400);
          res.send({
            status: `error`,
            message: error,
            pycmd: [
              moduleConfig.pythonCommand,
              moduleConfig.intersectionsScriptPath,
              JSON.stringify(inputJSON),
            ],
            result: parsedData,
          });
        }
      }
    });

    pythonProcess.stderr.on("data", (data) => {
      console.log("error", data.toString());
      errorOccured = true;
      res.status(400);
      res.send({
        status: `error`,
        message: data.toString(),
        pycmd: [
          moduleConfig.pythonCommand,
          moduleConfig.intersectionsScriptPath,
          JSON.stringify(inputJSON),
        ],
      });
    });
    // });
  } else {
    res.status(400);
    res.send({
      status: `error`,
      message: `Profile GeoJSON is not provided`,
    });
  }
};

const reportHandler = (req, res) => {
  if (!config.gc2.host) throw new Error(`GC2 host has to be specified`);

  console.log(moduleConfig.pesticidProjectPath);
  const pythonProcess = spawn(
    moduleConfig.pythonCommand,
    [
      moduleConfig.reportScriptPath,
      req.query.komcode,
      moduleConfig.reportSavePath,
      req.query.userid,
    ],
    {
      cwd: moduleConfig.pesticidProjectPath,
      shell: true,
    }
  );
  console.log(pythonProcess.spawnargs);
  let result = "";
  let errorOccured = false;

  pythonProcess.stdout.on("data", (data) => {
    console.log("data", data.toString());
    result += data.toString();
  });

  pythonProcess.stdout.on("close", function (code) {
    console.log("code", code);
    if (errorOccured === true) {
      res.status(400);
      res.send({
        status: `error`,
        message: result,
        process: pythonProcess.spawnargs,
        pycmd: [
          moduleConfig.pythonCommand,
          moduleConfig.reportScriptPath,
          req.query.komcode,
          moduleConfig.reportSavePath,
          req.query.userid,
        ],
      });
    } else {
      res.send({
        success: true,
        path: result,
        url: "/tmp/" + result.split("/").reverse()[0],
      });
    }
  });

  pythonProcess.stderr.on("data", (data) => {
    console.log("error", data.toString());
    errorOccured = true;
  });
};

module.exports = {
  instersectionScriptHandler,
  profileScriptHandler,
  reportHandler,
};
