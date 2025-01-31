import create from "zustand";

const dashboardStoreInitialState = {
  dashboardItems: [],
  highlightedItem: null,
};

export const useDashboardStore = create((set) => ({
  ...dashboardStoreInitialState,
  setDashboardItems: (dashboardItems) => set({ dashboardItems }),
  setHighlightedItem: (highlightedItem) => set({ highlightedItem }),
}));
