import styled from "styled-components";
import Grid from "@material-ui/core/Grid";
import { getLogo } from "../utils";
import Button from "./shared/button/Button";
import { Variants } from "./shared/constants/variants";
import SearchBox from "./shared/inputs/Searchbox";
import UserProfileButton from "./shared/userProfileButton/UserProfileButton";
import { showSubscription } from "../helpers/show_subscriptionDialogue";
import { useState, useEffect } from "react";
import useInterval from "./shared/hooks/useInterval";

function TopBar(props) {
  const [free, setFree] = useState(true);
  const [stopPoll, setStopPoll] = useState(false);

  useEffect(() => {
    props.backboneEvents.get().on("refresh:meta", () => {
      if (props.session.getProperties() !== null) {
        setFree(props.session.getProperties()["license"] === "free");
      } else {
        setFree(true);
      }
    });
  }, []);

  return (
    <Row container justify="center" alignItems="center">
      <Grid item xs={1}>
        <Logo src={getLogo()} alt="Calypso logo" title="Calypso logo" />
      </Grid>
      <Grid item xs={2}>
        <div className="js-layer-slide-breadcrumbs">
          <button type="button" className="navbar-toggle" id="burger-btn">
            <i className="fa fa-database"></i> Vælg data
          </button>
        </div>
      </Grid>
      <Grid item xs={6}>
        <div id="place-search">
          <div className="places">
            <input
              id="custom-search"
              className="custom-search typeahead"
              type="text"
              placeholder="Søg på IoT-stationer, adresse, matrikel- eller DGU nummer"
            />
            <span
              id="searchclear"
              className="glyphicon glyphicon-remove-circle"
              onClick={() =>
                (document.getElementById("custom-search").value = "")
              }
            ></span>
          </div>
        </div>
      </Grid>
      <Grid container item xs={2} justify="flex-end">
        {free && (
          <Button
            text="Opgrader Calypso"
            variant={Variants.Primary}
            onClick={showSubscription}
          />
        )}
      </Grid>
      <Grid container item xs={1} justify="center">
        <UserProfileButton />
      </Grid>
    </Row>
  );
}

const Row = styled(Grid)`
  background-color: ${({ theme }) => theme.colors.primary[4]};
  height: ${({ theme }) => theme.layout.gutter * 2}px;
`;

const Logo = styled.img`
  height: ${({ theme }) => theme.layout.gutter}px;
  margin-left: ${({ theme }) => theme.layout.gutter / 2}px;
`;

export default TopBar;
