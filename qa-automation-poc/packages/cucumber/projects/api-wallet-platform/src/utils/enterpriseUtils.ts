import { AxiosRequestConfig } from "axios";
import axiosRequest from "../../../../utils/axiosUtils";

/**
 * Get the Gas Tank balance
 * 
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} enterpriseId - The ID of the enterprise user
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @return {Promise} - The promise of the Get FeeAddressBalance HTTP Request
 * */
export async function getGasTankBalance(baseUrl:string, coin:string, enterpriseId:string, bearerToken:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/enterprise/${enterpriseId}/feeAddressBalance`;
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}

/**
 * Get Enterprise
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} enterpriseId - The ID of the enterprise user
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @returns {Promise} - The promise of the Get Enterprise HTTP Request
 * */
export async function getEnterprise(baseUrl:string, enterpriseId:string, bearerToken:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/enterprise/${enterpriseId}`;
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}
