import { useState } from 'react';
import styled, { css } from 'styled-components';
import DashboardHeader from './DashboardHeader';
import DashboardContent from './DashboardContent';

function DashboardShell(props) {
    const [dashboardMode, setDashboardMode] = useState('full');

    return (
        <Root mode={dashboardMode}>
            <DashboardHeader setDashboardMode={setDashboardMode} dashboardMode={dashboardMode} />
            <DashboardContent />
        </Root>
    )
}

const Root = styled.div`
    width: 100%;
    height: 75vh;
    transition: height 0.5s linear;
    ${({ mode, theme }) => {
        const styles = {
            full: css `
                height: 75vh;
            `,
            half: css `
                height: 50vh;
            `,
            minimized: css `
                height: ${theme.layout.gutter*2}px;
            `
        }
        return styles[mode];
    }}
`

export default DashboardShell;
