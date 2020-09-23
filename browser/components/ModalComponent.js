import React from 'react';
import PropTypes from 'prop-types';
import {Provider} from 'react-redux';
import reduxStore from '../redux/store';

import withDragDropContext from './withDragDropContext';
import ModalFeatureComponent from './ModalFeatureComponent';

/**
 * Creates borehole parameters display and visualization panel
 */
class ModalComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTabIndex: 0
        }
    }

    setPlots(plots) {
        this.setState({ plots });
    }

    render() {
        let tabs = false;
        if (this.props.features.length > 0) {
            let tabControls = [];
            this.props.features.map((item, index) => {
                let name;
                if (typeof item.properties.alias !== "undefined") {
                    try {
                        name = item.properties.alias;
                    } catch (e) {
                        name = item.properties.boreholeno;
                    }
                } else {
                    name = item.properties.boreholeno;
                }
                tabControls.push(<li key={`modal_tab_${index}`} className={index === this.state.activeTabIndex ? `active` : ``}>
                    <a href="javascript:void(0)" onClick={() => { this.setState({activeTabIndex: index})}}>{name}</a>
                </li>);
            });

            tabs = (<ul className="nav nav-tabs watsonc-modal-tabs" style={{marginBottom: `15px`}}>{tabControls}</ul>)
        }

        return (<div style={{ height: `inherit` }}>
            {tabs}
            <div style={{ height: (tabs === false ? `inherit` : `calc(100% - 39px)`)}}>
                <Provider store={reduxStore}>
                <ModalFeatureComponent
                    key={`item_${this.state.activeTabIndex}`}
                    feature={this.props.features[this.state.activeTabIndex]}
                    {...this.props}/>
                </Provider>
            </div>
        </div>);
    }
}

ModalComponent.propTypes = {
    categories: PropTypes.object.isRequired,
    features: PropTypes.array.isRequired,
    names: PropTypes.object.isRequired,
    limits: PropTypes.object.isRequired,
    initialPlots: PropTypes.array.isRequired,
    initialActivePlots: PropTypes.array.isRequired,
    onPlotShow: PropTypes.func.isRequired,
    onPlotHide: PropTypes.func.isRequired,
    onPlotAdd: PropTypes.func.isRequired,
    onAddMeasurement: PropTypes.func.isRequired,
    onDeleteMeasurement: PropTypes.func.isRequired
};

export default withDragDropContext(ModalComponent);
