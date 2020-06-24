import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import withDragDropContext from './withDragDropContext';
import ModalMeasurementComponent from './ModalMeasurementComponent';
import ModalPlotComponent from './ModalPlotComponent';
import TitleFieldComponent from './../../../../browser/modules/shared/TitleFieldComponent';
import SearchFieldComponent from './../../../../browser/modules/shared/SearchFieldComponent';

const evaluateMeasurement = require('./../evaluateMeasurement');
const measurementIcon = require('./../measurementIcon');

/**
 * Creates borehole parameters display and visualization panel
 */
class ModalFeatureComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            plots: this.props.initialPlots,
            measurementsSearchTerm: ``,
            plotsSearchTerm: ``
        }
        this.onPlotAdd = this.onPlotAdd.bind(this);
    }

    componentDidMount() {
        let { selectedChemical } = this.props;
        // Simulating the separate group for water level
        let categories = JSON.parse(JSON.stringify(this.props.categories));
        let selectedCategory = null;
        for (let category in categories) {
            for (let itemId in categories[category]) {
                if ((itemId + '') === (selectedChemical + '')) {
                    selectedCategory = category;
                }
            }
        }
        try {
            let selectedCategoryKey = 'show' + selectedCategory.trim() + 'Measurements';
            this.setState({[selectedCategoryKey]: true});
        } catch (e) {
            console.info(e.message);
        }
    }

    setPlots(plots) {
        this.setState({ plots });
    }

    canCreatePlot() {
        if (this.props.license === 'premium') {
            return true;
        } else {
            let plots = this.state.plots.filter((plot) => plot.fromProject != true);
            return plots.length < FREE_PLAN_MAX_TIME_SERIES_COUNT;
        }
    }

    onPlotAdd(title) {
        if (!this.canCreatePlot()) {
            $('#watsonc-limits-reached-text').show();
            $('#upgrade-modal').modal('show');
            return;
        }
        this.props.onPlotAdd(title);

    }

    render() {

        // Simulating the separate group for water level
        let categories = JSON.parse(JSON.stringify(this.props.categories));
        categories[`Vandstand`] = {};
        categories[`Vandstand`][`watlevmsl`] = `Water level`;
        // Detect measurements from feature properties
        let plottedProperties = [];
        for (let key in this.props.feature.properties) {
            try {
                let data = JSON.parse(this.props.feature.properties[key]);
                if (typeof data === `object` && data !== null && `boreholeno` in data && `unit` in data && `title` in data
                    && `measurements` in data && `timeOfMeasurement` in data) {
                    // Regular properties ("measurements" and "timeOfMeasurement" exist)
                    let isPlottableProperty = true;
                    if (Array.isArray(data.measurements) === false) {
                        data.measurements = JSON.parse(data.measurements);
                    }

                    // Checking if number of measurements corresponds to the number of time measurements for each intake
                    data.measurements.map((measurements, intakeIndex) => {
                        if (data.measurements[intakeIndex].length !== data.timeOfMeasurement[intakeIndex].length) {
                            console.warn(`${data.title} property has not corresponding number of measurements and time measurements for intake ${intakeIndex + 1}`);
                            isPlottableProperty = false;
                        }
                    });

                    if (isPlottableProperty) {
                        for (let i = 0; i < data.measurements.length; i++) {
                            plottedProperties.push({
                                key,
                                intakeIndex: i,
                                boreholeno: data.boreholeno,
                                title: data.title,
                                unit: data.unit
                            });
                        }
                    }
                } else if (typeof data === `object` && data !== null && `title` in data && `data` in data) {
                    for (let key in data.data) {
                        for (let i = 0; i < data.data[key].data.length; i++) {
                            plottedProperties.push({
                                custom: true,
                                key: data.key + ':' + key,
                                intakeIndex: i,
                                boreholeno: this.props.feature.properties.boreholeno ? this.props.feature.properties.boreholeno : ``,
                                title: data.data[key].data[i].name,
                                data: data.data[key]
                            });
                        }
                    }
                }
            } catch (e) {
            }
        }

        // Preparing measurements
        let measurementsText = __(`Data series`);
        if (this.state.measurementsSearchTerm.length > 0) {
            measurementsText = __(`Found data series`);
        }

        /**
         * Creates measurement control
         *
         * @returns {Boolean|Object}
         */
        const createMeasurementControl = (item, key) => {
            let display = true;
            if (this.state.measurementsSearchTerm.length > 0) {
                if (item.title.toLowerCase().indexOf(this.state.measurementsSearchTerm.toLowerCase()) === -1) {
                    display = false;
                }
            }

            let control = false;
            if (display) {
                let json;
                // Checking if the item is the custom one
                if (item.key.indexOf(':') > -1) {
                    json = item;
                } else {
                    try {
                        json = JSON.parse(this.props.feature.properties[item.key]);
                    } catch (e) {
                        console.error(item);
                        throw new Error(`Unable to parse measurements data`);
                    }
                }

                let intakeName = `#` + (parseInt(item.intakeIndex) + 1);
                if (`intakes` in json && Array.isArray(json.intakes) && json.intakes[item.intakeIndex] !== null) {
                    intakeName = json.intakes[item.intakeIndex] + '';
                }

                let icon = false;
                let measurementData = null;
                if (!item.custom) {
                    measurementData = evaluateMeasurement(json, this.props.limits, item.key, item.intakeIndex);
                    icon = measurementIcon.generate(measurementData.maxColor, measurementData.latestColor);
                }

                control = (<ModalMeasurementComponent
                    key={key}
                    icon={icon}
                    onAddMeasurement={this.props.onAddMeasurement}
                    maxMeasurement={measurementData === null ? null : measurementData.maxMeasurement}
                    latestMeasurement={measurementData === null ? null : measurementData.latestMeasurement}
                    latestMeasurementRelative={measurementData === null ? null : Math.round((measurementData.latestMeasurement/measurementData.chemicalLimits[1]) * 100)/100}
                    chemicalLimits={measurementData === null ? null : measurementData.chemicalLimits}
                    detectionLimitReachedForMax={measurementData === null ? null : measurementData.detectionLimitReachedForMax}
                    detectionLimitReachedForLatest={measurementData === null ? null : measurementData.detectionLimitReachedForLatest}
                    gid={this.props.feature.properties.gid}
                    itemKey={item.key}
                    intakeIndex={item.intakeIndex}
                    intakeName={intakeName}
                    unit={item.unit}
                    title={item.title}/>);
            }

            return control;
        };


        let propertiesControls = [];
        if (Object.keys(categories).length > 0) {
            let numberOfDisplayedCategories = 0;
            for (let categoryName in categories) {
                let measurementsThatBelongToCategory = Object.keys(categories[categoryName]).map(e => categories[categoryName][e]);
                let measurementControls = [];
                plottedProperties = plottedProperties.filter((item, index) => {
                    if (measurementsThatBelongToCategory.indexOf(item.title) !== -1) {
                        // Measurement is in current category
                        let control = createMeasurementControl(item, ('measurement_' + index));
                        if (control) {
                            measurementControls.push(control);
                        }

                        return false;
                    } else {
                        return true;
                    }
                });
                if (measurementControls.length > 0) {
                    measurementControls.sort(function(a, b) { return b.props.latestMeasurementRelative - a.props.latestMeasurementRelative})
                    let key = 'show' + categoryName.trim() + 'Measurements'
                    // Category has at least one displayed measurement
                    numberOfDisplayedCategories++;
                    propertiesControls.push(<div key={`category_` + numberOfDisplayedCategories}>
                        <div style={{fontSize: '20px'}}><a href="javascript:void(0)" onClick={() => {
                            console.log(this);
                            this.setState({[key]: !this.state[key]})
                        }}><h5>{categoryName.trim()}{this.state[key] ? (<i className="material-icons">keyboard_arrow_down</i>) : (<i className="material-icons">keyboard_arrow_right</i>)}</h5></a></div>
                        {this.state[key] ? (<div>{measurementControls}</div>) : false}
                    </div>);
                }
            }

            // Placing uncategorized measurements in separate category
            let uncategorizedMeasurementControls = [];
            plottedProperties.slice().map((item, index) => {
                let control = createMeasurementControl(item, ('measurement_' + index));
                plottedProperties.splice(index, 1);
                if (control) {
                    uncategorizedMeasurementControls.push(control);
                }
            });

            if (uncategorizedMeasurementControls.length > 0) {
                uncategorizedMeasurementControls.sort(function(a, b) { return b.props.latestMeasurementRelative - a.props.latestMeasurementRelative})
                // Category has at least one displayed measurement
                numberOfDisplayedCategories++;
                propertiesControls.push(<div key={`uncategorized_category_0`}>
                    <div>
                        <h5>{__(`Uncategorized`)}</h5>
                    </div>
                    <div>{uncategorizedMeasurementControls}</div>
                </div>);
            }
        } else {
            plottedProperties.map((item, index) => {
                let control = createMeasurementControl(item, (`measurement_` + index));
                if (control) {
                    propertiesControls.push(control);
                }
            });
        }

        // Preparing plots
        let plotsText = __(`Time series`);
        if (this.state.plotsSearchTerm.length > 0) {
            plotsText = __(`Found time series`);
        }

        let plotsControls = (<div>
            <p>{__(`No timeseries were created yet`)}</p>
            <div style={{
                textAlign: `center`,
                position: `absolute`,
                top: `50%`,
                color: `gray`
            }}>
                <p>{__(`Create a new table and then drag your desired data series into the box - and you're off`)}</p>
            </div>
        </div>);

        if (this.state.plots && this.state.plots.length > 0) {
            plotsControls = [];
            this.state.plots.map((plot) => {
                let display = true;
                if (this.state.plotsSearchTerm.length > 0) {
                    if (plot.title.toLowerCase().indexOf(this.state.plotsSearchTerm.toLowerCase()) === -1) {
                        display = false;
                    }
                }

                if (display) {
                    plotsControls.push(<ModalPlotComponent
                        key={`plot_container_` + plot.id}
                        plot={plot}
                        onDeleteMeasurement={this.props.onDeleteMeasurement}
                        dataSource={this.props.dataSource}/>);
                }
            });
        }

        return (<div style={{ height: `inherit` }}>
            <div>
                <div className="measurements-modal_left-column">
                    <div>{measurementsText}</div>
                    <div className="form-group">
                        <SearchFieldComponent id="measurements-search-control" onSearch={(measurementsSearchTerm) => {
                            this.setState({ measurementsSearchTerm });
                        }}/>
                    </div>
                </div>
                <div className="measurements-modal_right-column">
                    <div>{plotsText}</div>
                    <div style={{ display: `flex` }}>
                        <div className="form-group">
                            <SearchFieldComponent id="plots-search-control" onSearch={(plotsSearchTerm) => {
                                this.setState({ plotsSearchTerm });
                            }}/>
                        </div>
                        <div className="form-group">
                            <TitleFieldComponent
                                id="new-plot-control"
                                saveIcon={(<i className="material-icons">add</i>)}
                                inputPlaceholder={__(`Create new`)}
                                onAdd={(title) => { this.onPlotAdd(title) }}
                                type="userOwned"
                                customStyle={{ width: `100%` }}/>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ height: `calc(100% - 74px)`, display: `flex` }}>
                <div className="measurements-modal_left-column measurements-modal_scrollable">{propertiesControls}</div>
                <div className="measurements-modal_right-column measurements-modal_scrollable">{plotsControls}</div>
            </div>
        </div>);
    }
}

ModalFeatureComponent.propTypes = {
    categories: PropTypes.object.isRequired,
    feature: PropTypes.object.isRequired,
    names: PropTypes.object.isRequired,
    limits: PropTypes.object.isRequired,
    initialPlots: PropTypes.array.isRequired,
    onPlotAdd: PropTypes.func.isRequired,
    onAddMeasurement: PropTypes.func.isRequired,
    onDeleteMeasurement: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    selectedChemical: state.global.selectedChemical
})

export default connect(mapStateToProps)(withDragDropContext(ModalFeatureComponent));
