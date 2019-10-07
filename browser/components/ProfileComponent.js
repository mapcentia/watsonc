import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';

import SortableHandleComponent from './SortableHandleComponent';

/**
 * Creates single profile with multiple measurements displayed on it
 */
class ProfileComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let dataCopy = JSON.parse(JSON.stringify(this.props.plotMeta.profile.data.data).replace(/%28/g, '(').replace(/%29/g, ')'));
        dataCopy.map((item, index) => {
            if (!dataCopy[index].mode) dataCopy[index].mode = 'lines';
        });

        let plot = (<p className="text-muted">{__(`At least one y axis has to be provided`)}</p>);
        if (this.props.plotMeta) {
            let layoutCopy = JSON.parse(JSON.stringify(this.props.plotMeta.profile.data.layout));
            layoutCopy.margin = {
                l: 50,
                r: 5,
                b: 45,
                t: 5,
                pad: 1
            };
            layoutCopy.autosize = true;

            plot = (<Plot
                data={dataCopy}
                useResizeHandler={true}
                onClick={this.props.onClick}
                config={{modeBarButtonsToRemove: ['autoScale2d']}}
                layout={layoutCopy}
                style={{width: "100%", height: `${this.props.height - 60}px`}}/>);
        }

        return (<div>
            <div style={{height: `40px`}}>
                <div style={{float: `left`}}>
                    <h4>{this.props.plotMeta.profile.title}</h4>
                </div>
                <div style={{float: `right`}}>
                    <a
                        className="btn btn-primary"
                        href="javascript:void(0)"
                        title={__(`Change datatype`) + ` ` + this.props.plotMeta.profile.title}
                        onClick={() => { this.props.onChangeDatatype(this.props.plotMeta.key)}}
                        style={{padding: `0px`}}>
                        <i className="fa fa-edit"></i> {__(`Change datatype`)}
                    </a> <SortableHandleComponent title={this.props.plotMeta.profile.title}/> <a
                        className="btn"
                        href="javascript:void(0)"
                        title={__(`Remove`) + ` ` + this.props.plotMeta.profile.title}
                        onClick={() => { this.props.onDelete(this.props.plotMeta.key)}}
                        style={{padding: `0px`, marginLeft: `20px`}}>
                        <i className="fa fa-remove"></i> {__(`Remove`)}
                    </a>
                </div>
            </div>
            <div style={{height: `${this.props.height - 50}px`, border: `1px solid lightgray`}}>{plot}</div>
        </div>);
    }
}

ProfileComponent.propTypes = {
    onDelete: PropTypes.func.isRequired,
    onChangeDatatype: PropTypes.func.isRequired,
    plotMeta: PropTypes.object.isRequired
};

export default ProfileComponent;