import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Icon from '../shared/icons/Icon';
import Title from '../shared/title/Title';
import Button from '../shared/button/Button';
import { Variants } from '../shared/constants/variants';
import { Size } from '../shared/constants/size';
import ProfileComponent from './ProfileComponent';

function DashboardProfileCard(props) {
    return (
            <DashboardPlotContent>
                <Grid container>
                    <Grid container item xs={2}>
                    </Grid>
                    <Grid container item xs={10}>
                        <PlotContainer>
                            <ProfileComponent height={320} index={props.index} onClick={() => console.log("Testing")} plotMeta={props.meta} onChangeDatatype={(id) => { console.log("Test")
                            }} />
                        </PlotContainer>
                    </Grid>
                </Grid>
            </DashboardPlotContent>
    )
}

const DashboardPlotContent = styled.div`
    padding: ${props => props.theme.layout.gutter/2}px;
`;

const CardList = styled.div`
    height: 100%;
    width: 95%;
    vertical-align: middle;
`;

const PlotContainer = styled.div`
    width: 90%;
    margin-left: 5%;
`;

export default DashboardProfileCard;
