import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux'

import DataSourceSelector from './DataSourceSelector';
import ChemicalSelector from './ChemicalSelector';
import GlobalFilter from './DataSelectorGlobalFilterComponent';
import {selectStartDate, setCategories} from '../redux/actions';

import StateSnapshotsDashboard from './../../../../browser/modules/stateSnapshots/components/StateSnapshotsDashboard';

const MODE_INDEX = 0;
const MODE_NEW = 1;
const MODE_SELECT = 2;

/**
 * Intro modal window content
 */
class IntroModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: MODE_INDEX,
            layers: this.props.layers,
            initialCategories: props.categories,
        };
    }

    componentDidMount() {
        if (this.state.initialCategories) {
            this.props.setCategories(this.state.initialCategories);
        }
    }

    setCategories(categories) {
        this.props.setCategories(categories);
    }

    applyParameters() {
        this.props.onApply({
            layers: this.props.selectedLayers,
            chemical: (this.props.selectedChemical ? this.props.selectedChemical : false),
            selectedStartDate: this.props.selectedStartDate,
            selectedEndDate: this.props.selectedEndDate,
            selectedMeasurementCount: this.props.selectedMeasurementCount,
        });
    }

    render() {
        let modalBodyStyle = {
            paddingLeft: `0px`,
            paddingRight: `0px`,
            paddingTop: `35px`,
            paddingBottom: `0px`
        };

        let buttonColumnStyle = {
            paddingTop: `30px`,
            backgroundColor: `rgb(0, 150, 136)`,
            height: `90px`,
        };

        let buttonStyle = {
            color: `white`,
            fontSize: `20px`,
            fontWeight: `600`,
            cursor: `pointer`
        };

        let leftColumnBorder = {borderRadius: `0px 0px 0px 40px`};
        let rightColumnBorder = {borderRadius: `0px 0px 40px 0px`};
        if (this.state.mode !== MODE_INDEX) {
            modalBodyStyle.minHeight = `550px`;
            leftColumnBorder = {};
            rightColumnBorder = {};
        }

        let shadowStyle = {
            boxShadow: `0 6px 8px 0 rgba(0, 0, 0, 0.5), 0 6px 20px 0 rgba(0, 0, 0, 0.19)`,
            zIndex: 1000
        };

        return (<div className="modal-content" style={{minWidth: `1000px`, marginTop: `20%`, borderRadius: `40px`}}>
            <div className="modal-header" style={{color: `#009688`, textAlign: `center`, paddingTop: `35px`}}>
                <h4 className="modal-title" style={{fontSize: `34px`, textTransform: `uppercase`, fontWeight: `700`}}>
                    <span>{__(`Welcome to Calypso`)}</span>
                </h4>
            </div>
            <div className="modal-body" style={modalBodyStyle}>
                <div className="container" style={{padding: `0px`}}>
                    <div className="row-fluid">
                        <div className="col-md-6 text-center"
                             style={Object.assign({}, buttonColumnStyle, leftColumnBorder, (this.state.mode === MODE_NEW ? shadowStyle : {}))}
                             onClick={() => {
                                 this.setState({mode: MODE_NEW})
                             }}>
                            <div style={buttonStyle}>
                                {__(`New project`)} {this.state.mode === MODE_NEW ? (
                                <i className="fas fa-chevron-down"></i>) : (<i className="fas fa-chevron-right"></i>)}
                            </div>
                        </div>
                        <div className="col-md-6 text-center"
                             style={Object.assign({}, buttonColumnStyle, rightColumnBorder, {
                                 borderLeft: `1px solid white`
                             }, (this.state.mode === MODE_SELECT ? shadowStyle : {}))} onClick={() => {
                            this.setState({mode: MODE_SELECT})
                        }}>
                            <div style={buttonStyle}>
                                {__(`Open existing project`)} {this.state.mode === MODE_SELECT ? (
                                <i className="fas fa-chevron-down"></i>) : (<i className="fas fa-chevron-right"></i>)}
                            </div>
                        </div>
                    </div>
                </div>

                {this.state.mode === MODE_NEW ? (<div className="container" style={{paddingTop: `20px`}}>
                    <div className="row-fluid">
                        <div className="col-md-6">
                            <DataSourceSelector layers={this.state.layers}/>
                        </div>
                        <div className="col-md-6">
                            <ChemicalSelector/>
                        </div>
                    </div>
                </div>) : false}

                {this.state.mode === MODE_SELECT ? (<div className="container" style={{paddingTop: `20px`}}>
                        <div className="row-fluid">
                            <div className="col-md-12" style={{textAlign: `right`}}>
                                {this.props.authenticated === false ? (
                                    <a id="session" href="#" data-toggle="modal" data-target="#login-modal"
                                       className="active">
                                        <i className="material-icons gc2-session-unlock">lock_open</i>
                                        <span
                                            className="module-title">{__(`Sign in in order to access user projects`)}</span>
                                    </a>) : false}
                            </div>
                        </div>
                        <div className="row-fluid">
                            <div className="col-md-12">
                                <StateSnapshotsDashboard
                                    force={true}
                                    readOnly={true}
                                    customSetOfTitles={true}
                                    initialAuthenticated={this.props.authenticated}
                                    showStateSnapshotTypes={false}
                                    playOnly={true}
                                    {...this.props}
                                    onStateSnapshotApply={this.props.onClose}/>
                            </div>
                        </div>
                    </div>)


                    /*     (<div className="container" style={{paddingTop: `20px`}}>
                             <div className="row-fluid">
                                 <div className="col-md-12">
                                     Her bliver det muligt at åbne et gemt projekt. Et projekt kan indeholde tidsserie-grafer, profiler mv.
                                 </div>
                             </div>
                         </div>
                         )*/ : false}
            </div>

            <div className="modal-footer" style={{padding: `0px`}}>
                {this.state.mode === MODE_NEW ? (<div className="container">
                    <div className="row-fluid">
                        <div className="col-md-12"
                             style={{textAlign: `right`, paddingTop: `10px`, paddingBottom: `10px`}}>
                            <button
                                type="button"
                                disabled={this.props.selectedLayers.length === 0}
                                className="btn btn-raised btn-primary"
                                data-dismiss="modal"
                                onClick={this.applyParameters.bind(this)}>{__(`Continue`)}
                                <div className="ripple-container"></div>
                            </button>
                        </div>
                    </div>
                </div>) : false}
            </div>
            <div className="modal-footer" style={{padding: `0px`}}>
                {this.state.mode === MODE_NEW ? (<div className="container">
                    <div className="row-fluid">
                        <div className="col-md-12"
                             style={{textAlign: `left`, paddingTop: `10px`, paddingBottom: `10px`}}>
                            <GlobalFilter/>
                        </div>
                    </div>
                </div>) : false}
            </div>
        </div>);
    }
}

IntroModal.propTypes = {
    layers: PropTypes.array.isRequired,
    categories: PropTypes.object.isRequired,
    onApply: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    authenticated: state.global.authenticated,
    selectedLayers: state.global.selectedLayers,
    selectedChemical: state.global.selectedChemical,
    selectedMeasurementCount: state.global.selectedMeasurementCount,
    selectedStartDate: state.global.selectedStartDate,
    selectedEndDate: state.global.selectedEndDate,
});

const mapDispatchToProps = dispatch => ({
    setCategories: (categories) => dispatch(setCategories(categories)),
});

export default connect(mapStateToProps, mapDispatchToProps)(IntroModal);
