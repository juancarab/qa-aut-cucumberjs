/**
 * Search for requests or responses of a specific API over an array of REST Objects generated
 * in the test steps
 *
 * @param {string} api - BitGo API under test
 * @param {array} restObjectArray - REST Objects World array
 * @param {string} type - Request or Response.
 * @returns {*} restObject - The REST Object
 */
export function searchRestObject(api: string, restObjectArray: Array<any>, type: string):any {
    for (let i = 0; i < restObjectArray.length; i++) {
        const element = restObjectArray[i];
        if (element.getApi() === api) {
            if (element.getType() === type) {
                return element.getRestObject();
            }
        }
    }
}
