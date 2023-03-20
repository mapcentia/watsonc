import Plot from "react-plotly.js";
// import Plotly from "plotly.js";
import { useState, useEffect } from "react";
import { aggregate } from "../../helpers/aggregate.js";
import moment from "moment";
import _ from "lodash";
// import { Colorscales } from "../shared/constants/colorscales";
const config = require("../../../../../config/config.js");

function next_color() {
  let colorscale =
    JSON.parse(JSON.stringify(config?.extensionConfig?.watsonc?.colorScales)) ||
    {};
  return (custom_colorscale) => {
    return colorscale[custom_colorscale].shift();
  };
}

var autoscale = {
  width: 500,
  //   height: "1em",
  //   viewBox: "0 0 1000 1000",
  path: "M447.1 319.1v135.1c0 13.26-10.75 23.1-23.1 23.1h-135.1c-12.94 0-24.61-7.781-29.56-19.75c-4.906-11.1-2.203-25.72 6.937-34.87l30.06-30.06L224 323.9l-71.43 71.44l30.06 30.06c9.156 9.156 11.91 22.91 6.937 34.87C184.6 472.2 172.9 479.1 160 479.1H24c-13.25 0-23.1-10.74-23.1-23.1v-135.1c0-12.94 7.781-24.61 19.75-29.56C23.72 288.8 27.88 288 32 288c8.312 0 16.5 3.242 22.63 9.367l30.06 30.06l71.44-71.44L84.69 184.6L54.63 214.6c-9.156 9.156-22.91 11.91-34.87 6.937C7.798 216.6 .0013 204.9 .0013 191.1v-135.1c0-13.26 10.75-23.1 23.1-23.1h135.1c12.94 0 24.61 7.781 29.56 19.75C191.2 55.72 191.1 59.87 191.1 63.1c0 8.312-3.237 16.5-9.362 22.63L152.6 116.7l71.44 71.44l71.43-71.44l-30.06-30.06c-9.156-9.156-11.91-22.91-6.937-34.87c4.937-11.95 16.62-19.75 29.56-19.75h135.1c13.26 0 23.1 10.75 23.1 23.1v135.1c0 12.94-7.781 24.61-19.75 29.56c-11.1 4.906-25.72 2.203-34.87-6.937l-30.06-30.06l-71.43 71.43l71.44 71.44l30.06-30.06c9.156-9.156 22.91-11.91 34.87-6.937C440.2 295.4 447.1 307.1 447.1 319.1z",
  // path: "M224 376V512H24C10.7 512 0 501.3 0 488v-464c0-13.3 10.7-24 24-24h336c13.3 0 24 10.7 24 24V352H248c-13.2 0-24 10.8-24 24zm76.45-211.36-96.42-95.7c-6.65-6.61-17.39-6.61-24.04 0l-96.42 95.7C73.42 174.71 80.54 192 94.82 192H160v80c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16v-80h65.18c14.28 0 21.4-17.29 11.27-27.36zM377 407 279.1 505c-4.5 4.5-10.6 7-17 7H256v-128h128v6.1c0 6.3-2.5 12.4-7 16.9z",
  ascent: 500,
  descent: -50,
  //   transform: "matrix(1 0 0 -1 0 850)",
};

