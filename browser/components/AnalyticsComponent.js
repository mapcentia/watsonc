import React from "react";
import axios from "axios";
import fileSaver from "file-saver";
import LoadingOverlay from "./../../../../browser/modules/shared/LoadingOverlay";

/**
 * Analytics Component
 */

const session = require("./../../../session/browser/index");

class AnalyticsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.kommune = React.createRef();
    this.type = React.createRef();
    this.state = {
      loading: false,
    };
  }

  handleSubmit(event) {
    this.setState({ loading: true });
    axios
      .get(
        `/api/extension/watsonc/report?komcode=${
          this.kommune.current.value
        }&userid=${session.getUserName()}`
      )
      .then((response) => {
        fileSaver.saveAs(response.data.url, "rapport.xlsx");
      })
      .catch((error) => {
        console.log(`Error occured`, error);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
    event.preventDefault();
  }

  render() {
    let data = this.props.kommuner;
    let makeItem = function (i) {
      return (
        <option key={i.komkode} value={i.komkode}>
          {i.komnavn}
        </option>
      );
    };

    return (
      <form className="form-horizontal" onSubmit={this.handleSubmit}>
        {this.state.loading ? <LoadingOverlay /> : false}
        <div className="form-group">
          <label htmlFor="watsonc-type">Vælg rapport</label>
          <select className="form-control" id="watsonc-type" ref={this.type}>
            <option key="1" value="1">
              Pesticidoverblik
            </option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="watsonc-kommune">Vælg afgrænsning</label>
          <select
            className="form-control"
            id="watsonc-kommune"
            ref={this.kommune}
          >
            {data.map(makeItem)}
          </select>
        </div>
        <div className="form-group">
          <button className="btn btn-primary" type="submit" value="Submit">
            Download rapport
          </button>
        </div>
      </form>
    );
  }
}

export default AnalyticsComponent;
