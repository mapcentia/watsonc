import BaseApi from '../baseApi';

const projectsUrl = '/api/state-snapshots/jupiter?ownerOnly=true'

export default class ProjectsApi {
    getProjects() {
        const baseApi = new BaseApi();
        const response = baseApi.get(projectsUrl);
        return response;
    }
}
