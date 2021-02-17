import React from 'react';
import {connect} from 'react-redux';

const DEFAULT_FILTER_COUNT = 3;

class DataSelectorFilterComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filters: {
                filter1: {
                    label: 'Filter 1',
                    operators: ['<', '>', '<='],
                    type: 'number'
                },
                filter2: {
                    label: 'Filter 2',
                    operators: ['===', '!='],
                    type: 'text'
                }
            },
            selectedFilters: [{filter: null, selectedOperator: null, type: 'text', value: null, operators: []}, {filter: null, selectedOperator: null, type: 'text', value: null, operators: []}, {filter: null, selectedOperator: null, type: 'text', value: null, operators: []}],

        };
    }

    componentDidMount() {
    }

    handleFilterChange(event, index) {
        var selectedFilters = this.state.selectedFilters;
        var filterInfo = this.state.filters[event.target.value];
        var operators = [];
        var type = 'text'
        if (filterInfo) {
            operators = filterInfo.operators;
            type = filterInfo.type;
        }
        selectedFilters[index].operators = operators;
        selectedFilters[index].type = type;
        this.setState(selectedFilters);
    }

    getFilters(filterCount) {
        return this.state.selectedFilters.map((filter, index) => {
               return <tr>
                    <td style={{padding: '0 20px'}}>
                        <select className="form-control" onChange={(event) => this.handleFilterChange(event, index)} value={filter.filter}>
                            <option value="">{__('Select Filter')}</option>
                            {Object.keys(this.state.filters).map((filterKey) => <option value={filterKey}>{this.state.filters[filterKey].label}</option>)}
                        </select>
                    </td>
                    <td style={{padding: '0 5px'}}>
                        <select className="filter-operators form-control" style={{width: '50px', textAlign: 'center'}} value={filter.selectedOperator}>
                        {filter.operators.map((operator) => {
                            return <option value={operator}>{operator}</option>
                        })}
                        </select>
                    </td>
                    <td style={{padding: '0 5px'}}>
                        <input type={filter.type} className='form-control' />
                    </td>
                </tr>
        });
    }

    render() {
        return (
            <div style={{paddingTop: '10px', paddingLeft: '20px' }}>
                {__('Match')}
                <select className="condition-type-filter">
                    <option value="all">{__('All')}</option>
                    <option value="any">{__('Any')}</option>
                </select>
                {__(' the conditions')}
                <div className="filters">
                    <table>
                        <tbody>
                            {this.getFilters(DEFAULT_FILTER_COUNT)}
                        </tbody>
                    </table>
                </div>
            </div>)
    }
}

DataSelectorFilterComponent.propTypes = {
};


const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(DataSelectorFilterComponent);
