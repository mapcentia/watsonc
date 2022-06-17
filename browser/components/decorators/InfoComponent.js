import React from "react";
import Title from "../shared/title/Title";
import { DarkTheme } from "../../themes/DarkTheme";
import { Grid } from "@material-ui/core";

const InfoComponent = (props) => {
  return (
    <Grid container spacing={8}>
      {props.info.map((elem) => {
        if (elem.type == "header") {
          return (
            <Grid item xs={12}>
              <Title
                level={2}
                text={elem.value}
                color={DarkTheme.colors.headings}
              />
            </Grid>
          );
        }

        if (elem.type == "label") {
          return (
            <>
              <Grid item xs={4}>
                <Title
                  level={4}
                  text={elem.label + ": "}
                  color={DarkTheme.colors.gray[3]}
                />
              </Grid>
              <Grid item xs={8}>
                <Title
                  level={4}
                  text={elem.value}
                  color={DarkTheme.colors.gray[5]}
                />
              </Grid>
            </>
          );
        }
        if (elem.type == "text") {
          return (
            <Grid item xs={12}>
              <Title
                level={4}
                text={elem.value}
                color={DarkTheme.colors.gray[5]}
              />
            </Grid>
          );
        }
      })}
    </Grid>
  );
};

export default InfoComponent;
