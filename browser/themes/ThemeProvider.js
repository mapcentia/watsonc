import React from 'react';
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { ToastContainer } from 'react-toastify';
import { DarkTheme } from "./DarkTheme";

class ThemeProvider extends React.Component {
    render() {
        return (
            <StyledThemeProvider theme={DarkTheme}>
                <ToastContainer />
                {this.props.children}
            </StyledThemeProvider>
        )
    }
}

export default ThemeProvider
