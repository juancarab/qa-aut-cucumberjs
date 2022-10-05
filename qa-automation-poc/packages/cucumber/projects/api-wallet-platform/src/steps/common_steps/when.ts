import {When} from "@cucumber/cucumber";
import * as apiWalletPlatformWalletUtils from "../../utils/walletUtils";
import * as apiWalletPlatformTransactionUtils from "../../utils/transactionUtils";
import * as apiWalletPlatformPreconditionUtils from "../../utils/preconditionUtils";
import {
    baseUrl,
    bearerToken,
    coin,
    cucumberBearerToken, invitedUserBearerToken, invitedUserId,
    oneUserWalletId,
    walletPassphrase
} from "../../../../../globals";
import {RestObject} from "../../../../../rest/restObject";
import {CustomWorld} from "../../../../../world";
import * as bitGoJSUtilWalletUtils from "../../../../../utils/bitGoJSUtils/walletUtils";
import * as apiWalletPlatformKeyUtils from "../../utils/keyUtils";

When('I create a {word} {word} wallet', async function (this: CustomWorld, version: string, type: string) {
    let createWalletResponse: any;
    try {
        // the only specific wallet version we support is v1. Else, we say no version is specified.
        const walletVersion = version === 'v1' ? 1 : null;

        createWalletResponse = await apiWalletPlatformWalletUtils.createWallet(
            baseUrl, coin, bearerToken, this.context.userKey, this.context.backupKey, this.context.bitgoKey,
            this.context.enterpriseId, walletVersion, type);
        this.context.walletId = createWalletResponse.data.id;
        console.log('\t\tWallet Id', this.context.walletId);

        this.restObjects.push(new RestObject('wallet', createWalletResponse, 'response'));
        let params: any = {
            'baseUrl': baseUrl,
            'coin': coin,
            'bearerToken': bearerToken,
            'walletId': this.context.walletId,
        };
        this.context.cleanup.add_delete_hot_wallet_task(params);
    } catch (e) {
        throw new Error(e);
    }
});

When('I create the keys for the wallet {string}', async function (this: CustomWorld, backupKey: string) {
    const enterpriseId: string = this.context.enterpriseId
    let keyPairForUserKey: any;
    let encryptedPrvForUserKey: any;
    let userKeyResponse: any;
    let backupKeyResponse: any;
    let bitgoKeyResponse: any;

    try {
        keyPairForUserKey = await bitGoJSUtilWalletUtils.generateKeyPair(coin, await bitGoJSUtilWalletUtils.getBitGoInstance(bearerToken, baseUrl));
        encryptedPrvForUserKey = await bitGoJSUtilWalletUtils.generateEncryptedPrv(keyPairForUserKey.prv, walletPassphrase, await bitGoJSUtilWalletUtils.getBitGoInstance(bearerToken, baseUrl));
        userKeyResponse = await apiWalletPlatformKeyUtils.createUserKey(baseUrl, coin, bearerToken, keyPairForUserKey.pub, encryptedPrvForUserKey);
        backupKeyResponse = await apiWalletPlatformKeyUtils.createBackupKeyPerTypeOfBackupKey(backupKey, baseUrl, coin, bearerToken, keyPairForUserKey, walletPassphrase);
        bitgoKeyResponse = await apiWalletPlatformKeyUtils.createBitGoKey(baseUrl, coin, bearerToken, enterpriseId);
    } catch (e) {
        throw new Error(e);
    }

    this.context.userKey = userKeyResponse.data.id;
    this.context.backupKey = backupKeyResponse.data.id;
    this.context.bitgoKey = bitgoKeyResponse.data.id;
    console.log(`\t\tUser key: ${userKeyResponse.data.id}`);
    console.log(`\t\tBackup key: ${backupKeyResponse.data.id}`);
    console.log(`\t\tBitgo key: ${bitgoKeyResponse.data.id}`);
});

