import _ from "lodash";
import moment from "moment";

const func_map = {
  mean: _.meanBy,
  sum: _.sumBy,
};

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
      return func_map[func](item, "y");
    })
    .value();

  var start = moment([2020, 1, 1]);
  var end = moment([2020, 1, 1]);
  var width = start.diff(end.add(1, window));
  const entries = Object.entries(grouped);
  if (func === "mean") {
    return {
      x: entries.map((elem) => elem[0]),
      y: entries.map((elem) => elem[1]),
    };
  } else {
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
