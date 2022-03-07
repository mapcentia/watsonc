import styled from "styled-components";
import Grid from '@material-ui/core/Grid';
import { getLogo } from '../utils';
import Button from './shared/button/Button';
import { Variants } from "./shared/constants/variants";
import SearchBox from "./shared/inputs/Searchbox";
import UserProfileButton from "./shared/userProfileButton/UserProfileButton";

function TopBar(props) {

    return (
        <Row container justify="center" alignItems="center">
            <Grid item xs={1} >
                <Logo src={getLogo()} alt="Calypso logo" title="Calypso logo" />
            </Grid>
            <Grid item xs={2}>
                <div className="js-layer-slide-breadcrumbs">
                    <button type="button" className="navbar-toggle" id="burger-btn">
                        <i className="fa fa-database"></i> Vælg data
                    </button>
                </div>
            </Grid>
            <Grid item xs={6}>
                <div id="place-search">
                    <div className="places">
                        <input id="custom-search" className="custom-search typeahead" type="text"
                               placeholder="Søg på adresse, matrikel- eller DGU nummer" />
                            <span id="searchclear" className="glyphicon glyphicon-remove-circle"></span>
                    </div>
                </div>
            </Grid>
            <Grid container item xs={2} justify="flex-end">
                <Button
                text="Opgrader Calypso"
                variant={Variants.Primary}
                onClick={() => window.alert("Godt valg")} />
            </Grid>
            <Grid container item xs={1} justify="center" >
                <UserProfileButton />
            </Grid>
        </Row>
    );
}

const Row = styled(Grid)`
    background-color: ${({ theme }) => theme.colors.primary[4]};
    height: ${({ theme }) => theme.layout.gutter * 2}px;
  `;

const Logo = styled.img`
    height: ${({ theme }) => theme.layout.gutter}px;
    margin-left: ${({ theme }) => theme.layout.gutter / 2}px;
`;

export default TopBar;