function PlotComponent(props) {
  const [layoutState, setLayoutState] = useState(
    JSON.parse(JSON.stringify(config?.extensionConfig?.watsonc?.plotLayout)) ||
      {}
  );
  const [plotDataState, setPlotDataState] = useState(props.plotData);
  const [configState, setConfigState] = useState({});
  const [minmaxRange, setminmaxRange] = useState([0, 1]);
  //   let layout =

  const changeLayout = (minmax) => {
    //   console.log(gd.layout);

    return () =>
      setLayoutState((prev) => {
        prev.xaxis = {
          ...prev.xaxis,
          autorange: false,
          range: [minmax[0], minmax[1]],
        };
        prev.yaxis = {
          ...prev.yaxis,
          autorange: true,
        };
        prev.yaxis2 = {
          ...prev.yaxis2,
          autorange: true,
        };
        prev.yaxis3 = {
          ...prev.yaxis3,
          autorange: true,
        };
        return { ...prev };
      });
  };

  let yaxisTitles =
    JSON.parse(JSON.stringify(config?.extensionConfig?.watsonc?.yaxisTitles)) ||
    {};

  useEffect(() => {
    let layout = JSON.parse(
      JSON.stringify(config?.extensionConfig?.watsonc?.plotLayout)
    );

    let num_types = [
      ...new Set(
        props.plotData
          .sort((a, b) => {
            if (Object.hasOwn(a, "yaxis") && Object.hasOwn(b, "yaxis")) {
              return 0;
            }
            if (Object.hasOwn(a, "yaxis")) {
              return 1;
            }
            if (Object.hasOwn(b, "yaxis")) {
              return -1;
            }
            // a must be equal to b
            return 0;
          })
          .map((elem) => elem.tstype_id)
      ),
    ];

    const give_color = next_color();
    let plotData = props.plotData.map((elem) => {
      if (typeof elem.custom_colorscale != "undefined") {
        var color = give_color(elem.custom_colorscale);
        return {
          ...elem,
          line: {
            ...elem.line,
            color: typeof color == "undefined" ? null : color,
          },
        };
      } else {
        return elem;
      }
    });

    if (!num_types.includes(undefined)) {
      if (num_types.length == 1) {
        layout.yaxis = {
          ...layout.yaxis,
          title: {
            ...layout.yaxis.title,
            text: yaxisTitles[num_types[0]],
          },
        };

        plotData = plotData.map((elem) => {
          return {
            yaxis: "y1",
            ...elem,
          };
        });
      } else if (num_types.length == 2) {
        plotData = plotData.map((elem) => {
          return {
            yaxis: elem.tstype_id === num_types[0] ? "y1" : "y3",
            ...elem,
          };
        });

        layout.yaxis = {
          ...layout.yaxis,
          title: {
            ...layout.yaxis.title,
            text: yaxisTitles[num_types[0]],
          },
        };
        layout.yaxis3 = {
          ...layout.yaxis3,
          title: {
            ...layout.yaxis3.title,
            text: yaxisTitles[num_types[1]],
          },
        };
      } else if (num_types.length > 2) {
        plotData = plotData.map((elem) => {
          return {
            yaxis:
              elem.tstype_id === num_types[0]
                ? "y1"
                : elem.tstype_id === num_types[1]
                ? "y2"
                : "y3",
            ...elem,
          };
        });
        layout.xaxis = {
          ...layout.xaxis,
          domain: [0, 0.9],
        };
        layout.yaxis = {
          ...layout.yaxis,
          title: {
            ...layout.yaxis.title,
            text: yaxisTitles[num_types[0]],
          },
        };
        layout.yaxis2 = {
          ...layout.yaxis2,
          title: {
            ...layout.yaxis2.title,
            text: yaxisTitles[num_types[1]],
          },
          position: 0.9,
          anchor: "free",
        };
        layout.yaxis3 = {
          ...layout.yaxis3,
          title: {
            ...layout.yaxis3.title,
            text: num_types.length == 3 ? yaxisTitles[num_types[2]] : "Øvrige",
          },
          position: 0.97,
          anchor: "free",
        };
      }
    }

    if (plotData.length > 0) {
      let xmin = moment.min(
        plotData
          .filter(
            (elem) =>
              elem.xaxis != "x2" &&
              typeof elem.x != "undefined" &&
              (elem.tstype_id != 4 || plotData.length == 1)
          )
          .map((elem) => moment(elem.x[0]))
      );

      let xmax = moment.max(
        plotData
          .filter(
            (elem) =>
              elem.xaxis != "x2" &&
              typeof elem.x != "undefined" &&
              (elem.tstype_id != 4 || plotData.length == 1)
          )
          .map((elem) => moment(elem.x.slice(-1)[0]))
      );
      var diff = xmax.diff(xmin);
      xmin = xmin.subtract(diff * 0.02);

      xmin = xmin.format("YYYY-MM-DD HH:mm:ss.SSS");
      xmax = xmax.format("YYYY-MM-DD HH:mm:ss.SSS");
      setminmaxRange([xmin, xmax]);
      layout.xaxis = {
        ...layout.xaxis,
        range: [xmin, xmax],
      };

      var resetAxes = {
        name: "myAutoscale",
        title: "Autoscale",
        icon: autoscale,
        click: changeLayout([xmin, xmax]),
      };

      var conf = {
        responsive: true,
        modeBarButtons: [
          ["toImage", "zoom2d", "pan2d", "zoomIn2d", "zoomOut2d"],
          [resetAxes],
          ["hoverClosestCartesian", "hoverCompareCartesian"],
        ],
        // modeBarButtonsToAdd: [resetAxes],
        // modeBarButtonsToRemove: ["resetScale2d", "autoScale2d", "toggleSpikelines"],
        doubleClick: false,
      };
    }
    for (const agg of props.aggregate) {
      let ind = props.plotMeta.measurements.findIndex(
        (elem) => elem === agg.idx
      );
      if (ind != -1) {
        var grouped = aggregate(
          plotData[ind].x,
          plotData[ind].y,
          agg.window,
          agg.func
        );
        plotData[ind] = {
          ...plotData[ind],
          ...grouped,
        };
        // plotData[ind].x = grouped.x;
        // plotData[ind].y = grouped.y;
        // if (agg.func === 'sum') {
        //   plotData[ind].width = grouped.width;
        // }
      }
    }
    setConfigState(conf);
    setLayoutState(layout);
    setPlotDataState(plotData);
    // setTriggerAggregate((prev) => !prev);
  }, [props.plotData, props.yAxis2LayoutSettings, props.aggregate]);

  //   useEffect(() => {
  //     let plotData = plotDataState;
  //     for (const [key, value] of Object.entries(props.aggregate)) {
  //       var grouped = aggregate(
  //         props.plotData[key].x,
  //         props.plotData[key].y,
  //         value,
  //         _.meanBy
  //       );
  //       plotData[key].x = grouped.x;
  //       plotData[key].y = grouped.y;
  //       console.log(plotData);
  //     }
  //     setPlotDataState([...plotData]);
  //   }, [props.aggregate, triggerAggregate]);

  return (
    //<div style={{ maxHeight: $(document).height() * 0.4 + 40 + "px" }}>
    <div
      style={{
        height:
          typeof props.height == "string"
            ? props.height
            : `${props.height - 50}px`,
        border: `1px solid lightgray`,
      }}
    >
      <Plot
        data={plotDataState}
        layout={layoutState}
        config={configState}
        onLegendDoubleClick={(param) =>
          console.log("Legend double clicked", param)
        }
        useResizeHandler={true}
        onDoubleClick={changeLayout(minmaxRange)}
        onLegendClick={(param) => console.log("Legend clicked", param)}
        style={{ width: "100%", height: `100%` }}
      />
    </div>
    //</div>
  );
}

export default PlotComponent;
