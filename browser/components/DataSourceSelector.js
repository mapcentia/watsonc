import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import DataSelectorFilterComponent from './DataSelectorFilterComponent';

import {selectLayer, unselectLayer} from '../redux/actions'

/**
 * Data source selector
 */
class DataSourceSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openFilter: null
        }
    }

    componentDidMount() {
        // If coming from state link, then check off boxes
        if (typeof this.props.enabledLoctypeIds !== "undefined" && typeof this.props.urlparser !== "undefined" && this.props.urlparser.urlVars && this.props.urlparser.urlVars.state) {
            if (this.props.boreholes) {
                $(`#key0`).trigger("click");
            }
            this.props.enabledLoctypeIds.forEach((v) => {
                let key;
                switch (v) {
                    case "1":
                        key = `key1`;
                        break;
                    case "3":
                        key = `key2`;
                        break;
                    case "4":
                        key = `key3`;
                        break;
                    case "5":
                        key = `key4`;
                        break;
                }
                $(`#${key}`).trigger("click");
            });
        }
    }

    render() {
        const generateLayerRecord = (key, item) => {
            let selected = (this.props.selectedLayers.indexOf(item.originalLayerKey + (item.additionalKey ? `#${item.additionalKey}` : ``)) !== -1);
            let titles = []
            let itemTitle = item.title;
            if (itemTitle) {
                titles.push(itemTitle);
            }
            let translatedTitle = __(item.title);
            if (translatedTitle && titles.indexOf(translatedTitle) === -1) {
                titles.push(translatedTitle)
            }

            return (<div key={key} style={{paddingBottom: `8px`}}>
                <div className="checkbox">
                    <label id={key}>
                        <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                                if (selected) {
                                    this.props.unselectLayer(item.originalLayerKey, item.additionalKey);
                                } else {
                                    this.props.selectLayer(item.originalLayerKey, item.additionalKey);
                                }
                            }}/> {titles.join(' / ')}
                    </label>
                    {/*<button type="button" className="btn btn-xs btn-primary" title={__(`Filter`)} onClick={() => { this.state.openFilter === key ? this.setState({openFilter: null}) : this.setState({openFilter: key})}}><i className='material-icons'>filter_list</i></button>*/}
                    {/*{this.state.openFilter === key ? <DataSelectorFilterComponent /> : null}*/}
                </div>
            </div>);
        };

        return (<div>
            <p>{__(`Please select at least one layer`)}</p>
            <div>
                <h4>Grundvand</h4>
                {generateLayerRecord(`key0`, this.props.layers[0])}
                {generateLayerRecord(`key4`, this.props.layers[4])}
                {generateLayerRecord(`key1`, this.props.layers[1])}
                <h4>Vandløb, kyst, bassiner</h4>
                {generateLayerRecord(`key2`, this.props.layers[2])}
                <h4>Nedbør</h4>
                {generateLayerRecord(`key3`, this.props.layers[3])}
            </div>
        </div>);
    }
}

DataSourceSelector.propTypes = {
    layers: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
    selectedLayers: state.global.selectedLayers
});

const mapDispatchToProps = dispatch => ({
    selectLayer: (originalLayerKey, additionalKey) => dispatch(selectLayer(originalLayerKey, additionalKey)),
    unselectLayer: (originalLayerKey, additionalKey) => dispatch(unselectLayer(originalLayerKey, additionalKey)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DataSourceSelector);
