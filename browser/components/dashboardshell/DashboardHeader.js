import styled, { css } from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Icon from '../shared/icons/Icon';
import Title from '../shared/title/Title';
import {Align} from '../shared/constants/align';
import {Variant} from '../shared/constants/variants';
import {Size} from '../shared/constants/size';
import Button from '../shared/button/Button';
import ButtonGroup from '../shared/button/ButtonGroup';
import {DarkTheme} from '../../themes/DarkTheme';

function DashboardHeader(props) {
    return (
        <Root>
            <Grid container>
                <Grid container item xs={2}>
                    <IconsLayout>
                        <IconContainer onClick={() => props.setDashboardMode('minimized')} active={props.dashboardMode === 'minimized'} >
                            <Icon name="dashboard-minimized-solid" size={16} />
                        </IconContainer>
                        <IconContainer onClick={() => props.setDashboardMode('half')} active={props.dashboardMode === 'half'}>
                            <Icon name="dashboard-half-solid" size={16} />
                        </IconContainer>
                        <IconContainer onClick={() => props.setDashboardMode('full')} active={props.dashboardMode === 'full'}>
                            <Icon name="dashboard-full-solid" size={16} />
                        </IconContainer>
                    </IconsLayout>
                </Grid>
                <Grid container item xs={3}>
                    <Grid container>
                        <Grid container item xs={1}>
                            <Icon name="dashboard" strokeColor={DarkTheme.colors.headings} size={32} />
                        </Grid>
                        <Grid container item xs={4}>
                            <Title text={__('Dashboard')} level={4} color={DarkTheme.colors.headings} marginLeft={8} />
                            <Title text={__('ikke gemt')} level={5} color={DarkTheme.colors.primary[5]} marginLeft={8} />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container item xs={2}>
                    <ButtonGroup align={Align.Center} spacing={2} marginTop={1}>
                        <Button text={__("Gem")} variant={Variants.Secondary} onClick={() => setShowProjectsList(!showProjectsList)} size={Size.Small} />
                        <Button text={__("Abn")} variant={Variants.None} onClick={() => applyParameter()} size={Size.Small} />
                    </ButtonGroup> }
                </Grid>
                <Grid container item xs={5} justify='flex-end'>
                    <ButtonGroup align={Align.Center} spacing={2} marginTop={1}>
                        <Button text={__('Ny graf')} size={Size.Medium} variant={Variants.Primary} />
                    </ButtonGroup>
                </Grid>
            </Grid>
        </Root>
    )
}

const Root = styled.div`
    height: ${props => props.theme.layout.gutter*2}px;
    background: ${props => props.theme.colors.primary[2]};
    padding: ${props => props.theme.layout.gutter/2}px;
    border-radius: ${props => props.theme.layout.gutter/2}px ${props => props.theme.layout.gutter/2}px 0 0;
`

const IconsLayout = styled.div`
    height: 32px;
    border: 1px solid ${props => props.theme.colors.primary[3]};
    border-radius: ${props => props.theme.layout.borderRadius.small}px;
    padding: 2px;
`;

const IconContainer = styled.div`
    display: inline-block;
    height: 100%;
    width: ${props => props.theme.layout.gutter}px;
    padding-left: ${props => props.theme.layout.gutter/4}px;
    padding-top: ${props => props.theme.layout.gutter/8}px;
    cursor: pointer;
    color: ${props => props.theme.colors.gray[3]};
    &:hover {
        background-color: ${props => props.theme.colors.primary[3]};
        color: ${props => props.theme.colors.headings};
    }
    ${({ active, theme }) => {
        const styles = {
            true: css `
                color: ${theme.colors.interaction[4]};
            `
        };
        return styles[active];
    }}
`

export default DashboardHeader;
