import styled from 'styled-components';
import DashboardHeader from './DashboardHeader';
import DashboardContent from './DashboardContent';

function DashboardShell(props) {
    return (
        <Root>
            <DashboardHeader />
            <DashboardContent />
        </Root>
    )
}

const Root = styled.div`
    width: 100%;
    height: 75vh;
`

export default DashboardShell;
