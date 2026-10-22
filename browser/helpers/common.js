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

/**
 * The SQL API returns json/jsonb columns as strings (e.g. ts_name: '["a"]').
 * Returns a copy of properties with those values parsed into arrays/objects.
 */
function parseJsonProperties(properties) {
  if (!properties) return properties;
  const parsed = { ...properties };
  Object.keys(parsed).forEach((key) => {
    const value = parsed[key];
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        parsed[key] = JSON.parse(trimmed);
      } catch (e) {
        // Not JSON, keep the original string
      }
    }
  });
  return parsed;
}

export { getNewPlotId, parseJsonProperties };