When('I invite a user to the hot wallet with permissions {string}', async function (this: CustomWorld, permissions: string) {
    const walletId: string = this.context.walletId;
    let inviteUserHotWalletResponse: any;

    if (walletId === oneUserWalletId) {
        bearerToken = cucumberBearerToken;
    }

    try {
        inviteUserHotWalletResponse = await apiWalletPlatformWalletUtils.inviteUserHotWallet(baseUrl, coin, bearerToken, walletId, invitedUserId, permissions);
        this.context.shareId = inviteUserHotWalletResponse.data.id;
        this.restObjects.push(new RestObject('invite-wallet-share', inviteUserHotWalletResponse, 'response'));
        let params: any = {
            'baseUrl': baseUrl,
            'coin': coin,
            'bearerToken': bearerToken,
            'walletId': walletId,
            'invitedUserId': invitedUserId
        };
        this.context.cleanup.add_remove_invite_user_hot_wallet_task(params);
    } catch (e) {
        throw new Error(e);
    }
});

When('The user accepts the invitation to the hot wallet', async function (this: CustomWorld) {
    const keyUserId: string = this.context.userKey;
    const shareId: string = this.context.shareId;
    let getKeyResponse: any;
    let encryptedPrv: string;
    let acceptInvitationHotWalletResponse: any;

    try {
        getKeyResponse = await apiWalletPlatformKeyUtils.getKey(baseUrl, coin, bearerToken, keyUserId);
        encryptedPrv = getKeyResponse.data.encryptedPrv;
        acceptInvitationHotWalletResponse = await apiWalletPlatformWalletUtils.acceptInvitationHotWallet(baseUrl, coin, invitedUserBearerToken, shareId, encryptedPrv);
        this.restObjects.push(new RestObject('accept-wallet-share', acceptInvitationHotWalletResponse, 'response'));
    } catch (e) {
        console.log('error', e);
        throw new Error(e);
    }
});

When('I get the list of transactions of type {string}', async function (this: CustomWorld, type: string) {
    let listOfTransactionsResponse: any;
    const queryParamLimit: string = '500';
    // TODO: Move preconditions to the Given with a good refactor, creating first the wallet and then add to that wallet the preconditions transactions for the test.
    try {
        listOfTransactionsResponse = await apiWalletPlatformTransactionUtils.getListOfTransactions(baseUrl, coin,
            this.context.walletId, bearerToken, queryParamLimit, type);
        if (type == 'send') {
            this.restObjects.push(new RestObject('transactions_send', listOfTransactionsResponse, 'response'));
        } else {
            this.restObjects.push(new RestObject('transactions_receive', listOfTransactionsResponse, 'response'));
        }
    } catch (e) {
        throw new Error(e.message);
    }
});

When('I generate a new {word} recipient address for the wallet', async function (this: CustomWorld, version: string) {
    const walletId: string = this.context.walletId;
    let generateRecipientAddressResponse: any;
    const forwarderVersion = version === 'v1' ? 1 : null

    try {
        generateRecipientAddressResponse = await apiWalletPlatformWalletUtils.generateNewRecipientAddress(baseUrl, bearerToken, coin, walletId, forwarderVersion);
        this.restObjects.push(new RestObject('generate-recipient-address', generateRecipientAddressResponse, 'response'));
    } catch (e) {
        throw new Error(e.message);
    }
});

When('I check if the logs are displayed', async function (this: CustomWorld) {
    let getLogsResponse: any;

    try {
        getLogsResponse = await apiWalletPlatformPreconditionUtils.getLogs(baseUrl, bearerToken);
        this.restObjects.push(new RestObject('logs', getLogsResponse, 'response'));
        console.log('Logs: ', getLogsResponse.data.logs[0]);
    } catch (e) {
        throw new Error(e.message);
    }
});

When('I check the fee estimate for a transaction', async function (this: CustomWorld) {
    let getFeeEstimateResponse: any;

    try {
        getFeeEstimateResponse = await apiWalletPlatformTransactionUtils.getFeeEstimate(baseUrl, bearerToken, coin);
        this.restObjects.push(new RestObject('fee_estimate', getFeeEstimateResponse, 'response'));
    } catch (e) {
        throw new Error(e.message);
    }
});
