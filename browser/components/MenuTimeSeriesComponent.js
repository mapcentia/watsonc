import React from 'react';
import PropTypes from 'prop-types';

import PlotComponent from './PlotComponent';
import { isNumber } from 'util';
import TitleFieldComponent from './../../../../browser/modules/shared/TitleFieldComponent';

/**
 * Component for managing time series
 */
class MenuTimeSeriesComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            plots: this.props.initialPlots,
            activePlots: this.props.initialActivePlots,
            highlightedPlot: false,
            showArchivedPlots: false
        };
        this.getPlots = this.getPlots.bind(this);
        this.setShowArchivedPlots = this.setShowArchivedPlots.bind(this);
    }

    setPlots(plots) {
        this.setState({plots});
    }

    setActivePlots(activePlots) {
        this.setState({activePlots});
    }

    setHighlightedPlot(highlightedPlot) {
        this.setState({highlightedPlot})
    }

    setShowArchivedPlots(showArchivedPlots) {
        this.setState({ showArchivedPlots });
    }

    getPlots() {
        if (this.state.showArchivedPlots) {
            return this.state.plots;
        } else {
            return this.state.plots.filter((plot) => plot.isArchived != true);
        }
    }

    render() {
        let plotsTable = [];
        this.getPlots().map((plot, index) => {
            let isChecked = (this.state.activePlots.indexOf(plot.id) > -1);
            let isHighlighted = (this.state.highlightedPlot === plot.id);
            let highlightingIsDisabled = (isChecked ? false : true);
            let archiveButton = plot.isArchived ? <button type="button" className="btn btn-raised btn-xs" style={{padding: `4px`, margin: `0px`}} onClick={() => { this.props.onPlotArchive(plot.id, false)}}>
                            <i className="material-icons">unarchive</i>
                        </button> : <button type="button" className="btn btn-raised btn-xs" style={{padding: `4px`, margin: `0px`}} onClick={() => { this.props.onPlotArchive(plot.id, true)}}>
                            <i className="material-icons">archive</i>
                        </button>;


            plotsTable.push(<tr key={`borehole_plot_control_${index}`}>
                <td>
                    <div className="form-group">
                        <div className="checkbox">
                            <label>
                                <input type="checkbox" checked={isChecked} onChange={(event) => { event.target.checked ? this.props.onPlotShow(plot.id) : this.props.onPlotHide(plot.id)}}/>
                            </label>
                        </div>
                    </div>
                </td>
                <td>{plot.title}</td>
                <td>
                    <div className="form-group">
                        {archiveButton}
                    </div>
                </td>
                <td>
                    <button type="button" className="btn btn-raised btn-xs" onClick={() => { this.props.onPlotDelete(plot.id, plot.title); }} style={{padding: `4px`, margin: `0px`}}>
                        <i className="material-icons">delete</i>
                    </button>
                </td>
            </tr>);
        });

        if (Array.isArray(plotsTable) && plotsTable.length > 0) {
            plotsTable = (<table className="table table-striped table-hover">
                <thead>
                    <tr style={{color: `rgb(0, 150, 136)`}}>
                        <td style={{width: `40px`}}><i className="material-icons">border_all</i></td>
                        <td style={{width: `70%`}}>{__(`Title`)}</td>
                        <td><i className="fas fa-map-marked-alt fas-material-adapt"></i></td>
                        <td><i className="material-icons">delete</i></td>
                    </tr>
                </thead>
                <tbody>{plotsTable}</tbody>
            </table>);
        } else {
            plotsTable = (<p>{__(`No time series were created yet`)}</p>);
        }

        var showArchivedPlotsButton = this.state.showArchivedPlots ?
            <div style={{color: 'red', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => this.setShowArchivedPlots(false)}>Hide Archived</div> :
            <div style={{color: 'red', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => this.setShowArchivedPlots(true)}>See Archived</div>;

       return (<div>
            <div>
                <h4>{__(`Timeseries`)}
                    <TitleFieldComponent
                        saveButtonText={__(`Save`)}
                        layout="dense"
                        onAdd={(title) => { this.props.onPlotCreate(title); }} type="userOwned"/>
                </h4>
            </div>
           <div style={{textAlign: 'right', marginRight: '30px'}}>{showArchivedPlotsButton}</div>
            <div>{plotsTable}</div>
        </div>);
    }
}

MenuTimeSeriesComponent.propTypes = {
    initialPlots: PropTypes.array.isRequired,
    initialActivePlots: PropTypes.array.isRequired,
};

export default MenuTimeSeriesComponent;
