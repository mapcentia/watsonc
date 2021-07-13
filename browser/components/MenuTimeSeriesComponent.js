import React from 'react';
import PropTypes from 'prop-types';
import Switch from '@material-ui/core/Switch';
import {Provider, connect} from 'react-redux';

import PlotComponent from './PlotComponent';
import {isNumber} from 'util';
import {FREE_PLAN_MAX_PROFILES_COUNT} from './../constants';
import TitleFieldComponent from './../../../../browser/modules/shared/TitleFieldComponent';
import SearchFieldComponent from './../../../../browser/modules/shared/SearchFieldComponent';

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
            showArchivedPlots: false,
            authenticated: props.authenticated ? props.authenticated : false,
            plotsSearchTerm: '',
        };
        this.getPlots = this.getPlots.bind(this);
        this.setShowArchivedPlots = this.setShowArchivedPlots.bind(this);
        this.onPlotAdd = this.onPlotAdd.bind(this);
        window.menuTimeSeriesComponentInstance = this;
    }

    componentDidMount() {
        let _self = this;
        this.props.backboneEvents.get().on(`session:authChange`, (authenticated) => {
            if (_self.state.authenticated !== authenticated) {
                _self.setState({authenticated});
            }
        });
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
        this.setState({showArchivedPlots});
    }

    getPlots() {
        if (this.state.showArchivedPlots) {
            return this.state.plots;
        } else {
            return this.state.plots.filter((plot) => plot.isArchived != true);
        }
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

        this.props.onPlotCreate(title);
    }

    render() {
        let plotsTable = [];
        let projectPlotsTable = [];
        this.getPlots().map((plot, index) => {
            if (this.state.plotsSearchTerm.length > 0) {
                if (plot.title.toLowerCase().indexOf(this.state.plotsSearchTerm.toLowerCase()) === -1) {
                    return;
                }
            }
            let isChecked = (this.state.activePlots.indexOf(plot.id) > -1);
            let isHighlighted = (this.state.highlightedPlot === plot.id);
            let highlightingIsDisabled = (isChecked ? false : true);
            let archiveButton = plot.isArchived ?
                <button type="button" className="btn btn-raised btn-xs" style={{padding: `4px`, margin: `0px`}}
                        onClick={() => {
                            this.props.onPlotArchive(plot.id, false)
                        }}>
                    <i className="material-icons">unarchive</i>
                </button> :
                <button type="button" className="btn btn-raised btn-xs" style={{padding: `4px`, margin: `0px`}}
                        onClick={() => {
                            this.props.onPlotArchive(plot.id, true)
                        }}>
                    <i className="material-icons">archive</i>
                </button>;
            if (plot.fromProject) {
                archiveButton = null;
            }

            let deleteButton = plot.fromProject ? null :
                <button type="button" className="btn btn-raised btn-xs" onClick={() => {
                    this.props.onPlotDelete(plot.id, plot.title);
                }} style={{padding: `4px`, margin: `0px`}}>
                    <i className="material-icons">delete</i>
                </button>;
            let itemHtml = <tr key={`borehole_plot_control_${index}`}>
                <td>
                    <div className="form-group">
                        <div className="checkbox">
                            <label>
                                <input type="checkbox" checked={isChecked} onChange={(event) => {
                                    event.target.checked ? this.props.onPlotShow(plot.id) : this.props.onPlotHide(plot.id)
                                }}/>
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
                    {deleteButton}
                </td>
            </tr>;

            if (plot.fromProject === true) {
                projectPlotsTable.push(itemHtml)
            }
            plotsTable.push(itemHtml);

        });

        var showArchivedPlotsButton = <div>
            Show Archived
            <Switch checked={this.state.showArchivedPlots} onChange={() => {
                this.setShowArchivedPlots(!this.state.showArchivedPlots)
            }}/>
        </div>;
        if (Array.isArray(plotsTable) && plotsTable.length > 0) {
            plotsTable = (<table className="table">
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
        } else if (projectPlotsTable.length === 0) {
            plotsTable = (<p>{__(`No time series were created yet`)}</p>);
        } else {
            plotsTable = null;
        }
        if (Array.isArray(projectPlotsTable) && projectPlotsTable.length > 0) {
            projectPlotsTable = (
                <div>
                    <div style={{fontSize: `20px`, padding: `14px`}}>
                        {__('Select Time Series from Project')}
                    </div>
                    <table className="table table-striped table-hover">
                        <thead>
                        <tr style={{color: `rgb(0, 150, 136)`}}>
                            <td style={{width: `40px`}}><i className="material-icons">border_all</i></td>
                            <td style={{width: `70%`}}>{__(`Title`)}</td>
                        </tr>
                        </thead>
                        <tbody>{projectPlotsTable}</tbody>
                    </table>
                </div>);
        } else {
            projectPlotsTable = null;
        }

        var addTimeSeriesComponent = this.state.authenticated ? <div>
            <h4>{__(`Timeseries`)}
                <TitleFieldComponent
                    saveButtonText={__(`Save`)}
                    layout="dense"
                    onAdd={this.onPlotAdd} type="userOwned"/>
            </h4>
        </div> : <div style={{position: `relative`}}>
            <div style={{textAlign: `center`}}>
                <p>{__(`Please sign in to create / edit Time series`)}</p>
            </div>
        </div>;

        return (
            <div>
                {addTimeSeriesComponent}
                <div style={{display: `flex`}}>
                    <SearchFieldComponent id="measurements-search-control" onSearch={(plotsSearchTerm) => {
                        this.setState({plotsSearchTerm});
                    }}/>

                    <div style={{
                        textAlign: 'right',
                        marginRight: '30px',
                        marginLeft: 'auto'
                    }}>{showArchivedPlotsButton}</div>
                </div>
                <div>{plotsTable}</div>
                <div>
                    {projectPlotsTable}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    authenticated: state.global.authenticated
})

const mapDispatchToProps = dispatch => ({})

MenuTimeSeriesComponent.propTypes = {
    initialPlots: PropTypes.array.isRequired,
    initialActivePlots: PropTypes.array.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(MenuTimeSeriesComponent);
