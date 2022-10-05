/** Class representing a REST Object (Axios Request, Axios Response, BitGoJS SDK Response, etc) */
export class RestObject {
    api:string;
    restObject:any;
    type:string;

    /**
     * Create a RestObject
     * @param {string} api - The name of the API that invoke the REST object
     * @param {*} restObject - The REST Object stored
     * @param {string} type - The type - request|response
     * */
    constructor(api:string, restObject:any, type:string) {
        this.api = api;
        this.restObject = restObject;
        this.type = type;
    }

    /**
     * Get the api value
     * @returns {string} api
     * */
    getApi():string {
        return this.api;
    }

    /**
     * Get the restObject value
     * @returns {*} restObject
     * */
    getRestObject():any {
        return this.restObject;
    }

    /**
     * Get the type value
     * @returns {string} type
     * */
    getType():string {
        return this.type;
    }
}
