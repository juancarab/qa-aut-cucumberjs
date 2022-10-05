import {Given} from '@cucumber/cucumber';
import {CustomWorld} from "../../../../../../world";
import {
    baseUrl,
    bearerToken,
    coin,
    enterpriseId,
    goerliFeeAddress,
    oneUserWalletId,
    recipientExternalAddress,
    recipientLowPriorityFeeAddress,
    recipientWalletId,
    recipientWalletId_v1,
    senderAddress,
    senderWalletId,
    senderWalletId_v1
} from "../../../../../../globals";
import BigNumber from "bignumber.js";
import {strict as assert} from "assert";
import * as apiWalletPlatformPreconditionUtils from "../../../utils/preconditionUtils"
import * as apiWalletPlatformEnterpriseUtils from "../../../utils/enterpriseUtils";

Given('I have a {string} {word} wallet', async function (this: CustomWorld, role: string, version: string) {
    if (version === 'v1') {
        this.context.senderWalletId = senderWalletId_v1;
        this.context.recipientWalletId = recipientWalletId_v1;
        await apiWalletPlatformPreconditionUtils.setETHWalletPerRoleInCustomWorldVariable(this.context, role, this.context.senderWalletId, this.context.recipientWalletId, baseUrl, bearerToken, coin);
    } else if (version === 'v0') {
        await apiWalletPlatformPreconditionUtils.setETHWalletPerRoleInCustomWorldVariable(this.context, role, senderWalletId, recipientWalletId, baseUrl, bearerToken, coin);
    }
});

Given('I have a {string} wallet with {word}', async function (this: CustomWorld, role: string, coinType: string) {
    if (role === 'sender' || role === 'recipient') {
        let token: string;
        if (coinType === 'gusdt_token') {
            token = 'gusdt';
        } else if (coinType === 'fixed_token') {
            token = 'fixed';
        } else {
            throw new Error('a valid value is required for the token');
        }
        await apiWalletPlatformPreconditionUtils.setETHWalletPerRoleInCustomWorldVariable(this.context, role, senderWalletId, recipientWalletId, baseUrl, bearerToken, token);
    } else {
        throw new Error('a valid value is required for the role');
    }
});

Given('The sender wallet has funds', async function (this: CustomWorld) {
    const amountToBeSend: number = 10000;
    const expectedValue: number = 1;
    let actualBalance: BigNumber = new BigNumber(this.context.senderInitialBalance);
    let expectedBalance: BigNumber = new BigNumber(amountToBeSend);

    assert.strictEqual(actualBalance.comparedTo(expectedBalance), expectedValue, `The wallet balance is less than the expected wallet balance of ${amountToBeSend}`);
});

Given('I have {string} wallet', async function (this: CustomWorld, from: string) {
    // TODO: Sender wallet id must be generated in a first preset precondition
    if (from === 'external') {
        this.context.recipientAddress = recipientExternalAddress;
        console.log(`\t\tWallet ID: ${recipientExternalAddress}`);
    } else if (from === 'bitgo') {
        this.context.walletId = senderWalletId;
        console.log(`\t\tWallet ID: ${senderWalletId}`);
    }
});

Given('I have a {string} wallet with a {string}', async function (this: CustomWorld, role: string, addressType: string) {
    // TODO: Sender wallet id must be generated in a first preset precondition
    if (role === 'recipient' && addressType === 'low_priority_fee_address') {
        await apiWalletPlatformPreconditionUtils.setETHWalletPerRoleInCustomWorldVariable(this.context, role, senderWalletId, recipientWalletId, baseUrl, bearerToken, coin);
        this.context.recipientAddress = recipientLowPriorityFeeAddress;
        console.log(`\t\tLow priority fee address: ${recipientLowPriorityFeeAddress}`);
    } else if (role === 'recipient' && addressType === 'same_address_as_sender_wallet') {
        this.context.recipientAddress = senderAddress;
        this.context.recipientWalletId = senderWalletId;
        await apiWalletPlatformPreconditionUtils.setETHWalletPerRoleInCustomWorldVariable(this.context, role, senderWalletId, this.context.recipientWalletId, baseUrl, bearerToken, coin);
        console.log(`\t\tSender as a recipient address: ${senderAddress}`);
    }
});

Given('I have a wallet with one user', async function (this: CustomWorld) {
    // TODO: Wallet id must be generated in a first preset precondition

    this.context.walletId = oneUserWalletId;
    console.log(`\t\tWallet ID: ${oneUserWalletId}`);
});

Given('I have a Goerli fee address', async function (this: CustomWorld) {
    this.context.recipientAddress = goerliFeeAddress;
    console.log(`\t\tGoerli Fee Address: ${goerliFeeAddress}`);
    let goerliInitialBalanceResponse: any;
    try {
        goerliInitialBalanceResponse = await apiWalletPlatformEnterpriseUtils.getGasTankBalance(baseUrl, coin, enterpriseId, bearerToken);
        this.context.goerliInitialBalance = goerliInitialBalanceResponse.data.balance;
        console.log('Goerli Initial Balance: ', this.context.goerliInitialBalance);
        console.log('Recipient Address: ', this.context.recipientAddress);
    } catch (e) {
        throw new Error(e.message);
    }
});
