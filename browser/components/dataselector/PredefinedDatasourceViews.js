import IconButton from "../shared/button/IconButton";
import { LAYER_NAMES } from "../../constants";

function PredefinedDatasourceViews(props) {
  return (
    <div
      style={{
        display: "flex",
        paddingTop: "1rem",
      }}
    >
      <IconButton
        icon="cleaning-spray"
        label={__("Pesticider")}
        onClick={() => {
          props.setSelectedDataSources([
            {
              label: "Pesticidoverblik",
              group: "Grundvand, analyser",
              value: "calypso_stationer.pesticidoverblik",
            },
          ]);
          props.applyLayer("calypso_stationer.pesticidoverblik");
        }}
      />
      <IconButton
        icon="no3-solid"
        label={__("Nitrat")}
        onClick={() => {
          props.applyLayer(LAYER_NAMES[0], "246");
          props.setSelectedDataSources([
            {
              label: "Jupiter boringer",
              group: "Grundvand",
              value: "v:system.all",
            },
          ]);
          props.setSelectedParameter({
            label: "Nitrat",
            group: "Kemiske hovedbestanddele",
            value: "246",
          });
        }}
      />
      <IconButton
        icon="water-wifi-solid"
        label={__("Mine stationer")}
        onClick={() => {
          props.applyLayer("calypso_stationer.all_stations");
          props.setSelectedDataSources([
            {
              label: "Mine stationer",
              group: "Brugerspecifikke lag",
              value: "calypso_stationer.all_stations",
            },
          ]);
        }}
      />
      <IconButton
        icon="terrain-near-groundwater"
        label={"Terrænnært grundvand"}
        onClick={() => {
          props.applyLayer("analyser.terrain_near_groundwater_layer");
          props.setSelectedDataSources([
            {
              label: "VUDP Terrænnærgrundvand",
              group: "Særskilte",
              value: "analyser.terrain_near_groundwater_layer",
            },
          ]);
        }}
      />

      {/*<IconButton icon="lab-flask-experiment" label={__('Mine favoritter')}/>*/}
    </div>
  );
}

export default PredefinedDatasourceViews;
