import BaseApi from "../baseApi";

const metaUrl = "/api/meta/jupiter/";

export default class MetaApi {
  getMetaData(parameter) {
    const baseApi = new BaseApi();
    const url = metaUrl + parameter;
    return baseApi
      .get(url)
      .then((response) => {
        return response.json();
      })
      .then((results) => {
        return results.data
          .filter((item) => item.f_table_schema == parameter)
          .map((item) => {
            let value = `${item.f_table_schema}.${item.f_table_name}`;
            if (item.f_table_title == "Jupiter boringer") {
              value = "v:system.all";
            }
            return {
              label: item.f_table_title,
              group: item.layergroup,
              value: value,
              privileges: JSON.parse(item.privileges),
            };
          });
      });
  }
}
