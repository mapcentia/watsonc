import { useState, useContext } from "react";
import { connect } from "react-redux";
import styled, { css } from "styled-components";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DashboardHeader from "./DashboardHeader";
import DashboardContent from "./DashboardContent";
import ProjectContext from "../../contexts/project/ProjectContext";

function DashboardShell(props) {
  return (
    <DndProvider backend={HTML5Backend}>
      <ProjectContext.Consumer>
        {(context) => {
          return (
            <Root mode={props.dashboardMode}>
              <DashboardHeader
                {...props}
                {...context}
                setActivePlots={context.setActivePlots}
              />
              <DashboardContent {...props} {...context} />
            </Root>
          );
        }}
      </ProjectContext.Consumer>
    </DndProvider>
  );
}

const Root = styled.div`
  width: 100%;
  height: 75vh;
  transition: height 0.5s linear;
  ${({ mode, theme }) => {
    const styles = {
      full: css`
        height: 75vh;
      `,
      half: css`
        height: 50vh;
      `,
      minimized: css`
        height: ${theme.layout.gutter * 2}px;
      `,
    };
    return styles[mode];
  }}
`;

const mapStateToProps = (state) => ({
  dashboardMode: state.global.dashboardMode,
});

const mapDispatchToProps = (dispatch) => ({
  setDashboardMode: (key) => dispatch(setDashboardMode(key)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardShell);
