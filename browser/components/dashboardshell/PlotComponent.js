import Plot from 'react-plotly.js';

function PlotComponent(props) {

    let plot = (<p className="text-muted">{__(`At least one y axis has to be provided`)}</p>);
    let layout = {
        displayModeBar: false,
        margin: {
            l: 30,
            r: (props.yAxis2LayoutSettings ? 30 : 5),
            b: 30,
            t: 5,
            pad: 4
        },
        xaxis: {
            autorange: true,
            margin: 0,
            type: 'date'
        },
        yaxis: {
            autorange: true,
        },
        showlegend: true,
        legend: {
            orientation: "h",
            y: -0.2
        },
        autosize: true
    };
    if (props.yAxis2LayoutSettings) {
        layout.yaxis2 = props.yAxis2LayoutSettings;
    }
    console.log(props);
    plot = (<Plot
        data={props.plotData}
        layout={layout}
        onLegendDoubleClick={(param) => console.log("Legend double clicked", param)}
        onLegendClick={(param) => console.log("Legend clicked", param)}
        style={{width: "100%", height: `${props.height - 60}px`}}/>);

    return (<div style={{maxHeight: ($(document).height() * 0.4 + 40) + 'px'}}>
                <div style={{height: `${props.height - 50}px`, border: `1px solid lightgray`}}>{plot}</div>
            </div>)

}

export default PlotComponent;
