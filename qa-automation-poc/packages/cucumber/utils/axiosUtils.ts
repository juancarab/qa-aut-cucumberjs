import axios, { AxiosRequestConfig } from 'axios';

/**
 * Return the axios functions defined in the file
 *
 * @param {string} method - The HTTP Method to perform
 * @param {string} url - The URL of the REST API
 * @param {*} data - Request body (if it exist)
 * @param {AxiosRequestConfig} config - Object with HTTP REST settings for the request (for example: headers)
 * @returns {Promise} - The promise of the HTTP Request
 * */
export default async function axiosRequest(method:string, url:string, data?:any, config?:AxiosRequestConfig):Promise<any> {
    switch (method.toLowerCase()) {
        case 'get':
            return getData(url, config);
        case 'post':
            return postData(url, data, config);
        case 'patch':
            return patchData(url, data, config);
        case 'delete':
            return deleteData(url, config);
        case 'put':
            return putData(url, data, config);
        default:
            console.error('The request method entered is not correct');
            break;
    }
}

/**
 * Perform a GET request
 *
 * @param {string} url - The URL of the REST API
 * @param {AxiosRequestConfig} config - Object with HTTP REST settings for the request (for example: headers)
 * @returns {Promise} - The promise of the HTTP Request
 * */
async function getData(url:string, config?:any):Promise<any> {
    try {
        return axios.get(url, config);
    } catch (e) {
        console.error('exception occurred while GET', e.message);
        throw e;
    }
}

/**
 * Perform a POST request
 *
 * @param {string} url - The URL of the REST API
 * @param {*} data - Request body (if it exist)
 * @param {AxiosRequestConfig} config - Object with HTTP REST settings for the request (for example: headers)
 * @returns {Promise} - The promise of the HTTP Request
 * */
async function postData(url:string, data?:any, config?:AxiosRequestConfig):Promise<any> {
    try {
        return axios.post(url, data, config);
    } catch (e) {
        console.error('exception occurred while POST', e.message);
        throw e;
    }
}

/**
 * Perform a PATCH request
 *
 * @param {string} url - The URL of the REST API
 * @param {*} data - Request body (if it exist)
 * @param {AxiosRequestConfig} config - Object with HTTP REST settings for the request (for example: headers)
 * @returns {Promise} - The promise of the HTTP Request
 * */
async function patchData(url:string, data?:any, config?:AxiosRequestConfig):Promise<any> {
    try {
        return axios.patch(url, data, config);
    } catch (e) {
        console.error('exception occurred while PATCH', e.message);
        throw e;
    }
}

/**
 * Perform a DELETE request
 *
 * @param {string} url - The URL of the REST API
 * @param {AxiosRequestConfig} config - Object with HTTP REST settings for the request (for example: headers)
 * @returns {Promise} - The promise of the HTTP Request
 * */
async function deleteData(url:string, config?:AxiosRequestConfig):Promise<any> {
    try {
        return axios.delete(url, config);
    } catch (e) {
        console.error('exception occurred while DELETE', e.message);
        throw e;
    }
}

/**
 * Perform a PUT request
 *
 * @param {string} url - The URL of the REST API
 * @param {*} data - Request body (if it exist)
 * @param {AxiosRequestConfig} config - Object with HTTP REST settings for the request (for example: headers)
 * @returns {Promise} - The promise of the HTTP Request
 * */
 async function putData(url:string, data?:any, config?:AxiosRequestConfig):Promise<any> {
    try {
        return axios.put(url, data, config);
    } catch (e) {
        console.error('exception occurred while PUT', e.message);
        throw e;
    }
}
