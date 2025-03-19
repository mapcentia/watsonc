import create from "zustand";

const dashboardStoreInitialState = {
  dashboardItems: [],
  highlightedItem: null,
};

export const useDashboardStore = create((set) => ({
  ...dashboardStoreInitialState,
  setDashboardItems: (dashboardItems) => set({ dashboardItems }),
  setHighlightedItem: (highlightedItem) => set({ highlightedItem }),
  geologicalLayerChecked: false,
  setGeologicalLayerChecked: (geologicalLayerChecked) =>
    set({ geologicalLayerChecked }),
}));

//måske en function til at lave en "getPlots" istedet for at bruge den i dashboardcomponent?
//hvad vil være den bedste måde at gøre det på?
