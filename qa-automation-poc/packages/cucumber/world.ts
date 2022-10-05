import { setWorldConstructor, setDefaultTimeout } from "@cucumber/cucumber";
import * as myGlobals from './globals';
import { RestObject } from "./rest/restObject";

export class CustomWorld {
    public context:any;
    public restObjects:Array<RestObject>;

    constructor() {
        this.context = {};
        this.restObjects = [];
    };
}

setWorldConstructor(CustomWorld);

setDefaultTimeout(myGlobals.gDefaultTimeout);
