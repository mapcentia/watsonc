import Plot from "react-plotly.js";
import { useState, useEffect } from "react";
import moment from "moment";
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

function PlotComponent(props) {
  const [plot, setPlot] = useState(
    <p className="text-muted">{__(`At least one y axis has to be provided`)}</p>
  );
  let layout =
    JSON.parse(JSON.stringify(config?.extensionConfig?.watsonc?.plotLayout)) ||
    {};
  let yaxisTitles =
    JSON.parse(JSON.stringify(config?.extensionConfig?.watsonc?.yaxisTitles)) ||
    {};

  useEffect(() => {
    console.log(props.plotMeta);

    let num_types = [
      ...new Set(
        props.plotData.map((elem) => elem.tstype_id).filter((elem) => elem != 4)
      ),
    ];
    console.log(num_types);

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
      } else if (num_types.length == 2) {
        plotData = plotData.map((elem) => {
          return {
            ...elem,
            yaxis: elem.tstype_id === num_types[0] ? "y1" : "y2",
          };
        });
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
        };
      }
    }

    if (plotData.length > 0) {
      let min = moment.min(plotData.map((elem) => moment(elem.x[0])));
      console.log(min);

      let max = moment.max(plotData.map((elem) => moment(elem.x.slice(-1)[0])));
      layout.xaxis = {
        ...layout.xaxis,
        range: [min.valueOf(), max.valueOf()],
      };

      var resetAxes = {
        name: "myResetScale2d",
        title: "Reset axes",
        click: function (gd) {
          console.log(gd.layout);
        },
      };

      var config = {
        // modeBarButtonsToAdd: [resetAxes],
        // modeBarButtonsToRemove: ["resetScale2d"],
        doubleClick: "autosize",
      };
    }

    setPlot(
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        onLegendDoubleClick={(param) =>
          console.log("Legend double clicked", param)
        }
        onLegendClick={(param) => console.log("Legend clicked", param)}
        style={{ width: "100%", height: `100%` }}
      />
    );
    if (props.yAxis2LayoutSettings) {
      layout.yaxis2 = props.yAxis2LayoutSettings;
    }
  }, [props.plotData, props.yAxis2LayoutSettings]);

  return (
    <div style={{ maxHeight: $(document).height() * 0.4 + 40 + "px" }}>
      <div
        style={{
          height: `${props.height - 50}px`,
          border: `1px solid lightgray`,
        }}
      >
        {plot}
      </div>
    </div>
  );
}

export default PlotComponent;
