import {Then} from "@cucumber/cucumber";
import {baseUrl, bearerToken, coin, whitelistId} from "../../../../../../../globals";
import {CustomWorld} from "../../../../../../../world";
import {RestObject} from "../../../../../../../rest/restObject";
import {strict as assert} from "assert";
import * as apiWalletPlatformTransactionUtils from "../../../../utils/transactionUtils";
import * as apiWalletPlatformWalletUtils from "../../../../utils/walletUtils";
import {getListAddresses} from "../../../../utils/walletUtils";
import jsonpath from "jsonpath";
import {searchRestObject} from "../../../../../../../utils/restObjectUtils";
import {setETHWalletPerRoleInCustomWorldVariable} from "../../../../utils/preconditionUtils";
import BigNumber from "bignumber.js"
import {getBitGoInstance, getWallet} from "../../../../../../../utils/bitGoJSUtils/walletUtils";
import * as defiWalletServiceUtils from "../../../../utils/defiWalletUtils";
import {rewritingJsonCoinFile} from "../../../../../../../utils/writeAndReadFileFromTxtUtils";

Then('I verify that the smart contract deployment transaction is done for the new ETH {word}', async function (this: CustomWorld, newObject: string) {
    let actualValue: any, expectedValue: string;
    if (newObject === 'wallet') {
        actualValue = await apiWalletPlatformTransactionUtils.getSmartContractDeploymentTransactionAfterWalletCreation(this.restObjects, baseUrl, coin, bearerToken);
        expectedValue = 'confirmed';
    } else if (newObject === 'forwarder') {
        const forwarderCreationResponse: any = searchRestObject('generate-recipient-address', this.restObjects, 'response');
        let transaction: any = await apiWalletPlatformTransactionUtils.getSmartContractDeploymentTransactionForForwarderCreation(
            baseUrl, coin, bearerToken, this.context.walletId, forwarderCreationResponse.data.address
        )
        actualValue = transaction.comment;
        expectedValue = 'Address Creation';
    } else {
        throw new Error('Bad ETH Object given: expecting wallet of forwarder');
    }
    assert.strictEqual(actualValue, expectedValue, `Internal transfer for ${newObject} not made`);
});

Then('I verify that the general balance is the summation of each balance per wallet', async function (this: CustomWorld) {
    const generalBalance: string = this.context.generalBalanceAllWalletsResponse;
    let getWalletBalanceResponse: any;
    let sumOfBalances: BigNumber = new BigNumber(0);

    for (let walletId of this.context.walletsId) {
        try {
            getWalletBalanceResponse = await apiWalletPlatformWalletUtils.getWalletBalance(baseUrl, bearerToken, coin, walletId, 'total');
            sumOfBalances = sumOfBalances.plus(getWalletBalanceResponse);
        } catch (e) {
            throw new Error(e);
        }
    }
    console.log('Sum of balances of all wallets', sumOfBalances);

    assert.strictEqual(generalBalance, sumOfBalances.toString(), `The general balance (${generalBalance}) is not the sum of all the balances of all wallets (${sumOfBalances})`);

    console.log(`\t\tThe general balance (${generalBalance}) is the sum of all balances of all wallets (${sumOfBalances})`);
});

Then('I verify that the new whitelist policy rule is added to the hot wallet', async function (this: CustomWorld) {
    const firstMatchElement = 0;
    const walletId: string = this.context.walletId;
    const jsonPathExpectedWhitelistPolicyRuleId = 'data.admin.policy.rules[0].id';
    const jsonPathExpectedWhitelistPolicyRuleLabel = 'data.admin.policy.rules[0].condition.entries[0].metaData.label';
    const expectedWhitelistPolicyRuleId: string = whitelistId;
    const expectedWhitelistPolicyRuleLabel: string = 'PolicyRuleTest';
    let getWalletResponse: any;

    try {
        getWalletResponse = await apiWalletPlatformWalletUtils.getWallet(baseUrl, bearerToken, coin, walletId);
    } catch (e) {
        throw new Error(e);
    }

    let actualWhitelistPolicyRuleId = jsonpath.query(getWalletResponse, jsonPathExpectedWhitelistPolicyRuleId);
    let actualWhitelistPolicyRuleLabel = jsonpath.query(getWalletResponse, jsonPathExpectedWhitelistPolicyRuleLabel);

    assert.strictEqual(actualWhitelistPolicyRuleId[firstMatchElement], expectedWhitelistPolicyRuleId, `Whitelist Policy Rule ID does not match with ${expectedWhitelistPolicyRuleId}. Actual result: ${actualWhitelistPolicyRuleId[firstMatchElement]}`);
    assert.strictEqual(actualWhitelistPolicyRuleLabel[firstMatchElement], expectedWhitelistPolicyRuleLabel, `Whitelist Policy Rule Label does not match with ${expectedWhitelistPolicyRuleLabel}. Actual result: ${actualWhitelistPolicyRuleLabel[firstMatchElement]}`);
});

