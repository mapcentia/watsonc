import React, { Children } from 'react';
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { LightTheme } from "./LightTheme";
import { DarkTheme } from "./DarkTheme";

const THEMES = {
    light: LightTheme,
    dark: DarkTheme
}

class ThemeProvider extends React.Component {
    state = {
        theme: 'light'
    }

    constructor(props) {
        super(props);
        this.setTheme = this.setTheme.bind(this);
        this.getTheme = this.getTheme.bind(this);
    }

    setTheme(theme) {
        this.setState({ theme })
    }

    getTheme() {
        return THEMES[this.state.theme];
    }

    getChildren() {
        const { children } = this.props;
        const functions = {setTheme: this.setTheme}
        return Children.map(children, (child) => React.cloneElement(child, {
            functions
        }))
    }

    render() {
        return (
            <StyledThemeProvider theme={this.getTheme()}>
                {this.getChildren()}
            </StyledThemeProvider>
        )
    }
}

export default ThemeProvider
