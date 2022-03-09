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

  return {
    x: Object.entries(grouped).map((elem) => elem[0]),
    y: Object.entries(grouped).map((elem) => elem[1]),
  };
}

export { aggregate };