Then('I verify that I can simulate the webhook added', async function (this: CustomWorld) {
    const walletWebhookId: string = this.context.walletWebhookId;
    let simulateWalletWebhookResponse: any;

    try {
        if (this.context.walletWebhookType === 'pendingapproval') {
            simulateWalletWebhookResponse = await apiWalletPlatformWalletUtils.simulateWalletWebhookByType(baseUrl, coin, bearerToken, this.context.walletId, walletWebhookId, this.context.walletWebhookType, this.context.pendingApprovalId);
        } else {
            simulateWalletWebhookResponse = await apiWalletPlatformWalletUtils.simulateWalletWebhookByType(baseUrl, coin, bearerToken, this.context.walletId, walletWebhookId, this.context.walletWebhookType);
        }
        this.restObjects.push(new RestObject('simulate-wallet-webhook', simulateWalletWebhookResponse, 'response'));
        this.context.webhookId = simulateWalletWebhookResponse.data.webhookNotifications[0].webhook;
    } catch (e) {
        throw new Error(e);
    }
});

Then('I delete the wallet webhook from the wallet', async function (this: CustomWorld) {
    const walletId: string = this.context.walletId;
    const walletWebhookType: string = this.context.walletWebhookType;
    const webhookUrl: string = this.context.webhookUrl;
    const webhookId: string = this.context.webhookId;
    let removeWalletWebhookResponse: any;
    try {
        removeWalletWebhookResponse = await apiWalletPlatformWalletUtils.removeWalletWebhook(baseUrl, coin, bearerToken, walletId, walletWebhookType, webhookUrl, webhookId);
        this.restObjects.push(new RestObject('delete-wallet-webhook', removeWalletWebhookResponse, 'response'));
        console.log(`\t\tWallet webhook successfully deleted`);
    } catch (e) {
        throw new Error(e);
    }
});

Then('I set {word} recipient to be {string}', async function (this: CustomWorld, coinType: string, targetRecipient: string) {
    let coinOfInterest: string = coin;
    let token: string;
    if (coinType != 'coin') {
        if (coinType === 'gusdt_token') {
            token = 'gusdt';
        } else if (coinType === 'fixed_token') {
            token = 'fixed';
        } else {
            throw new Error('a valid value is required for the token');
        }
        coinOfInterest = token;
    }
    if (targetRecipient === 'newly created wallet') {
        const walletCreationResponse: any = searchRestObject('wallet', this.restObjects, 'response');
        await setETHWalletPerRoleInCustomWorldVariable(this.context, 'recipient', 'placeholder',
            walletCreationResponse.data.id, baseUrl, bearerToken, coinOfInterest);
    } else if (targetRecipient === 'newly created address') {
        // find id wallet id of the newly created forwarder
        const forwarderCreationResponse: any = searchRestObject('generate-recipient-address', this.restObjects, 'response');
        await setETHWalletPerRoleInCustomWorldVariable(this.context, 'recipient', 'placeholder',
            forwarderCreationResponse.data.wallet, baseUrl, bearerToken, coinOfInterest);
        console.log('\t\tNew Recipient Address: ', this.context.recipientAddress);
    } else if (targetRecipient === 'newly created forwarder address') {
        // find id wallet id of the newly created forwarder
        const forwarderCreationResponse: any = searchRestObject('generate-recipient-address', this.restObjects, 'response');
        await setETHWalletPerRoleInCustomWorldVariable(this.context, 'recipient', 'placeholder',
            forwarderCreationResponse.data.wallet, baseUrl, bearerToken, coinOfInterest);
        // override the recipientAddress to be that of the forwarder rather than the base address
        const wallet = await getWallet(forwarderCreationResponse.data.wallet, coinOfInterest, await getBitGoInstance(bearerToken, undefined));
        const newForwarderAddress = wallet.receiveAddress()
        this.context.recipientAddress = newForwarderAddress;
        console.log('\t\tNew Recipient Address: ', newForwarderAddress);
    } else {
        throw new Error('Bad recipient given');
    }
});

