/**
 * Abstraction class for storing plots in the key-value storage
 */

const uuid = require('uuid/v1');
const session = require('./../../session/browser/index');

class PlotManager {
    constructor() {
        this.apiUrlLocal = `/api/key-value/` + window.vidiConfig.appDatabase;
    }


    create(title) {
        return new Promise((resolve, reject) => {
            if (title) {
                let plotId = `watsonc_plot_${uuid()}`;
                let newPlot = {
                    id: plotId,
                    title,
                    userId: session.getUserName(),
                    measurements: [],
                    measurementsCachedData: {}
                };

                $.ajax({
                    url: `${this.apiUrlLocal}/${plotId}`,
                    method: 'POST',
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify(newPlot),
                    success: (body) => {
                        if (body.success) {
                            resolve(newPlot);
                        } else {
                            throw new Error(`Failed to perform operation`, body);
                        }
                    },
                    error: error => {
                        console.error(error);
                        reject(`Failed to query keyvalue API`);
                    }
                });
            } else {
                reject(`Empty plot title was provided`);
            }
        });
    }

    update(data) {
        let clone = JSON.parse(JSON.stringify(data));
        clone.measurementsCachedData = {};
        return new Promise((resolve, reject) => {
            if (!clone || !clone.id) {
                console.error(`Invalid plot was provided`, clone);
                reject(`Invalid plot was provided`);
            } else {
                $.ajax({
                    url: `${this.apiUrlLocal}/${clone.id}`,
                    method: 'PUT',
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify(clone),
                    success: (body) => {
                        if (body.success) {
                            resolve();
                        } else {
                            throw new Error(`Failed to perform operation`, body);
                        }
                    },
                    error: error => {
                        console.error(error);
                        reject(`Failed to query keyvalue API`);
                    }
                });
            }
        });
    }

    delete(plotId) {
        return new Promise((resolve, reject) => {
            if (plotId) {
                if (plotId.indexOf(`watsonc_plot_`) === 0) {
                    // Serverside (keyvalue) stored plots
                    $.ajax({
                        url: `${this.apiUrlLocal}/${plotId}`,
                        method: 'DELETE',
                        dataType: 'json',
                        contentType: 'application/json; charset=utf-8',
                        success: body => {
                            if (body.success) {
                                resolve();
                            } else {
                                throw new Error(`Failed to perform operation`, body);
                            }
                        },
                        error: error => {
                            console.error(error);
                            reject(`Failed to query keyvalue API`);
                        }
                    });
                } else {
                    // Clientside-only stored plots
                    resolve();
                }
            } else {
                reject(`Empty plot identifier was provided`);
            }
        });
    }

}

export default PlotManager;
