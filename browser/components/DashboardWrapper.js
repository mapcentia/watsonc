import React from "react";
import ReactDOM from "react-dom";
import reduxStore from "../redux/store";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import ThemeProvider from "../themes/ThemeProvider";
import ProjectProvider from "../contexts/project/ProjectProvider";
import DashboardShell from "./dashboardshell/DashboardShell";
import DashboardComponent from "./DashboardComponent";

const DASHBOARD_CONTAINER_ID = "watsonc-plots-dialog-form";
const HIDDEN_DIV = "watsonc-plots-dialog-form-hidden";

const DashboardWrapper = React.forwardRef((props, ref) => {
  const DashboardShellWrapper = (props) =>
    ReactDOM.createPortal(
      <Provider store={reduxStore}>
        <ThemeProvider>
          <ToastContainer />
          <DashboardShell {...props} />
        </ThemeProvider>
      </Provider>,
      document.getElementById(DASHBOARD_CONTAINER_ID)
    );

  const DashboardComponentWrapper = React.forwardRef((props, ref) =>
    ReactDOM.createPortal(
      <DashboardComponent {...props} ref={ref} />,
      document.getElementById(HIDDEN_DIV)
    )
  );

  return (
    <ProjectProvider>
      <DashboardShellWrapper {...props} />
      <DashboardComponentWrapper ref={ref} {...props} />
    </ProjectProvider>
  );
});

export default DashboardWrapper;