Then('I swap {word} sender with recipient', async function (this: CustomWorld, coinType: string) {
    let coinOfInterest: string = coin;
    let token: string;
    if (coinType != 'coin') {
        if (coinType === 'gusdt_token') {
            token = 'gusdt';
        } else if (coinType === 'fixed_token') {
            token = 'fixed';
        } else {
            throw new Error('token must be specified when sending tokens but none specified');
        }
        coinOfInterest = token;
    }
    const tempSenderWalletId = this.context.senderWalletId;
    await setETHWalletPerRoleInCustomWorldVariable(this.context, 'sender', this.context.recipientWalletId,
        'placeholder', baseUrl, bearerToken, coinOfInterest);
    await setETHWalletPerRoleInCustomWorldVariable(this.context, 'recipient', 'placeholder',
        tempSenderWalletId, baseUrl, bearerToken, coinOfInterest);
});

Then('I set wallet to be {string}', async function (this: CustomWorld, targetWallet: string) {
    if (targetWallet === 'recipient') {
        this.context.walletId = this.context.recipientWalletId;
        console.log('\t\tRecipient Wallet Id: ', this.context.walletId);
    } else if (targetWallet === 'new recipient') {
        this.context.recipientWalletId = this.context.walletId;
        console.log('\t\tRecipient Wallet Id: ', this.context.walletId);
    } else if (targetWallet === 'sender') {
        this.context.senderWalletId = this.context.walletId;
        console.log('\t\tSender Wallet Id: ', this.context.walletId);
    } else if (targetWallet === 'one user') {
        this.context.oneUserWalletId = this.context.walletId;
        console.log('\t\tOne User Wallet Id: ', this.context.walletId);
    } else {
        throw new Error('Bad target wallet given');
    }
});

Then('I verify that v1 ETH forwarder is initialized and {word} deployed', async function (this: CustomWorld, isDeployedString: string) {
    // determine if the forwarder should be deployed or not
    let shouldBeDeployed: boolean;
    if (isDeployedString === 'is') {
        shouldBeDeployed = true;
    } else if (isDeployedString === 'isn\'t' || isDeployedString === 'isnt') {
        shouldBeDeployed = false;
    } else {
        throw new Error('Expected "is" or "isn\'t" between the words "and" and "deployed"');
    }

    // grab id of the forwarder that was just created
    const forwarderCreationResponse: any = searchRestObject('generate-recipient-address', this.restObjects, 'response');
    const createdForwarderId = forwarderCreationResponse.data.id;

    // find created forwarder in list of addresses of current wallet
    const queryParamLimit: string = '500';
    const getListAddressesResponse = await getListAddresses(baseUrl, bearerToken, coin, this.context.walletId, queryParamLimit);
    let createdForwarder: any = null;
    getListAddressesResponse.data.addresses.forEach((address: any) => {
        if (address.id === createdForwarderId) {
            createdForwarder = address;
        }
    });
    if (createdForwarder === null) {
        throw new Error(`Forwarder ${createdForwarderId} not found within wallet ${this.context.walletId}`);
    }
    // verify that the forwarder is v1, and check the pendingDeployment field
    assert.strictEqual(createdForwarder.coinSpecific.forwarderVersion, 1, `Expected forwarder ${createdForwarderId} version to be 1`);
    assert.strictEqual(createdForwarder.coinSpecific.pendingDeployment, !shouldBeDeployed, `Expected forwarder ${createdForwarderId} 'pendingDeployment' to be ${!shouldBeDeployed}`);
});

