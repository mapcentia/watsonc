import React from 'react';
import {connect} from 'react-redux';
import {selectStartDate, selectEndDate, selectMeasurementCount} from "../redux/actions";

class DataSelectorGlobalFilterComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: null,
            endDate: null,
            count: null
        };
    }

    componentDidMount() {
    }

    render() {
        return (
            <div style={{paddingTop: '10px', paddingLeft: '20px'}}>
                <div className="filters">
                    <h4>Periode</h4>
                    <div className="row">
                        <div className="col-md-6">Fra <input type="date" onChange={(e) => {
                            e.preventDefault();
                            this.props.selectStartDate(e.target.value)
                        }} className='form-control'
                                                             value={this.props.selectedStartDate}/></div>
                        <div className="col-md-6">Til <input type="date" onChange={(e) => {
                            e.preventDefault();
                            this.props.selectEndDate(e.target.value)
                        }} className='form-control'
                                                             value={this.props.selectedEndDate}/></div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <h4>Antal målinger</h4>
                            <input type="number" onChange={(e) => {
                                e.preventDefault();
                                this.props.selectMeasurementCount(e.target.value)
                            }} className='form-control'
                                   value={this.props.selectedMeasurementCount}/>
                        </div>
                    </div>
                </div>
            </div>)
    }
}

DataSelectorGlobalFilterComponent.propTypes = {};

const mapStateToProps = state => ({
    selectedStartDate: state.global.selectedStartDate,
    selectedEndDate: state.global.selectedEndDate,
    selectedMeasurementCount: state.global.selectedMeasurementCount
});

const mapDispatchToProps = dispatch => ({
    selectStartDate: (date) => dispatch(selectStartDate(date)),
    selectEndDate: (date) => dispatch(selectEndDate(date)),
    selectMeasurementCount: (count) => dispatch(selectMeasurementCount(count))
});

export default connect(mapStateToProps, mapDispatchToProps)(DataSelectorGlobalFilterComponent);
