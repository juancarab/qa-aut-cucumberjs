import { DataTable } from "@cucumber/cucumber";
import { Then } from "@cucumber/cucumber";
import { strict as assert } from 'assert';
import jsonpath from 'jsonpath';
import jsonschema, { ValidatorResult } from 'jsonschema';
import * as assertionUtils from '../utils/assertionUtils';
import { CustomWorld } from "../world";
import { searchRestObject } from "../utils/restObjectUtils";
import {gConfig} from "../globals";

Then('I get a {string} response with the value sent in the request with JsonPath {string} in the response with JsonPath {string}', function (this: CustomWorld, api: string, jsonPathRequest: string, jsonPathResponse: string) {
    const response: any = searchRestObject(api, this.restObjects, 'response');
    const request: any = searchRestObject(api, this.restObjects, 'request');
    const expectedValue: any[] = jsonpath.query(request, jsonPathRequest);
    const actualValue: any[] = jsonpath.query(response.data, jsonPathResponse);
    const firstMatchQuery: number = 0;
    assert.strictEqual(actualValue[firstMatchQuery], expectedValue[firstMatchQuery]);
});

Then('I get a {string} response with a JsonSchema with:', function (this: CustomWorld, api: string, docString: string) {
    const response: any = searchRestObject(api, this.restObjects, 'response');
    const actualResult: ValidatorResult = jsonschema.validate(response.data, JSON.parse(docString));
    assert.strictEqual(actualResult.valid, true, `Errors: ${actualResult.errors.toString()}`);
});

Then('I verify that the response contains the following fields', function (this: CustomWorld, dataTable: DataTable) {
    assertionUtils.responseContainsAssertion(dataTable.rows(), this.restObjects, gConfig);
});

Then('I verify that the response contains the following fields about the transaction type {string}', function (this: CustomWorld, type:string, dataTable: DataTable) {
    assertionUtils.responseContainsAssertion(dataTable.rows(), this.restObjects, gConfig);
})
