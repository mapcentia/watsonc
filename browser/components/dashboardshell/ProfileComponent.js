import Plot from 'react-plotly.js';
import { useState, useEffect } from 'react';

function PlotComponent(props) {

    const [plot, setPlot] = useState(<p className="text-muted">{__(`At least one y axis has to be provided`)}</p>);

    useEffect(() => {
    if (props.plotMeta) {
        let dataCopy = JSON.parse(JSON.stringify(props.plotMeta.profile.data.data).replace(/%28/g, '(').replace(/%29/g, ')'));
        dataCopy.map((item, index) => {
            if (!dataCopy[index].mode) dataCopy[index].mode = 'lines';
        });
        let layoutCopy = JSON.parse(JSON.stringify(props.plotMeta.profile.data.layout));
        layoutCopy.margin = {
            l: 50,
            r: 5,
            b: 45,
            t: 5,
            pad: 1
        };
        layoutCopy.autosize = true;

        setPlot(<Plot
            data={dataCopy}
            useResizeHandler={true}
            onClick={props.onClick}
            config={{modeBarButtonsToRemove: ['autoScale2d']}}
            layout={layoutCopy}
            style={{width: "100%", height: `${props.height - 60}px`}}/>);
    }

    }, [props.plotMeta]);

    return (<div>
                <div style={{height: `${props.height - 50}px`, border: `1px solid lightgray`}}>{plot}</div>
            </div>)

}

export default PlotComponent;
