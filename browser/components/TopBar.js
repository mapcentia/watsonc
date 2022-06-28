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
import { LOGIN_MODAL_DIALOG_PREFIX } from "../constants";

const FREE = "FREE";
const NOTLOGGEDIN = "NOTLOGGEDIN";
const PREMIUM = "PREMIUM";

function TopBar(props) {
  const [status, setStatus] = useState(NOTLOGGEDIN);
  const [stopPoll, setStopPoll] = useState(false);

  useInterval(
    () => {
      if (props.session.isStatusChecked()) {
        setStopPoll(true);
        if (props.session.getProperties() !== null) {
          setStatus(
            props.session.getProperties()["license"] === "premium"
              ? PREMIUM
              : FREE
          );
        } else {
          setStatus(NOTLOGGEDIN);
        }
      }
    },
    stopPoll ? null : 1000
  );

  useEffect(() => {
    props.backboneEvents.get().on("refresh:meta", () => {
      console.log("whaat");
      console.log(props.session.getProperties());
      if (props.session.getProperties() !== null) {
        setStatus(
          props.session.getProperties()["license"] === "premium"
            ? PREMIUM
            : FREE
        );
      } else {
        setStatus(NOTLOGGEDIN);
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
        {status === FREE && (
          <Button
            text="Opgrader Calypso"
            variant={Variants.Primary}
            onClick={showSubscription}
          />
        )}
        {status === NOTLOGGEDIN && (
          <Button
            text="Log ind"
            variant={Variants.Primary}
            onClick={() => $("#" + LOGIN_MODAL_DIALOG_PREFIX).modal("show")}
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
