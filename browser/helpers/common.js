function getNewPlotId(plots) {
  let newId = plots.filter((plot) => plot.id !== undefined).length + 1;
  if (newId > 1) {
    let existingPlot = plots.find((plot) => plot.id == `plot_${newId}`);
    while (existingPlot != null) {
      newId += 1;
      existingPlot = plots.find((plot) => plot.id == `plot_${newId}`);
    }
  }
  return newId;
}

export { getNewPlotId };
