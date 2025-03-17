import _ from "lodash";
import moment from "moment";

const func_map = {
  sum: _.sumBy,
  mean: _.meanBy,
};

function calculateWeightedAverage(items) {
  let totalWeight = 0;
  let weightedSum = 0;

  if (items.length == 1) {
    return items[0].y;
  }

  for (let j = 1; j < items.length; j++) {
    const prev = items[j - 1];
    const curr = items[j];
    const weight = moment(curr.x_raw).diff(moment(prev.x_raw), "seconds");
    totalWeight += weight;
    weightedSum += ((prev.y + curr.y) * weight) / 2;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : null;
}

function aggregate(x, y, window, func) {
  // Make an interpolated point for each start of the window
  if (func === "mean") {
    const start = moment(x[0]).startOf(window);
    const end = moment(x[x.length - 1]).startOf(window);
    const current = moment(start);
    const interpolatedX = [];
    const interpolatedY = [];
    while (current.isBefore(end)) {
      interpolatedX.push(current.format());
      interpolatedY.push(null);
      current.add(1, window);
    }
    x = [...x, ...interpolatedX];
    y = [...y, ...interpolatedY];

    // Sort the arrays
    const sorted = x
      .map((value, index) => {
        return { x: value, y: y[index] };
      })
      .sort((a, b) => {
        return moment(a.x).diff(moment(b.x));
      });

    // Replace null values with the mean of the two adjacent values accounting for the x distance
    for (let i = 1; i < sorted.length - 1; i++) {
      if (sorted[i].y === null) {
        // Make linear interpolation
        const prev = sorted[i - 1];
        const next = sorted[i + 1];
        const slope =
          (next.y - prev.y) / moment(next.x).diff(moment(prev.x), "seconds");
        const distance = moment(sorted[i].x).diff(moment(prev.x), "seconds");
        sorted[i].y = prev.y + slope * distance;
      }
    }

    x = sorted.map((value) => value.x);
    y = sorted.map((value) => value.y);
  }

  const grouped = _(
    x.map((elem, index) => {
      return {
        x: moment(elem).startOf(window).format("YYYY-MM-DD HH:mm:ss"),
        x_raw: elem,
        y: y[index],
      };
    })
  )
    .groupBy("x")
    .mapValues((item) => {
      if (func === "mean") {
        return calculateWeightedAverage(item);
        // return func_map[func](item, "y");
      } else {
        return func_map[func](item, "y");
      }
    })
    .value();
  const entries = Object.entries(grouped);
  if (func === "mean") {
    return {
      x: entries.map((elem) => elem[0]),
      y: entries.map((elem) => elem[1]),
    };
  } else {
    var start = moment([2020, 1, 1]);
    var end = moment([2020, 1, 1]);
    var width = start.diff(end.add(1, window));
    return {
      x: entries.map((elem) =>
        moment(elem[0])
          .add(width / 2, "ms")
          .format("YYYY-MM-DD HH:mm:ss")
      ),
      y: entries.map((elem) => elem[1]),
      width: new Array(entries.length).fill(width),
    };
  }
}

export { aggregate };
