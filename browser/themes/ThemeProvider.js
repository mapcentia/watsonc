import React from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import "react-toastify/dist/ReactToastify.css";
import { DarkTheme } from "./DarkTheme";

class ThemeProvider extends React.Component {
  render() {
    return (
      <StyledThemeProvider theme={DarkTheme}>
        {this.props.children}
      </StyledThemeProvider>
    );
  }
}

export default ThemeProvider;
