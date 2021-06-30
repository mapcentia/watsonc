import styled from "styled-components";
import SubscriptionDialogue from '../../SubscriptionDialogue';
import {connect} from 'react-redux';

var ReactDOM = require('react-dom');

function UserProfileOptionsList(props) {
    var subscriptionDialoguePlaceholderId = 'upgrade-modal'
    const onCloseButtonClick = () => {
        $('#' + subscriptionDialoguePlaceholderId).modal('hide');
    }

    const openAbonnement = () => {
        props.setDashboardMode('minimized');
        $('#watsonc-limits-reached-text').hide();
        ReactDOM.render(<SubscriptionDialogue onCloseButtonClick={onCloseButtonClick } />, document.getElementById(subscriptionDialoguePlaceholderId));
        $('#' + subscriptionDialoguePlaceholderId).modal('show');
    }

    return(
        <Root>
            <li onClick={() => {window.open("https://admin.calypso.watsonc.dk", "_blank");}}>Min profil</li>
            <li onClick={openAbonnement}>Abonnement</li>
            <li id="btn-reset">Nulstil</li>
            <li onClick={() => {window.open("http://watsonc.dk", "_blank");}}>Watsonc.dk</li>
            <li><a id="session" href="#" data-toggle="modal" data-target="#login-modal">Log ud</a></li>
        </Root>
    );
}

const Root = styled.ul`
    background: ${({ theme }) => theme.colors.gray[5]};
    font: ${({ theme }) => theme.fonts.body};
    list-style: none;
    margin: 0;
    padding: 0;

    li{
        padding: ${({ theme }) => theme.layout.gutter / 4}px ${({ theme }) => theme.layout.gutter / 2}px;
        border-radius: ${({ theme }) => theme.layout.borderRadius.small}px;
        cursor: pointer;
        color: ${({ theme }) => theme.colors.gray[1]};
        &:hover{
            background: ${({ theme }) => theme.colors.gray[4]};
        }
    }
`;

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
    setDashboardMode:  (key) => dispatch(setDashboardMode(key))
});


export default connect(mapStateToProps, mapDispatchToProps)(UserProfileOptionsList);
