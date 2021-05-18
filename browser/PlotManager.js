/**
 * Abstraction class for storing plots in the key-value storage
 */

const uuid = require('uuid/v1');
const session = require('./../../session/browser/index');

class PlotManager {
    constructor() {
        this.apiUrlLocal = `/api/key-value/` + window.vidiConfig.appDatabase;
    }

    dehydratePlots(plots) {
        plots.map((plot, index) => {
            if (typeof plots[index]?.measurements === "object") {
                delete plots[index].measurements;
            }
            if (typeof plots[index]?.measurementsCachedData === "object") {
                delete plots[index].measurementsCachedData;
            }
        });

        return plots;
    }

    hydratePlotsFromIds(plots) {
        if (typeof plots === "undefined") return;
        plots = plots.filter(e => !!e.id)
        return new Promise((methodResolve, methodReject) => {
            let hydrationPromises = [];
            plots.map((plot, index) => {
                let hydrateRequest = new Promise((resolve, reject) => {
                    $.ajax({
                        url: `${this.apiUrlLocal}/${plot.id}`,
                        method: 'GET',
                        dataType: 'json',
                        contentType: 'application/json; charset=utf-8',
                        success: (body) => {
                            if (body.success) {
                                resolve(body.data);
                            } else {
                                throw new Error(`Failed to perform operation`, body);
                            }
                        },
                        error: error => {
                            console.error(error);
                            reject(`Failed to query keyvalue API`);
                        }
                    });
                });

                hydrationPromises.push(hydrateRequest);
            });

            Promise.all(hydrationPromises).then(results => {
                plots.map((item, index) => {
                    results.map((dataItem) => {
                        if (dataItem.key === item.id && typeof dataItem.value !== "undefined") {
                            plots[index] = JSON.parse(dataItem.value);
                            delete plots[index].measurementsCachedData;
                        }
                    });
                });

                plots.map((item, index) => {
                    if (typeof item === "object" && (`measurements` in item === false || !item.measurements
                        || `measurementsCachedData` in item === false || !item.measurementsCachedData)) {
                        console.warn(`The ${item.id} plot was not properly populated`, item);
                    }
                });
                // Filter non objects. A non object can occur when time a project time series is deleted from from key value store
                plots = plots.filter((item)=>{
                    return (typeof item === 'object')
                });
                methodResolve(plots);
            }).catch(methodReject);
        });
    }

    hydratePlotsFromUser() {
        return new Promise((methodResolve, methodReject) => {
            let hydrationPromises = [];
            let userId = session.getUserName();
            $.ajax({
                url: `${this.apiUrlLocal}/?like=watsonc_plot_%&filter='{userId}'='${userId}'`,
                method: 'GET',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                success: (body) => {
                    if (body.success) {
                        let results = [];
                        body.data.map(item => {
                            results.push(item);
                        });
                        let plots = [];
                        results.map((item, index) => {
                            plots[index] = JSON.parse(item.value);
                            delete plots[index].measurementsCachedData;
                        });

                        plots.map((item, index) => {
                            if (`measurements` in item === false || !item.measurements
                                || `measurementsCachedData` in item === false || !item.measurementsCachedData) {
                                console.warn(`The ${item.id} plot was not properly populated`, item);
                            }
                        });

                        methodResolve(plots);


                    } else {
                        throw new Error(`Failed to perform operation`, body);
                    }
                },
                error: error => {
                    console.error(error);
                    reject(`Failed to query keyvalue API`);
                }
            });

        });
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