Then('Metamask gets the wallet information by an address', async function (this: CustomWorld) {
    try {
        const walletAddress = this.context.defiWallets[0].address;
        const getWalletsResponse = await defiWalletServiceUtils.getEthereumAccountByAddress(baseUrl, bearerToken, walletAddress);
        console.log(getWalletsResponse.data.data);
        this.restObjects.push(new RestObject('defi', getWalletsResponse, 'response'));
    } catch (e) {
        throw new Error(e.message);
    }
});

Then('I save this information in the coin json file', async function (this: CustomWorld) {
    try {
        rewritingJsonCoinFile(this.context.senderWalletId, this.context.recipientWalletId, this.context.oneUserWalletId);
    } catch (e) {
        throw new Error(e.message);
    }
});

Then('I verify metamask transactions can be retrieved', async function (this:CustomWorld) {
    try {
        const walletAddress = this.context.defiWallets[0].address;
        const getTxsResponse = await defiWalletServiceUtils.getAllTransactions(baseUrl, bearerToken, walletAddress);
        const expectedTxs = getTxsResponse.data.data.filter((tx: any) =>
            tx.custodianTransactionId === this.context.createdTransaction.custodianTransactionId)
        assert.strictEqual(expectedTxs.length, 1);
    } catch (e) {
        console.log(e)
        throw new Error(e.message);
    }
});

Then('I verify a metamask transaction can be retrieved by its id', async function (this:CustomWorld) {
    try {
        const custodianTxId = this.context.createdTransaction.custodianTransactionId;
        const getTxsResponse = await defiWalletServiceUtils.getTransactionById(baseUrl, bearerToken, custodianTxId);

        const expectedTxs = getTxsResponse.data.data.filter((tx: any) => tx.custodianTransactionId === custodianTxId)
        assert.strictEqual(expectedTxs.length, 1);

        this.restObjects = [] // clear cache
        this.restObjects.push(new RestObject('defi', getTxsResponse, 'response'));
    } catch (e) {
        console.log(e)
        throw new Error(e.message);
    }
});

Then('I create a metamask transaction', async function (this:CustomWorld) {
    try {
        const defiWallet = this.context.defiWallets[0];
        console.log(defiWallet)
        const createTxResponse = await defiWalletServiceUtils.createTransaction(baseUrl, bearerToken, defiWallet);
        console.log(createTxResponse.data.data);
        this.context.createdTransaction = createTxResponse.data.data;
        this.restObjects.push(new RestObject('defi', createTxResponse, 'response'));
    } catch (e) {
        console.log(e)
        throw new Error(e.message);
    }
});

Then('I create a metamask transaction with no call data', async function (this:CustomWorld) {
    try {
        const defiWallet = this.context.defiWallets[0];
        console.log(defiWallet)
        const createTxResponse = await defiWalletServiceUtils.createTransaction(baseUrl, bearerToken, defiWallet, true);
        console.log(createTxResponse.data.data);
        this.context.createdTransaction = createTxResponse.data.data;
        this.restObjects.push(new RestObject('defi', createTxResponse, 'response'));
    } catch (e) {
        console.log(e)
        throw new Error(e.message);
    }
});

Then('Bitgo gets the metamask transaction to sign', async function (this:CustomWorld) {
    try {
        const walletAddress = this.context.defiWallets[0].address;
        const getTxsResponse = await defiWalletServiceUtils.getAllTransactionsInBitgoFormat(baseUrl, bearerToken, walletAddress);
        const expectedTxs = getTxsResponse.data.data.filter((tx: any) =>
            tx.custodianTransactionId === this.context.createdTransaction.custodianTransactionId)
        assert.strictEqual(expectedTxs.length, 1);

        this.context.transactionToSend = expectedTxs[0]
    } catch (e) {
        console.log(e)
        throw new Error(e.message);
    }
});

Then('I approve the metamask transaction', async function (this:CustomWorld) {
    try {
        const transaction = this.context.transactionToSend;
        const sendResponse = await defiWalletServiceUtils.sendTransaction(bearerToken, transaction);
        console.log(sendResponse)
        if(!transaction.data){
            assert.strictEqual(sendResponse.status, 'signed')
        } else {
            assert.strictEqual(sendResponse.pendingApproval.approvalsRequired, 1)
        }
    } catch (e) {
        console.log(e)
        throw new Error(e.message);
    }
});
