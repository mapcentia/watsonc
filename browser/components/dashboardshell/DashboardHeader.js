import { useContext, useState, useEffect } from "react";
import { connect } from "react-redux";
import styled, { css } from "styled-components";
import Grid from "@material-ui/core/Grid";
import Icon from "../shared/icons/Icon";
import Title from "../shared/title/Title";
import { Align } from "../shared/constants/align";
import { Variants } from "../shared/constants/variants";
import { Size } from "../shared/constants/size";
import {
  showSubscription,
  showSubscriptionIfFree,
} from "./../../helpers/show_subscriptionDialogue";
import Button from "../shared/button/Button";
import ButtonGroup from "../shared/button/ButtonGroup";
import { DarkTheme } from "../../themes/DarkTheme";
import ProjectContext from "../../contexts/project/ProjectContext";
import { getNewPlotId } from "../../helpers/common";
import base64url from "base64url";
import reduxStore from "../../redux/store";
import { clearBoreholeFeatures } from "../../redux/actions";
import { useDashboardStore } from "../../zustand/store";

const session = require("./../../../../session/browser/index");

function DashboardHeader(props) {
  const [showSaveButtons, setShowSaveButtons] = useState(true);
  const [dashboardTitle, setDashboardTitle] = useState(null);
  const [dashboardId, setDashboardId] = useState(null);
  const [dashboardItems, setDashboardItems] = useDashboardStore((store) => [
    store.dashboardItems,
    store.setDashboardItems,
  ]);
  const [addingNew, setAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const projectContext = useContext(ProjectContext);

  useEffect(() => {
    let canShowSaveButtons = true;
    if (
      props.dashboardMode === "minimized" ||
      props.dashboardContent === "projects"
    ) {
      canShowSaveButtons = false;
    }
    setShowSaveButtons(canShowSaveButtons);
  }, [props.dashboardMode, props.dashboardContent]);

  useEffect(() => {
    props.backboneEvents.get().on("statesnapshot:apply", (snapshot) => {
      setDashboardTitle(snapshot.title);
      setDashboardId(snapshot.id);
      setDashboardItems(
        snapshot.snapshot.modules.watsonc.dashboardItems.map(
          (dashboardItem, index) => {
            return {
              type: dashboardItem.id ? 0 : 1,
              item: dashboardItem,
              plotsIndex: index,
            };
          }
        )
      );
    });
  }, [dashboardTitle]);

  useEffect(() => {
    if (addingNew) {
      document.getElementById("chartsContainer").scrollTop =
        dashboardItems.length * 400;
      setAddingNew(false);
    }
  }, [dashboardItems]);

  const addNewPlot = () => {
    if (
      showSubscriptionIfFree(
        dashboardItems.filter((item) => item.type === DASHBOARD_ITEM_PLOT)
          .length > 0
      )
    )
      return;

    if (props.dashboardMode === "minimized") {
      props.setDashboardMode("half");
    }

    let newPlotId = getNewPlotId(
      dashboardItems
        .filter((item) => item.type === DASHBOARD_ITEM_PLOT)
        .map((item) => item.item)
    );
    let plotData = {
      id: `plot_${newPlotId}`,
      title: `Graf ${newPlotId}`,
      measurements: [],
      measurementsCachedData: {},
      relations: {},
    };
    setDashboardItems([
      ...dashboardItems,
      {
        type: DASHBOARD_ITEM_PLOT,
        item: plotData,
        plotsIndex: dashboardItems.length - 1,
      },
    ]);
    setAddingNew(true);
  };

  const save = () => {
    if (showSubscriptionIfFree()) return;

    let title;
    if (!dashboardTitle) {
      title = prompt("Navn på dashboard");
      if (title) {
        createSnapshot(title);
      }
    } else {
      updateSnapShot();
    }
  };

  const saveAs = () => {
    if (showSubscriptionIfFree()) return;
    let title = prompt("Navn på dashboard");
    if (title) {
      createSnapshot(title);
    }
  };

  const clearDashboard = () => {
    if (confirm("Er du sikker på, at du vil fjerne alt fra Dashboard?")) {
      reduxStore.dispatch(clearBoreholeFeatures());
      setDashboardItems([]);
      setDashboardId();
      setDashboardTitle();
      props.backboneEvents.get().trigger("watsonc:clearChemicalList");
    }
  };

  const createSnapshot = (title) => {
    setSaving(true);
    props.state.getState().then((state) => {
      state.map = props.anchor.getCurrentMapParameters();
      state.meta = getSnapshotMeta();

      state.modules.watsonc.dashboardItems = dashboardItems
        .map((e) => e.item)
        .map((o) => {
          if (o?.profile?.data?.data) delete o.profile.data.data;
          if (o?.measurementsCachedData) delete o.measurementsCachedData;
          return o;
        });

      let data = {
        title: title,
        anonymous: false,
        snapshot: state,
        database: vidiConfig.appDatabase,
        schema: vidiConfig.appSchema,
        host: props.urlparser.hostname,
      };

      $.ajax({
        url: `/api/state-snapshots` + "/" + vidiConfig.appDatabase,
        method: "POST",
        contentType: "text/plain; charset=utf-8",
        dataType: "text",
        data: base64url(JSON.stringify(data)),
      })
        .then((response) => {
          props.backboneEvents.get().trigger("statesnapshot:refresh");
          try {
            const id = JSON.parse(response).id;
            setDashboardId(id);
            setDashboardTitle(title);
          } catch (e) {
            console.error(e.message);
          }
          setSaving(false);
        })
        .catch((error) => {
          console.error(error);
          setSaving(false);
        });
    });
  };

  const updateSnapShot = () => {
    setSaving(true);
    props.state.getState().then((state) => {
      state.map = props.anchor.getCurrentMapParameters();
      state.meta = getSnapshotMeta();

      state.modules.watsonc.dashboardItems = dashboardItems
        .map((e) => e.item)
        .map((o) => {
          if (o?.profile?.data?.data) delete o.profile.data.data;
          if (o?.measurementsCachedData) delete o.measurementsCachedData;
          return o;
        });

      let data = {
        title: dashboardTitle,
        snapshot: state,
      };
      $.ajax({
        url:
          `/api/state-snapshots` +
          "/" +
          vidiConfig.appDatabase +
          "/" +
          dashboardId,
        method: "PUT",
        contentType: "text/plain; charset=utf-8",
        dataType: "text",
        data: base64url(JSON.stringify(data)),
      })
        .then((response) => {
          props.backboneEvents.get().trigger("statesnapshot:refresh");
          setSaving(false);
        })
        .catch((error) => {
          console.error(error);
          setSaving(false);
        });
    });
  };

  const getSnapshotMeta = () => {
    let result = {};
    let queryParameters = props.urlparser.urlVars;
    if (`config` in queryParameters && queryParameters.config) {
      result.config = queryParameters.config;
    }

    if (`tmpl` in queryParameters && queryParameters.tmpl) {
      result.tmpl = queryParameters.tmpl;
    }
    return result;
  };

  return (
    <Root>
      <Grid container>
        <Grid container item xs={10}>
          <Icon
            name="dashboard"
            strokeColor={DarkTheme.colors.headings}
            size={32}
          />
          <Title
            text={__("Dashboard")}
            level={4}
            color={DarkTheme.colors.headings}
            marginLeft={8}
          />
          <Title
            text={dashboardTitle || __("Ikke gemt")}
            level={5}
            color={DarkTheme.colors.primary[5]}
            marginLeft={8}
          />
          <ButtonGroup
            align={Align.Center}
            spacing={2}
            marginLeft={8}
            marginTop={1}
            marginRight={8}
            variant={"contained"}
          >
            <Button
              text={"Gem"}
              onClick={() => save()}
              variant={
                saving || !dashboardId
                  ? Variants.PrimaryDisabled
                  : Variants.Primary
              }
              disabled={saving || !dashboardId}
            />
            <Button
              text={"Gem\u00A0som"}
              onClick={() => saveAs()}
              variant={saving ? Variants.PrimaryDisabled : Variants.Primary}
              disabled={saving}
            />
            <Button
              text={"Ryd\u00A0dashboard"}
              onClick={() => clearDashboard()}
              variant={saving ? Variants.PrimaryDisabled : Variants.Primary}
            />
          </ButtonGroup>
        </Grid>
        {/* <Grid container item xs={8} justify="left"></Grid> */}
        <Grid container item xs={2} justify="flex-end">
          <ButtonGroup
            align={Align.Center}
            spacing={2}
            marginTop={1}
            marginRight={8}
            variant={"contained"}
          >
            <Button
              text={"Ny graf"}
              // size={Size.Medium}
              onClick={() => addNewPlot()}
              variant={saving ? Variants.PrimaryDisabled : Variants.Primary}
            />
          </ButtonGroup>
          <IconsLayout>
            <IconContainer
              onClick={() => props.setDashboardMode("minimized")}
              active={props.dashboardMode === "minimized"}
            >
              <Icon name="dashboard-minimized-solid" size={16} />
            </IconContainer>
            <IconContainer
              onClick={() => props.setDashboardMode("half")}
              active={props.dashboardMode === "half"}
            >
              <Icon name="dashboard-half-solid" size={16} />
            </IconContainer>
            <IconContainer
              onClick={() => props.setDashboardMode("full")}
              active={props.dashboardMode === "full"}
            >
              <Icon name="dashboard-full-solid" size={16} />
            </IconContainer>
          </IconsLayout>
        </Grid>
      </Grid>
    </Root>
  );
}

const Root = styled.div`
  height: ${(props) => props.theme.layout.gutter * 2}px;
  background: ${(props) => props.theme.colors.primary[2]};
  padding: ${(props) => props.theme.layout.gutter / 2}px;
  border-radius: ${(props) => props.theme.layout.gutter / 2}px
    ${(props) => props.theme.layout.gutter / 2}px 0 0;
`;

const IconsLayout = styled.div`
  height: 32px;
  border: 1px solid ${(props) => props.theme.colors.primary[3]};
  border-radius: ${(props) => props.theme.layout.borderRadius.small}px;
  padding: 2px;
`;

const IconContainer = styled.div`
  display: inline-block;
  height: 100%;
  width: ${(props) => props.theme.layout.gutter}px;
  padding-left: ${(props) => props.theme.layout.gutter / 4}px;
  padding-top: ${(props) => props.theme.layout.gutter / 8}px;
  cursor: pointer;
  color: ${(props) => props.theme.colors.gray[3]};

  &:hover {
    background-color: ${(props) => props.theme.colors.primary[3]};
    color: ${(props) => props.theme.colors.headings};
  }

  ${({ active, theme }) => {
    const styles = {
      true: css`
        color: ${theme.colors.interaction[4]};
      `,
    };
    return styles[active];
  }}
`;

const mapStateToProps = (state) => ({
  dashboardMode: state.global.dashboardMode,
  dashboardContent: state.global.dashboardContent,
});

const mapDispatchToProps = (dispatch) => ({
  setDashboardMode: (key) => dispatch(setDashboardMode(key)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardHeader);
