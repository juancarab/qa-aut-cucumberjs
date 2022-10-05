import {Given} from '@cucumber/cucumber';
import {CustomWorld} from "../../../../../world";
import {
    bearerToken,
    coin,
    enterpriseId,
    gConfig,
    gEnvironment,
    loadConfig,
    usingDefaultCoin
} from "../../../../../globals";
import {strict as assert} from "assert";
import {setupSuiteParameters} from "../../../../../config";

Given('I have an enterprise user to create a new wallet', async function (this: CustomWorld) {
    this.context.enterpriseId = enterpriseId;
    let actualValue: string = enterpriseId;
    assert.notEqual(actualValue, undefined, 'Unavailable Enterprise ID');
    assert.notEqual(actualValue, "", 'Empty Enterprise ID');
});

Given('I have a valid user in bitgo', async function (this: CustomWorld) {
    this.context.bearerToken = bearerToken;
    let actualValue = bearerToken;
    console.log('Bearer Token: ', this.context.bearerToken);
    assert.notEqual(actualValue, undefined, 'Unavailable Bearer Token');
    assert.notEqual(actualValue, "", 'Empty Bearer Token');
});

Given('I will test the coin {string}', async function (this: CustomWorld, testingCoin: string) {
    if (testingCoin != coin || (testingCoin == coin && usingDefaultCoin)) {
        if (usingDefaultCoin) {
            usingDefaultCoin = false;
        }
        gConfig = setupSuiteParameters(gEnvironment, testingCoin);
        loadConfig(testingCoin);
    }
});
