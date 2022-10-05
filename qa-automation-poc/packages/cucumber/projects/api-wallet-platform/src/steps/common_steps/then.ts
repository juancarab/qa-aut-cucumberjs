import {Then} from '@cucumber/cucumber';
import {baseUrl, bearerToken, coin, cucumberBearerToken, invitedUserId, oneUserWalletId} from "../../../../../globals";
import {CustomWorld} from "../../../../../world";
import {RestObject} from "../../../../../rest/restObject";
import * as apiWalletPlatformWalletUtils from "../../utils/walletUtils";
import jsonpath from "jsonpath";
import {strict as assert} from "assert";
import {getBitGoInstance, getWallet} from "../../../../../utils/bitGoJSUtils/walletUtils";

Then('I delete the wallet', async function (this: CustomWorld) {
    const walletId: string = this.context.walletId;
    try {
        await apiWalletPlatformWalletUtils.deleteWallet(baseUrl, coin, bearerToken, walletId);
        console.log(`\t\tWallet (id: ${walletId}) successfully deleted`);
    } catch (e) {
        throw new Error(e);
    }
});

Then('I verify that I can get the wallet from the enterprise wallet list', async function (this: CustomWorld) {
    let jsonpathExpected: string = 'data.wallets..["id"]';
    let enterpriseResponse: any;
    try {
        enterpriseResponse = await apiWalletPlatformWalletUtils.getListWallets(baseUrl, bearerToken, this.context.enterpriseId);
    } catch (e) {
        throw new Error(e);
    }
    let arrayOfValues: Array<string> = jsonpath.query(enterpriseResponse, jsonpathExpected);
    console.log(`\t\tWallets list: ${arrayOfValues}`);
    assert.strictEqual(arrayOfValues.includes(this.context.walletId), true, `Wallet Id (${this.context.walletId}) not found in the response`);
});

Then('I remove the user invited from the hot wallet', async function (this: CustomWorld) {
    const walletId: string = this.context.walletId;

    if (walletId === oneUserWalletId) {
        bearerToken = cucumberBearerToken;
    }

    try {
        await apiWalletPlatformWalletUtils.removeUserFromHotWallet(baseUrl, coin, bearerToken, walletId, invitedUserId);
    } catch (e) {
        throw new Error(e);
    }
});

Then('I verify that the new recipient address is generated for the new wallet', async function (this: CustomWorld) {
    const walletId: string = this.context.walletId;
    let getListAddressesResponse: any;

    try {
        await apiWalletPlatformWalletUtils.waitConfirmedNewRecipientAddress(baseUrl, bearerToken, coin, walletId);
        getListAddressesResponse = await apiWalletPlatformWalletUtils.getListAddresses(baseUrl, bearerToken, coin, walletId);
        this.restObjects.push(new RestObject('get-list-addresses', getListAddressesResponse, 'response'));
        const wallet = await getWallet(walletId, coin, await getBitGoInstance(bearerToken, undefined));
        const newForwarderAddress = wallet.receiveAddress()
        console.log(`\t\tRecipient address number 2: ${newForwarderAddress}`);
    } catch (e) {
        throw new Error(e);
    }
});
