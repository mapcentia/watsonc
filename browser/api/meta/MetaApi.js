import BaseApi from '../baseApi';

const metaUrl = '/api/meta/jupiter/';

export default class MetaApi {
    fetchMetaData(parameter) {
        const baseApi = new BaseApi();
        const url = metaUrl + parameter;
        return baseApi.get(url);
    }
}
