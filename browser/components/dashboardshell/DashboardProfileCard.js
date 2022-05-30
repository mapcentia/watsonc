import styled from "styled-components";
import Grid from "@material-ui/core/Grid";
import ProfileComponent from "./ProfileComponent";

function DashboardProfileCard(props) {
  return (
    <DashboardPlotContent height={props.fullscreen ? "90vh" : "100%"}>
      <Grid container style={{ height: "100%" }}>
        <Grid container item xs={12}>
          <PlotContainer>
            <ProfileComponent
              height={props.fullscreen ? "100%" : 370}
              index={props.index}
              onClick={() => console.log("Testing")}
              plotMeta={props.plot}
              onChangeDatatype={(id) => {
                console.log("Test");
              }}
            />
          </PlotContainer>
        </Grid>
      </Grid>
    </DashboardPlotContent>
  );
}

const DashboardPlotContent = styled.div`
  padding: ${(props) => props.theme.layout.gutter / 2}px;
  height: ${(props) => props.height};
`;

const CardList = styled.div`
  height: 100%;
  width: 95%;
  vertical-align: middle;
`;

const PlotContainer = styled.div`
  width: 100%;
  margin-left: 10px;
`;

export default DashboardProfileCard;
