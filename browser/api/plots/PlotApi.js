import BaseApi from '../baseApi';

const downloadPlotUrl = '/api/extension/watsonc/download-plot';

export default class PlotApi {
    downloadPlot(payload) {
        const baseApi = new BaseApi();
        const response = baseApi.post(downloadPlotUrl, payload);
        return response.then((response) => {
            return response.blob();
        });
    }
}
