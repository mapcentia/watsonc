import styled from "styled-components";
import { connect } from "react-redux";
import { showSubscription } from "../../../helpers/show_subscriptionDialogue";
import { showLoginModal } from "../../../helpers/show_loginmodal";
import { LOGIN_MODAL_DIALOG_PREFIX } from "../../../constants";

function UserProfileOptionsList(props) {
  return (
    <Root>
      <li
        onClick={() => {
          window.open("https://admin.calypso.watsonc.dk", "_blank");
        }}
      >
        Min profil
      </li>
      <li onClick={showSubscription}>Abonnement</li>
      {/* <li id="btn-reset">Nulstil</li> */}
      <li
        onClick={() => {
          window.open("http://watsonc.dk", "_blank");
        }}
      >
        Watsonc.dk
      </li>
      <li onClick={() => $("#" + LOGIN_MODAL_DIALOG_PREFIX).modal("show")}>
        Log ud
        {/* <a id="session" href="#" data-toggle="modal" data-target="#login-modal" onClick={() => {}}>
          Log ud
        </a> */}
      </li>
    </Root>
  );
}

const Root = styled.ul`
  background: ${({ theme }) => theme.colors.gray[5]};
  font: ${({ theme }) => theme.fonts.body};
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    padding: ${({ theme }) => theme.layout.gutter / 4}px
      ${({ theme }) => theme.layout.gutter / 2}px;
    border-radius: ${({ theme }) => theme.layout.borderRadius.small}px;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.gray[1]};
    &:hover {
      background: ${({ theme }) => theme.colors.gray[4]};
    }
  }
`;

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
  setDashboardMode: (key) => dispatch(setDashboardMode(key)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserProfileOptionsList);
