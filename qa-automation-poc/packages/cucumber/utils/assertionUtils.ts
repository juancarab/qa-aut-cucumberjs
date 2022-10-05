import { strict as assert } from "assert";
import * as configUtils from "./configUtils";
import jsonpath from 'jsonpath';
import { searchRestObject } from "./restObjectUtils";

/**
 * Do the assertion of the responses bases on the Table parameters
 * defined in the Gherkin and the array of Rest Objects (Request and Response)
 *
 * @param {Object[]} tableArray - The Gherkin table
 * @param {Object[]} restObjectArray - Rest Objects (Request and Response)
 * @param {Object} gConfig - This object contains the arguments (if exist) of the feature
 */
export function responseContainsAssertion(tableArray:Array<any>, restObjectArray:Array<any>, gConfig:any):void {
    tableArray.forEach(element => {
        const response:any = searchRestObject(element[0], restObjectArray, 'response');
        const jsonPath:string = element[1];
        const actualValue:any[] = jsonpath.query(response, jsonPath);
        const firstMatchQuery:number = 0;
        const valuesStates:any[] = ['signed','unconfirmed','confirmed','pendingApproval','failed','rejected','removed','replaced'];
        let expectedValue:any = prepareValueToAssertion(element[2], actualValue, gConfig);

        if (expectedValue === 'non_null') {
            assert.strictEqual(!actualValue.length, false, `The value ${expectedValue} at this JsonPath ${jsonPath} does not exist for the ${element[0]} API`);
        } else if (expectedValue === 'string') {
            assert.strictEqual(typeof (actualValue[firstMatchQuery]), expectedValue, `The type of ${expectedValue} at this JsonPath ${jsonPath} does not match for the ${element[0]} API`);
        } else if (expectedValue === 'number') {
            assert.strictEqual(typeof (actualValue[firstMatchQuery]), expectedValue, `The type of ${expectedValue} at this JsonPath ${jsonPath} does not match for the ${element[0]} API`);
        } else if (expectedValue === 'object') {
            assert.strictEqual(typeof (actualValue[firstMatchQuery]), expectedValue, `The type of ${expectedValue} at this JsonPath ${jsonPath} does not match for the ${element[0]} API`);
        } else if (expectedValue === 'valid_states') {
            assert.ok(valuesStates.includes(actualValue[firstMatchQuery]), `The state value "${actualValue[firstMatchQuery]}" at this JsonPath ${jsonPath} does not match with any of the following: ${valuesStates}`);
        } else {
            assert.strictEqual(actualValue[firstMatchQuery], expectedValue, `The value ${expectedValue} at this JsonPath ${jsonPath} does not exist for the ${element[0]} API`);
        }
    })
}

/**
 * Prepare the expected value for the assertion if it is needed.
 * If it should be a number.
 * If it should be a boolean.
 * If it is a _path.of.the.value_. The featureConfigObject will contain the value of that assertion
 *
 * @param {string} expectedValue - The expected value for the assertion to be compared
 * @param {Object[]} actualValue - The actual value of the response to be compared
 * @param {Object} gConfig - This object contains the arguments (if exist) of the feature
 * @return {*} expectedValuePrepared - The expected value prepared for the assertion
 * */
 function prepareValueToAssertion(expectedValue:string, actualValue:Array<any>, gConfig:any):any {
    let expectedValuePrepared:any;
    const firstMatchQuery:number = 0;

    // This IF condition is to parse the expected value to a number if the value of the response is a number
    if (typeof (actualValue[firstMatchQuery]) === 'number' && expectedValue !== 'non_null' && expectedValue !== 'number') {
        expectedValuePrepared = Number(expectedValue);
        return expectedValuePrepared
    // This IF condition is to parse the expected value to a boolean if the value of the response is a boolean
    } else if (typeof (actualValue[firstMatchQuery]) === 'boolean' && expectedValue !== 'non_null') {
        expectedValuePrepared = (expectedValue === 'true');
        return expectedValuePrepared;
    }
    // This IF condition is to extract the value of the GConfig variable with the JSON Path defined in the Gherkin Test Scenario
    else if ((expectedValue.charAt(0) === '_') && (expectedValue.charAt(expectedValue.length-1) === '_')) {
        expectedValuePrepared = configUtils.extractValueFromGConfigObject(expectedValue, gConfig);
        return expectedValuePrepared;
    // This ELSE is to return the expected value without do any modification
    } else {
        expectedValuePrepared = expectedValue;
        return expectedValuePrepared;
    }
}
