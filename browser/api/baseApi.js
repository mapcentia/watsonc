
export default class BaseApi {

    get(url = "") {
        try {

            // Default options are marked with *
            return fetch(url, {
                method: 'GET', // *GET, POST, PUT, DELETE, etc.
                // mode: 'cors', // no-cors, *cors, same-origin
                // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                // credentials: 'same-origin', // include, *same-origin, omit
                // headers: {
                //   'Content-Type': 'application/json; charset=utf-8'
                // },
                // redirect: 'follow', // manual, *follow, error
                // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                // body: JSON.stringify(query) // body data type must match "Content-Type" header
              });


        } catch (error) {
            // console.log("BaseApi error", error);
            return "";
        }
    }

    post(url = "", body = "") {

        try {

            // Default options are marked with *
            return fetch(url, {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                // mode: 'cors', // no-cors, *cors, same-origin
                // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                // credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                  'Content-Type': 'application/json; charset=utf-8'
                },
                // redirect: 'follow', // manual, *follow, error
                // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                // body: JSON.stringify(query) // body data type must match "Content-Type" header
                body: JSON.stringify(body)
              });

        } catch (error) {
            // console.log("BaseApi error", error);
            return "";
        }
    }
}
