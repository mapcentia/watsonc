import _ from "lodash";
import moment from "moment";

const func_map = {
  sum: _.sumBy,
  mean: _.meanBy,
};

function calculateWeightedAverage(items) {
  let totalWeight = 0;
  let weightedSum = 0;

  for (let j = 1; j < items.length; j++) {
    const prev = items[j - 1];
    const curr = items[j];
    const weight = moment(curr.x).diff(moment(prev.x), "seconds");
    totalWeight += weight;
    weightedSum += ((prev.y + curr.y) * weight) / 2;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : null;
}

function aggregate(x, y, window, func) {
  const grouped = _(
    x.map((elem, index) => {
      return {
        x: moment(elem).startOf(window).format("YYYY-MM-DD HH:mm:ss.SSS"),
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
          .format("YYYY-MM-DD HH:mm:ss.SSS")
      ),
      y: entries.map((elem) => elem[1]),
      width: new Array(entries.length).fill(width),
    };
  }
}

export { aggregate };
