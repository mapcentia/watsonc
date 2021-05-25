import styled from 'styled-components';
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
                    <IconContainer>
                        <Icon name="dashboard" size={16} strokeColor={DarkTheme.colors.headings} />
                    </IconContainer>
                    <IconContainer>
                        <Icon name="dashboard" size={16} strokeColor={DarkTheme.colors.headings} />
                    </IconContainer>
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

const IconContainer = styled.div`
    height: ${props => props.theme.layout.gutter}px;
    width: ${props => props.theme.layout.gutter}px;
    padding-top: ${props => props.theme.layout.gutter/4}px;
`

export default DashboardHeader;
