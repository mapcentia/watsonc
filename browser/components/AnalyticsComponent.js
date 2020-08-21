import React from 'react';

/**
 * Analytics Component
 */
class AnalyticsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.kommune = React.createRef();
        this.type = React.createRef();
    }

    handleSubmit(event) {
        alert(this.kommune.current.value + " " + this.type.current.value);
        event.preventDefault();
    }

    render() {
        let data = this.props.kommuner;
        let makeItem = function (i) {
            return <option key={i.komkode} value={i.komnavn}>{i.komnavn}</option>;
        };

        return (
            <form className="form-horizontal" onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <label htmlFor="watsonc-kommune">Kommune</label>
                    <select className="form-control" id="watsonc-kommune" ref={this.kommune}>{data.map(makeItem)}</select>
                </div>
                <div className="form-group">
                    <label htmlFor="watsonc-type">Type</label>
                    <select className="form-control" id="watsonc-type" ref={this.type}>
                        <option key="1" value="1">Type 1</option>
                    </select>
                </div>
                <div className="form-group">
                    <button className="btn btn-primary" type="submit" value="Submit">Hent</button>
                </div>
            </form>
        );
    }
}

export default AnalyticsComponent;