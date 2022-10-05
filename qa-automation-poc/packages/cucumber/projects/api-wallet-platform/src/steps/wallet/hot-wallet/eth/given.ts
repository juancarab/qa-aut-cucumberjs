import {Given} from '@cucumber/cucumber';
import {CustomWorld} from "../../../../../../../world";
import {
    baseUrl,
    bearerToken,
    coin,
    cucumberBearerToken,
    enterpriseId,
    gasTankLimit,
    oneUserWalletId
} from "../../../../../../../globals";
import BigNumber from "bignumber.js";
import * as apiWalletPlatformEnterpriseUtils from "../../../../utils/enterpriseUtils";
import {strict as assert} from "assert";
import * as apiWalletPlatformWalletUtils from "../../../../utils/walletUtils";
import jsonpath from "jsonpath";

Given('I have an enterprise user with enough funds in the gas tank to create a new ETH wallet', async function (this: CustomWorld) {
    // TODO: Refactor needed for gConfig path to the argument
    let gasTankBalanceResponse: any;

    this.context.enterpriseId = enterpriseId;
    console.log(`\t\tEnterprise ID: ${enterpriseId}`);
    console.log(`\t\tGas Tank minimum amount for ${coin} wallet creation: ${gasTankLimit}`);

    try {
        gasTankBalanceResponse = await apiWalletPlatformEnterpriseUtils.getGasTankBalance(baseUrl, coin, enterpriseId, bearerToken);
    } catch (e) {
        throw new Error(e.message);
    }

    const expectedGasTankBalance: BigNumber = new BigNumber(gasTankLimit);
    const actualGasTankBalance: BigNumber = new BigNumber(gasTankBalanceResponse.data.balance);
    const expectedValue: number = 1;
    console.log(`\t\tGas Tank current balance ${actualGasTankBalance}`);

    assert.strictEqual(actualGasTankBalance.comparedTo(expectedGasTankBalance), expectedValue, 'The gas tank balance is less than the gas tank limit');
});

Given('I have an enterprise user with {string} wallets', async function (this: CustomWorld, tCoin: string) {
    this.context.enterpriseId = enterpriseId;
    let getListWalletsResponse: any;
    let jsonpathExpected: string = 'data.wallets.*.id';
    const queryParamLimit: string = '500';
    console.log('EnterpriseID:', this.context.enterpriseId);
    try {
        getListWalletsResponse = await apiWalletPlatformWalletUtils.getListWallets(baseUrl, bearerToken, this.context.enterpriseId, tCoin, queryParamLimit);
    } catch (e) {
        throw new Error(e);
    }
    let walletsId: Array<string> = jsonpath.query(getListWalletsResponse, jsonpathExpected);
    console.log('Wallets Id', walletsId);
    assert.strictEqual(!walletsId.length, false, `The enterprise user does not have wallets of this coin`);
    this.context.walletsId = walletsId;
});

Given('I get the userKey of the wallet', async function (this: CustomWorld) {
    const walletId: string = this.context.walletId;
    let getWalletResponse: any;

    if (walletId === oneUserWalletId) {
        bearerToken = cucumberBearerToken;
    }

    try {
        getWalletResponse = await apiWalletPlatformWalletUtils.getWallet(baseUrl, bearerToken, coin, walletId);
        this.context.userKey = getWalletResponse.data.keys[0];
    } catch (e) {
        throw new Error(e);
    }
});
