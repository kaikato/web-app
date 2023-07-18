var Promise = require("Promise");

/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/


function fetchModel(url) {
  const controller = new AbortController();
  const signal = controller.signal;
  const promise = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const getResponseObject = JSON.parse(xhr.responseText);
        resolve({ data: getResponseObject });
      } else {
        reject({ status: xhr.status, statusText: xhr.statusText });
      }
    };
    xhr.onerror = () => {
      reject({ status: xhr.status, statusText: xhr.statusText });
    };
    xhr.send();
    signal.addEventListener('abort', () => {
      xhr.abort();
      reject({ status: 0, statusText: 'Request cancelled' });
    });
  });
  promise.cancel = () => {
    controller.abort();
  };
  return promise;
}

export default fetchModel;
