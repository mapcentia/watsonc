import SubscriptionDialogue from "../components/SubscriptionDialogue";
import { setDashboardMode } from "../redux/actions";
var ReactDOM = require("react-dom");

const session = require("./../../../session/browser/index");

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

function showSubscriptionIfFree(other_logic = true) {
  const isFree = session.getProperties()?.["license"] !== "premium";
  console.log("allowed?", isFree && other_logic);

  if (isFree && other_logic) {
    showSubscription();
    return true;
  }
  return false;
}

export { showSubscription, showSubscriptionIfFree };
