import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';

const utils = require('./../utils');

/**
 * Plot component
 */
class ModalPlotComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let removeButtons = [];
        this.props.plot.measurements.map((measurement, index) => {
            let measurementDisplayTitle = measurement;
            let splitMeasurementId = measurement.split(':');

            let customGraph = -1, key, intakeIndex;
            if (splitMeasurementId.length === 3) {
                customGraph = false;
                key = splitMeasurementId[1];
                intakeIndex = splitMeasurementId[2];
            } else if (splitMeasurementId.length === 4) {
                customGraph = true;
                key = splitMeasurementId[1] + ':' + splitMeasurementId[2];
                intakeIndex = splitMeasurementId[3];
            } else {
                throw new Error(`Invalid measurement key (${measurement})`);
            }

            let gid = parseInt(splitMeasurementId[0]);
            if (this.props.dataSource && this.props.dataSource.length > 0) {
                this.props.dataSource.map(item => {
                    if (item.properties.gid === gid) {
                        if (customGraph) {
                            let json = JSON.parse(item.properties[splitMeasurementId[1]]).data[splitMeasurementId[2]];
                            let intakeName = `#` + (parseInt(splitMeasurementId[3]) + 1);
                            if (`intakes` in json && Array.isArray(json.intakes) && json.intakes[parseInt(splitMeasurementId[3])] !== null) {
                                intakeName = json.intakes[parseInt(splitMeasurementId[3])];
                            }

                            measurementDisplayTitle = (`${item.properties.boreholeno}, ${json.data[0].name} (${intakeName})`);
                            return false;
                        } else {
                            let json = JSON.parse(item.properties[splitMeasurementId[1]]);
                            let intakeName = `#` + (parseInt(splitMeasurementId[2]) + 1);
                            if (`intakes` in json && Array.isArray(json.intakes) && json.intakes[parseInt(splitMeasurementId[2])] !== null) {
                                intakeName = json.intakes[parseInt(splitMeasurementId[2])];
                            }

                            let title = utils.getMeasurementTitle(item);
                            measurementDisplayTitle = (`${title}, ${json.title} (${intakeName})`);
                            return false;
                        }
                    }
                });
            }

            const onDelete = () => { this.props.onDeleteMeasurement(this.props.plot.id, gid, key, intakeIndex); };

            removeButtons.push(<div key={`remove_measurement_` + index + `_` + splitMeasurementId[1] + `_` + splitMeasurementId[2]}>
                <button
                    title={__(`Remove from time series`)}
                    type="button"
                    className="btn btn-sm btn-primary"
                    data-plot-id="{this.props.plot.id}"
                    data-gid="{gid}"
                    data-key="{splitMeasurementId[1]}"
                    data-intake-index="{splitMeasurementId[2]}"
                    onClick={onDelete}
                    style={{ padding: `4px`, margin: `1px` }}>
                    <i className="fa fa-remove"></i> {measurementDisplayTitle}
                </button>
            </div>);
        });

        const isOver = this.props.isOver;
        return this.props.connectDropTarget(<div
            className="well well-sm js-plot"
            data-id="{this.props.plot.id}"
            style={{
                marginBottom: `18px`,
                boxShadow: `0 4px 12px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)`,
                backgroundColor: (isOver ? `darkgreen` : ``),
                color: (isOver ? `white` : ``),
            }}>
            <div style={{display: 'flex'}}>
                <div>{this.props.plot.title}</div>
                <div style={{marginLeft: 'auto'}}>
                    {__(`Dashboard`)} <input type="checkbox" checked={this.props.isActive}  onChange={(event) => {
                        event.target.checked ? this.props.onPlotShow(this.props.plot) : this.props.onPlotHide(this.props.plot)}}/>
                </div>
            </div>
            <div>{removeButtons}</div>
        </div>);
    }
}

const plotTarget = {
    drop(props, monitor) {
        let item = monitor.getItem();
        item.onAddMeasurement(props.plot.id, item.gid, item.itemKey, item.intakeIndex);
    }
};

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    };
}

ModalPlotComponent.propTypes = {
    onDeleteMeasurement: PropTypes.func.isRequired
};

export default DropTarget(`MEASUREMENT`, plotTarget, collect)(ModalPlotComponent);
