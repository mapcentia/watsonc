import React from "react";

const ProjectContext = React.createContext({
  activePlots: [],
  /**TODO: Deprecated */
  setActivePlots: (plots) => {
    console.log("Setting active plots");
  },
  activeProfiles: [],
  setActiveProfiles: (profiles) => {},
});

export default ProjectContext;
