import { RestObject } from "../../../../rest/restObject";

/**
 * Catch the insufficient balance error HTTP Response
 *
 * @param {Array} restObjectArray - REST Objects World array
 * @param {*} error - HTTP Response Error
 * @param {string} api - The name of the API that invoke the REST object
 * @param {string} type - The type - request|response
 * */
export function catchInsufficientBalanceError(restObjectArray:Array<any>, error:any, api:string, type:string):void {
    if (error.response.status === 400 && error.response.statusText === 'Bad Request' && error.response.data.name === 'InsufficientBalance') {
        restObjectArray.push(new RestObject(api, error.response, type));
    } else {
        throw new Error(error.message);
    }
}
