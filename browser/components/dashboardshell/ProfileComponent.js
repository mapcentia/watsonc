import Plot from "react-plotly.js";
import { useState, useEffect } from "react";

function PlotComponent(props) {
  const [data, setData] = useState(props.plotMeta.profile.data.data);
  const [layout, setLayout] = useState(props.plotMeta.profile.data.layout);

  const [plot, setPlot] = useState(
    <p className="text-muted">{__(`At least one y axis has to be provided`)}</p>
  );

  useEffect(() => {
    if (props.plotMeta) {
      let dataCopy = JSON.parse(
        JSON.stringify(props.plotMeta.profile.data.data)
          .replace(/%28/g, "(")
          .replace(/%29/g, ")")
      );
      dataCopy.map((item, index) => {
        if (!dataCopy[index].mode) dataCopy[index].mode = "lines";
      });
      let layoutCopy = JSON.parse(
        JSON.stringify(props.plotMeta.profile.data.layout)
      );
      layoutCopy.margin = {
        l: 50,
        r: 5,
        b: 45,
        t: 5,
        pad: 1,
      };
      layoutCopy.autosize = true;
      setData(dataCopy);
      setLayout(layoutCopy);
    }
  }, [props.plotMeta]);

  return (
    <div>
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
          data={data}
          useResizeHandler={true}
          onClick={props.onClick}
          config={{
            modeBarButtonsToRemove: ["autoScale2d"],
            responsive: true,
            doubleClick: false,
          }}
          layout={layout}
          style={{ width: "100%", height: `100%` }}
        />
      </div>
    </div>
  );
}

export default PlotComponent;
