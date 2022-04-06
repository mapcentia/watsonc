import {useContext, useState, useEffect} from "react";
import {connect} from "react-redux";
import styled, {css} from "styled-components";
import Grid from "@material-ui/core/Grid";
import Icon from "../shared/icons/Icon";
import Title from "../shared/title/Title";
import {Align} from "../shared/constants/align";
import {Variant} from "../shared/constants/variants";
import {Size} from "../shared/constants/size";
import {showSubscription} from "./../../helpers/show_subscriptionDialogue";
import Button from "../shared/button/Button";
import ButtonGroup from "../shared/button/ButtonGroup";
import {DarkTheme} from "../../themes/DarkTheme";
import ProjectContext from "../../contexts/project/ProjectContext";
import {getNewPlotId} from "../../helpers/common";
import base64url from "base64url";

const session = require("./../../../../session/browser/index");

function DashboardHeader(props) {
    const [showSaveButtons, setShowSaveButtons] = useState(true);
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

    const addNewPlot = () => {
        const isFree = typeof session.getProperties()?.["license"] === "undefined" || session.getProperties()?.["license"] === "free";
        console.log(session.getProperties())
debugger
        let allPlots = props.getAllPlots();

        if ((typeof isFree === "undefined" || isFree) && allPlots.length > 0) {
            console.log(allPlots);
            showSubscription();
            return;
        }

        let activePlots = projectContext.activePlots;
        let newPlotId = getNewPlotId(allPlots);
        let plotData = {
            id: `plot_${newPlotId}`,
            title: `Graf ${newPlotId}`,
            measurements: [],
            measurementsCachedData: {},
            relations: {},
        };
        activePlots.unshift(plotData);
        allPlots.unshift(plotData);
        activePlots = activePlots.map((plot) => plot.id);
        props.setPlots(allPlots, activePlots);
        props.onActivePlotsChange(activePlots, allPlots, projectContext);
    };

    const createSnapShot = () => {
        props.state.getState().then(state => {
            state.map = props.anchor.getCurrentMapParameters();
            state.meta = getSnapshotMeta();
            let data = {
                title: "test",
                anonymous: false,
                snapshot: state,
                database: vidiConfig.appDatabase,
                schema: vidiConfig.appSchema,
                host: props.urlparser.hostname
            };

            $.ajax({
                url: `/api/state-snapshots` + '/' + vidiConfig.appDatabase,
                method: 'POST',
                contentType: 'text/plain; charset=utf-8',
                dataType: 'text',
                data: base64url(JSON.stringify(data))
            }).then((response) => {
                // _self.setState({loading: false});
                // _self.refreshSnapshotsList();
                props.backboneEvents.get().trigger('statesnapshot:refresh');
                let obj = {"stateId": response.id, "data": data};
                window.parent.postMessage(obj, '*');
            }).catch(error => {
                console.error(error);
                // _self.setState({loading: false});
                // _self.refreshSnapshotsList();
            });
        });
    }

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
    }

    return (
        <Root>
            <Grid container>
                <Grid container item xs={3}>
                    <Grid container>
                        <Grid container item xs={1}>
                            <Icon
                                name="dashboard"
                                strokeColor={DarkTheme.colors.headings}
                                size={32}
                            />
                        </Grid>
                        <Grid container item xs={4}>
                            <Title
                                text={__("Dashboard")}
                                level={4}
                                color={DarkTheme.colors.headings}
                                marginLeft={8}
                            />
                            <Title
                                text={__("Ikke gemt")}
                                level={5}
                                color={DarkTheme.colors.primary[5]}
                                marginLeft={8}
                            />
                        </Grid>
                        <Grid container item xs={4}>
                            <ButtonGroup
                                align={Align.Center}
                                spacing={2}
                                marginTop={1}
                                marginRight={8}
                            >
                                <Button
                                    text={"Gem"}
                                    onClick={() => createSnapShot()}
                                    variant={Variants.Primary}
                                />
                            </ButtonGroup>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container item xs={3}>
                    {showSaveButtons ? (
                        <ButtonGroup align={Align.Center} spacing={2} marginTop={1}>
                            {/*<Button text={__("Gem")} variant={Variants.Secondary} onClick={() => setShowProjectsList(!showProjectsList)} size={Size.Small} />*/}
                            {/*<Button text={__("Abn")} variant={Variants.None} onClick={() => applyParameter()} size={Size.Small} />*/}
                        </ButtonGroup>
                    ) : null}
                </Grid>
                <Grid container item xs={2} justify="flex-end"></Grid>
                <Grid container item xs={4} justify="flex-end">
                    {showSaveButtons ? (
                        <ButtonGroup
                            align={Align.Center}
                            spacing={2}
                            marginTop={1}
                            marginRight={8}
                        >
                            <Button
                                text={"Ny graf"}
                                // size={Size.Medium}
                                onClick={() => addNewPlot()}
                                variant={Variants.Primary}
                            />
                        </ButtonGroup>
                    ) : null}
                    <IconsLayout>
                        <IconContainer
                            onClick={() => props.setDashboardMode("minimized")}
                            active={props.dashboardMode === "minimized"}
                        >
                            <Icon name="dashboard-minimized-solid" size={16}/>
                        </IconContainer>
                        <IconContainer
                            onClick={() => props.setDashboardMode("half")}
                            active={props.dashboardMode === "half"}
                        >
                            <Icon name="dashboard-half-solid" size={16}/>
                        </IconContainer>
                        <IconContainer
                            onClick={() => props.setDashboardMode("full")}
                            active={props.dashboardMode === "full"}
                        >
                            <Icon name="dashboard-full-solid" size={16}/>
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
  border-radius: ${(props) => props.theme.layout.gutter / 2}px ${(props) => props.theme.layout.gutter / 2}px 0 0;
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

  ${({active, theme}) => {
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
