import React from "react";
import styled from "styled-components";
import Grid from "@material-ui/core/Grid";
import CloseButton from "./shared/button/CloseButton";
import ButtonGroup from "./shared/button/ButtonGroup";
import Button from "./shared/button/Button";
import { Variants } from "./shared/constants/variants";
import Card from "./shared/card/Card";
import Title from "./shared/title/Title";
import TextInput from "./shared/inputs/TextInput";
import { LOGIN_MODAL_DIALOG_PREFIX } from "./../constants";
import { useState, useEffect, useRef } from "react";
import useInterval from "./shared/hooks/useInterval";

const LoginModal = (props) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [statusText, setStatusText] = useState("");
  const [loggedIn, setLoggedIn] = useState(props.session.isAuthenticated());
  const [stopPoll, setStopPoll] = useState(false);
  const timer = useRef(null);

  useInterval(
    () => {
      if (props.session.isStatusChecked()) {
        setStopPoll(true);
        setLoggedIn(props.session.isAuthenticated());
        if (!props.session.isAuthenticated()) {
          if (!props.urlparser.urlVars || !props.urlparser.urlVars.state) {
            $("#" + LOGIN_MODAL_DIALOG_PREFIX).modal("show");
            $("#watsonc-menu-dialog").modal("hide");
          }
        }
      }
    },
    stopPoll ? null : 1000
  );

  useEffect(() => {
    props.backboneEvents.get().on(`session:authChange`, (authenticated) => {
      clearTimeout(timer.current);
      if (authenticated) {
        setLoggedIn(true);
        setUserName("");
        setPassword("");
        setTimeout(() => {
          $("#" + LOGIN_MODAL_DIALOG_PREFIX).modal("hide");
          $("#watsonc-menu-dialog").modal("show");
        }, 1500);
      } else {
        setUserName("");
        setPassword("");
        setLoggedIn(false);
        setStatusText("Du er nu logget ud");
        setTimeout(() => {
          setStatusText("");
        }, 2000);
      }
    });
  }, []);

  const log_in = () => {
    var input = document.getElementById("sessionScreenName");
    let lastValue = input.value;
    input.value = userName;
    let event = new Event("change", { bubbles: true });
    let tracker = input._valueTracker;
    if (tracker) {
      tracker.setValue(lastValue);
    }
    input.dispatchEvent(event);

    var input = document.getElementById("sessionPassword");
    lastValue = input.value;
    input.value = password;
    event = new Event("change", { bubbles: true });
    tracker = input._valueTracker;
    if (tracker) {
      tracker.setValue(lastValue);
    }
    input.dispatchEvent(event);

    $("#login-modal .btn-raised").removeAttr("disabled");
    setTimeout(() => {
      $("#login-modal .btn-raised").click();
    }, 100);

    timer.current = setTimeout(() => {
      if ($("#login-modal .alert-dismissible").text().includes("Wrong")) {
        setStatusText("Forkert brugernavn og eller password");
      } else {
        setStatusText("Noget gik galt. Prøv igen senere.");
      }
    }, 1000);
  };

  const log_out = () => {
    $("#login-modal .btn-raised").click();
  };

  const close_window = () => {
    $(`#${LOGIN_MODAL_DIALOG_PREFIX}`).modal("hide");
    if (!loggedIn) {
      $("#watsonc-menu-dialog").modal("show");
    }
  };

  return (
    <Root>
      <Grid container justify="flex-end" spacing={8} item xs={12}>
        <CloseButton onClick={close_window} />
      </Grid>
      <ModalHeader>
        <Grid container>
          <Grid
            container
            direction="column"
            alignItems="center"
            justify="center"
            item
            xs={12}
          >
            <Title
              text={__("Velkommen til Calypso")}
              color={DarkTheme.colors.headings}
            />
          </Grid>
        </Grid>
      </ModalHeader>
      <ModalBody>
        {(statusText !== "" || loggedIn) && (
          <Grid
            container
            spacing={8}
            direction="column"
            alignItems="center"
            justify="center"
          >
            <Title
              text={loggedIn ? `Du er logget ind` : statusText}
              color={DarkTheme.colors.headings}
              level={3}
            />
          </Grid>
        )}
        {!loggedIn && (
          <>
            <Grid
              container
              spacing={8}
              direction="row"
              alignItems="center"
              justify="center"
            >
              <Title
                text={"Log ind eller"}
                color={DarkTheme.colors.headings}
                level={4}
              />
              <Title
                text={
                  <a
                    href="https://calypso.watsonc.dk/#create-user"
                    target="_blank"
                    style={{ color: DarkTheme.colors.interaction[4] }}
                  >
                    &nbsp;opret bruger
                  </a>
                }
                color={DarkTheme.colors.interaction[4]}
                level={4}
              />
            </Grid>

            <Grid
              container
              spacing={8}
              direction="column"
              alignItems="center"
              justify="center"
            >
              <Grid item xs={10}>
                <TextInput
                  value={userName}
                  onChange={setUserName}
                  placeholder={"Brugernavn"}
                />
              </Grid>
              <Grid item xs={10}>
                <TextInput
                  value={password}
                  onChange={setPassword}
                  placeholder={"Password"}
                  password
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      log_in();
                    }
                  }}
                />
              </Grid>
            </Grid>
          </>
        )}
        <ButtonGroup align={Align.Center}>
          {!loggedIn && (
            <Button
              text={__("Log ind")}
              variant={
                userName == "" && password == ""
                  ? Variants.PrimaryDisabled
                  : Variants.Primary
              }
              onClick={() => {
                log_in();
              }}
              size={Size.Large}
              disabled={userName == "" && password == ""}
            />
          )}
          {loggedIn && (
            <Button
              text={__("Log ud")}
              variant={Variants.Primary}
              onClick={() => {
                log_out();
              }}
              size={Size.Large}
            />
          )}
          <Button
            text={__("Luk vindue")}
            variant={Variants.None}
            onClick={close_window}
            size={Size.Large}
          />
        </ButtonGroup>
      </ModalBody>
    </Root>
  );
};

const Root = styled.div`
  background: ${({ theme }) => hexToRgbA(theme.colors.primary[1], 0.96)};
  border-radius: ${({ theme }) => `${theme.layout.borderRadius.large}px`};
  color: ${({ theme }) => `${theme.colors.headings}`};
`;

const ModalHeader = styled.div`
  padding: ${({ theme }) =>
    `${theme.layout.gutter}px ${theme.layout.gutter}px 0 ${theme.layout.gutter}px`};
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => `${theme.layout.gutter}px`};
`;
export default LoginModal;
