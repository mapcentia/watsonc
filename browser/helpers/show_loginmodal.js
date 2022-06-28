import React from "react";

import { LOGIN_MODAL_DIALOG_PREFIX } from "./../constants";
import { Provider } from "react-redux";
import reduxStore from "./../redux/store";
import ThemeProvider from "../themes/ThemeProvider";
import LoginModal from "../components/LoginModal";

function showLoginModal() {
  //   const placeholderId = `${LOGIN_MODAL_DIALOG_PREFIX}-placeholder`;

  ReactDOM.render(
    <div>
      <Provider store={reduxStore}>
        <ThemeProvider>
          <LoginModal />
        </ThemeProvider>
      </Provider>
    </div>,
    document.getElementById(LOGIN_MODAL_DIALOG_PREFIX)
  );
  $("#" + LOGIN_MODAL_DIALOG_PREFIX).modal("show");
}

export { showLoginModal };
