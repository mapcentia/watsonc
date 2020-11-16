import React from 'react';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';


/**
 * Measurement component
 */
class ModalMeasurementComponent extends React.Component {
    constructor(props) {
        if (props.itemKey === "_2712")
            console.log(props)
        super(props);
    }

    render() {
        const isDragging = this.props.isDragging;

        let circleIcon = false;
        if (this.props.icon) {
            circleIcon = (<img src={this.props.icon} alt={this.props.title}
                               style={{width: `12px`, height: `12px`, marginTop: `-2px`}}/>);
        }

        if (this.props.chemicalLimits === null) {
            return this.props.connectDragSource(<div
                title={__(`Drag and drop measurement to add it to time series`)}
                className="btn btn-sm btn-primary js-plotted-property"
                data-gid="{this.props.boreholeno}"
                data-key="{this.props.itemKey}"
                data-intake-index="{this.props.intakeIndex}"
                style={{
                    padding: `4px`,
                    margin: `1px`,
                    zIndex: `1000`,
                    backgroundColor: (isDragging ? `darkgreen` : ``),
                    color: (isDragging ? `white` : ``),
                    width: '100%',
                    textAlign: 'left'

                }}>
                <i className="fa fa-arrows-alt"></i> {circleIcon} {this.props.title} ({this.props.intakeName})
            </div>);
        } else {
            return this.props.connectDragSource(<div
                title={__(`Drag and drop measurement to add it to time series`)}
                className="btn btn-sm btn-primary js-plotted-property"
                data-gid="{this.props.boreholeno}"
                data-key="{this.props.itemKey}"
                data-intake-index="{this.props.intakeIndex}"
                style={{
                    padding: `4px`,
                    margin: `1px`,
                    zIndex: `1000`,
                    backgroundColor: (isDragging ? `darkgreen` : ``),
                    color: (isDragging ? `white` : ``),
                    width: '100%',
                    textAlign: 'left'

                }}>
                <div>
                    <div>
                        <i className="fa fa-arrows-alt"></i> {circleIcon} {this.props.title} ({this.props.intakeName})
                    </div>
                    <div style={{color: 'gray', 'fontSize': 'smaller', 'paddingLeft': '15px'}}>
                        Historisk: {this.props.detectionLimitReachedForMax ? "< " : ""}{this.props.maxMeasurement === 0 ? "-" : this.props.maxMeasurement} {this.props.maxMeasurement === 0 ? "" : <span style={{textTransform: "lowercase"}}>{this.props.unit}</span>} |
                        Seneste: {this.props.detectionLimitReachedForLatest ? "< " : ""}{this.props.latestMeasurement} <span style={{textTransform: "lowercase"}}>{this.props.unit}</span>
                    </div>
                </div>
            </div>);
        }
    }
}

const measurementSource = {
    beginDrag(props) {
        console.log("Begin" , props)
        return {
            gid: props.gid,
            itemKey: props.itemKey,
            intakeIndex: props.intakeIndex,
            onAddMeasurement: props.onAddMeasurement
        };
    }
};

const collect = (connect, monitor) => {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
};

ModalMeasurementComponent.propTypes = {
    itemKey: PropTypes.string.isRequired,
    intakeIndex: PropTypes.number.isRequired,
    intakeName: PropTypes.string.isRequired,
    onAddMeasurement: PropTypes.func.isRequired,
};

export default DragSource(`MEASUREMENT`, measurementSource, collect)(ModalMeasurementComponent);
