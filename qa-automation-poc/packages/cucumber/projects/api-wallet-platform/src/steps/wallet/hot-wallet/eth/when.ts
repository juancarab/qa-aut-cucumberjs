import {When} from '@cucumber/cucumber';
import * as bitGoJSUtilWalletUtils from "../../../../../../../utils/bitGoJSUtils/walletUtils";
import {
    baseUrl,
    bearerToken,
    coin,
    recipientAddress,
    walletPassphrase,
    whitelistId
} from "../../../../../../../globals";
import {CustomWorld} from "../../../../../../../world";
import * as apiWalletPlatformKeyUtils from "../../../../utils/keyUtils";
import * as defiWalletServiceUtils from "../../../../utils/defiWalletUtils";
import {RestObject} from "../../../../../../../rest/restObject";
import * as apiWalletPlatformWalletUtils from "../../../../utils/walletUtils";

When('I get the wallet information', async function (this: CustomWorld) {
    let getWalletResponse: any;

    try {
        getWalletResponse = await apiWalletPlatformWalletUtils.getWallet(baseUrl, bearerToken, coin, this.context.walletId);
        this.restObjects.push(new RestObject('wallet', getWalletResponse, 'response'));
        console.log(`\t\tGeneral Balance: ${getWalletResponse.data.balanceString}`);
    } catch (e) {
        throw new Error(e.message);
    }
});

When('I get the general balance of the wallets', async function (this: CustomWorld) {
    let generalBalanceAllWalletsResponse: any;
    const allTokensQueryParam: string = 'false';

    try {
        if (coin == 'talgo') {
            generalBalanceAllWalletsResponse = await apiWalletPlatformWalletUtils.getGeneralTotalBalance(baseUrl, bearerToken, coin, this.context.enterpriseId, allTokensQueryParam);
            this.restObjects.push(new RestObject('wallet', generalBalanceAllWalletsResponse, 'response'));
            
            console.log(generalBalanceAllWalletsResponse.data.balances[0]);
            this.context.generalBalanceAllWalletsResponse = generalBalanceAllWalletsResponse.data.balances[0].balanceString;
        } else {
            generalBalanceAllWalletsResponse = await apiWalletPlatformWalletUtils.getTotalBalanceForCoin(baseUrl, bearerToken, coin, this.context.enterpriseId, allTokensQueryParam);
            this.restObjects.push(new RestObject('wallet', generalBalanceAllWalletsResponse, 'response'));
            this.context.generalBalanceAllWalletsResponse = generalBalanceAllWalletsResponse.data.balanceString;
        }
        
    } catch (e) {
        throw new Error(e.message);
    }
});

When('I add a new whitelist policy rule to the hot wallet', async function (this: CustomWorld) {
    const walletId: string = this.context.walletId;
    this.context.recipientWalletId = recipientAddress;
    this.context.whitelistId = whitelistId;
    let addPolicyRuleResponse: any;

    try {
        addPolicyRuleResponse = await apiWalletPlatformWalletUtils.addWhitelistPolicyRule(baseUrl, bearerToken, coin, walletId, whitelistId, recipientAddress);
        this.restObjects.push(new RestObject('add-whitelist-policy-rule', addPolicyRuleResponse, 'response'));
        if (addPolicyRuleResponse.data.pendingApproval) {
            this.context.pendingApprovalId = addPolicyRuleResponse.data.pendingApproval.id;
            console.log('Pending Approval Id:', this.context.pendingApprovalId);
        }
    } catch (e) {
        throw new Error(e.message);
    }
});

When('I remove the whitelist policy rule added from the hot wallet', async function (this: CustomWorld) {
    const walletId: string = this.context.walletId;
    const recipientAddress: string = this.context.recipientWalletId;
    const whitelistId: string = this.context.whitelistId;
    let deletePolicyRuleResponse: any;

    try {
        deletePolicyRuleResponse = await apiWalletPlatformWalletUtils.removeWhitelistPolicyRule(baseUrl, coin, bearerToken, walletId, whitelistId, recipientAddress);
        this.restObjects.push(new RestObject('delete-whitelist-policy-rule', deletePolicyRuleResponse, 'response'));
    } catch (e) {
        throw new Error(e.message);
    }
});

When('I add a new wallet webhook type {string} to the wallet', async function (this: CustomWorld, walletWebhookType: string) {
    let addWalletWebhookResponse: any;
    this.context.walletWebhookType = walletWebhookType;
    const webhookUrl: string = 'http://your.server.com/webhook'; // We decide to use this URL in order to simulate a webhook without have a server working
    this.context.webhookUrl = webhookUrl;

    try {
        addWalletWebhookResponse = await apiWalletPlatformWalletUtils.addWalletWebhook(baseUrl, coin, bearerToken, this.context.walletId, walletWebhookType, webhookUrl);
        this.restObjects.push(new RestObject('add-wallet-webhook', addWalletWebhookResponse, 'response'));
        this.context.walletWebhookId = addWalletWebhookResponse.data.id;
    } catch (e) {
        throw new Error(e.message);
    }
});

When('I change the password of the hot wallet', async function (this: CustomWorld) {
    const keyUserId: string = this.context.userKey;
    let getKeyResponse: any;
    let changePasswordResponse: any;
    let oldEncryptedPrv: string;
    let newKeyPair: any;
    let newEncryptedPrv: string;

    try {
        getKeyResponse = await apiWalletPlatformKeyUtils.getKey(baseUrl, coin, bearerToken, keyUserId);
        oldEncryptedPrv = getKeyResponse.data.encryptedPrv;
        console.log(`\t\tOld encrypted private key of the wallet: ${oldEncryptedPrv}`);
        await apiWalletPlatformWalletUtils.performOTPVerification(baseUrl, bearerToken);
        newKeyPair = await bitGoJSUtilWalletUtils.generateKeyPair(coin, await bitGoJSUtilWalletUtils.getBitGoInstance(bearerToken, baseUrl));
        newEncryptedPrv = await bitGoJSUtilWalletUtils.generateEncryptedPrv(newKeyPair.prv, walletPassphrase, await bitGoJSUtilWalletUtils.getBitGoInstance(bearerToken, baseUrl));
        console.log(`\t\tNew encrypted private key of the wallet: ${newEncryptedPrv}`);
        changePasswordResponse = await apiWalletPlatformKeyUtils.changePassword(baseUrl, coin, bearerToken, keyUserId, newEncryptedPrv);
        this.restObjects.push(new RestObject('change-password', changePasswordResponse, 'response'));
    } catch (e) {
        throw new Error(e.message);
    }
});

When('Metamask gets the wallet information', async function (this: CustomWorld) {
    try {
        const getWalletsResponse = await defiWalletServiceUtils.getEthereumAccounts(baseUrl, bearerToken);
        console.log(getWalletsResponse.data.data);
        this.context.defiWallets = getWalletsResponse.data.data;
        this.restObjects.push(new RestObject('defi', getWalletsResponse, 'response'));
    } catch (e) {
        throw new Error(e.message);
    }
});
