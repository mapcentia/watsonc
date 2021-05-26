import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

function ChemicalsListItem(props) {
    return (
        <Root>
            <Grid container>
                <Grid container item xs={1}>
                    <IconContainer>
                        <Icon name="drag-handle-solid" size={24} />
                    </IconContainer>
                </Grid>
                <Grid container item xs={1} justify='center'>
                    <Circle color={props.circleColor} />
                </Grid>
                <Grid container item xs={9}>
                    <Title level={6} text={props.label} />
                    <Title level={7} text={props.description} color={DarkTheme.colors.gray[3]} />
                </Grid>
            </Grid>
        </Root>
    )
}

const Root = styled.div`
    color: ${props => props.theme.colors.headings};
    margin-top: ${props => props.theme.layout.gutter/8}px;
    padding: ${props => props.theme.layout.gutter/8}px 0;
    border-radius: ${props => props.theme.layout.borderRadius.small}px;
    &:hover {
        background: ${props => props.theme.colors.primary[5]};
        & svg {
            color: ${props => props.theme.colors.primary[2]};
        }
    }
`

const IconContainer = styled.div`
    color: ${props => props.theme.colors.gray[4]};
`;

const Circle = styled.div`
    background-color: ${props => props.color};
    height: 11px;
    width: 11px;
    border-radius: 50%;
    display: inline-block;
    margin-top: ${props => props.theme.layout.gutter/4}px;
`;

export default ChemicalsListItem;
