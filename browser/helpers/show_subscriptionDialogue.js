import SubscriptionDialogue from "../components/SubscriptionDialogue";
import { setDashboardMode } from "../redux/actions";
var ReactDOM = require("react-dom");

function showSubscription() {
  var subscriptionDialoguePlaceholderId = "upgrade-modal";
  const onCloseButtonClick = () => {
    $("#" + subscriptionDialoguePlaceholderId).modal("hide");
  };

  const openAbonnement = () => {
    setDashboardMode("minimized");
    $("#watsonc-limits-reached-text").hide();
    ReactDOM.render(
      <SubscriptionDialogue onCloseButtonClick={onCloseButtonClick} />,
      document.getElementById(subscriptionDialoguePlaceholderId)
    );
    $("#" + subscriptionDialoguePlaceholderId).modal("show");
  };

  openAbonnement();
}

export { showSubscription };
