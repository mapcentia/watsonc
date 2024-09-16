import SubscriptionDialogue from "../components/SubscriptionDialogue";
import { setDashboardMode } from "../redux/actions";
var ReactDOM = require("react-dom");
const config = require("../../../../config/config.js");

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
      <SubscriptionDialogue
        onCloseButtonClick={onCloseButtonClick}
        session={session}
      />,
      document.getElementById(subscriptionDialoguePlaceholderId)
    );
    $("#" + subscriptionDialoguePlaceholderId).modal("show");
  };

  openAbonnement();
}

function showSubscriptionIfFree(other_logic = true) {
  const isFree = session.getProperties()?.["license"] !== "premium";
  const email = session?.getEmail();

  const premiumEmailExtensions =
    JSON.parse(
      JSON.stringify(config?.extensionConfig?.watsonc?.premiumEmailExtensions)
    ) || [];

  if (premiumEmailExtensions.length > 0 && email) {
    const emailDomain = email.split("@")[1];
    premiumEmailExtensions.forEach((domain) => {
      const regex = new RegExp(domain.replace(/\./g, "\\."), "i");
      if (regex.test(emailDomain)) {
        return false;
      }
    });
  }

  if (isFree && other_logic) {
    showSubscription();
    return true;
  }
  return false;
}

export { showSubscription, showSubscriptionIfFree };
