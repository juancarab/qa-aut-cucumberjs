import {When} from '@cucumber/cucumber';
import {CustomWorld} from "../../../../../../world";
import * as apiWalletPlatformTransactionUtils from "../../../utils/transactionUtils";
import {
    baseUrl,
    bearerToken,
    coin,
    gasLimitForNonceHole,
    gasPriceForNonceHole,
    walletPassphrase
} from "../../../../../../globals";
import {RestObject} from "../../../../../../rest/restObject";
import * as bitGoJSUtilWalletUtils from "../../../../../../utils/bitGoJSUtils/walletUtils";
import * as apiWalletPlatformErrorHandlingUtils from "../../../utils/errorHandlingUtils";
import * as _ from 'lodash';
import {PrebuildAndSignTransactionOptions} from "bitgo";
import {flushToken} from "../../../utils/walletUtils";

When('I build and send the {string} transaction with an amount {string} the current balance of the sender wallet {string}', async function (this: CustomWorld, transactionType: string, amountDetail: string, sendNonce: string) {
    const amountToBeSend: string = apiWalletPlatformTransactionUtils.getAmountToBeSend(amountDetail, this.context);
    let isHop = transactionType === 'hop' || transactionType === 'hop_eip1559';
    let prebuildResponse: any;
    let gasPrice: any;
    let gasLimit: any;
    let buildResponse: any;
    let halfSignedTransaction: any;
    let sendResponse: any;
    let maxFeePerGas: any;
    let maxPriorityFeePerGas: any;

    let coinToSend = coin;
    let token: string;

    if (transactionType != 'normal' && transactionType != 'hop' && transactionType != 'eip1559' && transactionType != 'no_specified_fee_model' && transactionType != 'hop_eip1559') {
        if (transactionType === 'gusdt_token' || transactionType === 'gusdt_token_eip1559') {
            token = 'gusdt';
        } else if (transactionType === 'fixed_token' || transactionType === 'fixed_token_eip1559') {
            token = 'fixed';
        } else {
            throw new Error('a valid value is required for the token');
        }
        coinToSend = token;
    }

    this.context.amountDetail = amountDetail;

    try {
        prebuildResponse = await apiWalletPlatformTransactionUtils.prebuildETHTransaction(
            baseUrl,
            coinToSend,
            this.context.senderWalletId,
            bearerToken,
            amountToBeSend,
            this.context.recipientAddress,
            isHop,
            transactionType);

        console.log('\t\tWallet Recipient Address: ', this.context.recipientAddress);
        this.restObjects.push(new RestObject('pre-build', prebuildResponse, 'response'));

        if (sendNonce === 'generating_a_nonce_hole') {
            gasLimit = gasLimitForNonceHole;
            gasPrice = gasPriceForNonceHole;
        } else {
            gasPrice = prebuildResponse.data.gasPrice;
            gasLimit = prebuildResponse.data.gasLimit;
        }

    } catch (e) {
        apiWalletPlatformErrorHandlingUtils.catchInsufficientBalanceError(this.restObjects, e, 'pre-build', 'response');
    }

    try {
        buildResponse = await apiWalletPlatformTransactionUtils.buildETHTransaction(
            baseUrl,
            coinToSend,
            this.context.senderWalletId,
            bearerToken,
            amountToBeSend,
            this.context.recipientAddress,
            gasLimit,
            gasPrice,
            isHop,
            transactionType);

        this.restObjects.push(new RestObject('build', buildResponse, 'response'));

        if (transactionType == 'eip1559' || transactionType == 'no_specified_fee_model' || transactionType == 'hop_eip1559' || transactionType == 'fixed_token_eip1559' || transactionType == 'gusdt_token_eip1559') {
            maxFeePerGas = buildResponse.data.eip1559.maxFeePerGas;
            maxPriorityFeePerGas = buildResponse.data.eip1559.maxPriorityFeePerGas;
        }
    } catch (e) {
        apiWalletPlatformErrorHandlingUtils.catchInsufficientBalanceError(this.restObjects, e, 'build', 'response');
    }

    const params: PrebuildAndSignTransactionOptions = {
        walletPassphrase: walletPassphrase,
        recipients: [{
            address: this.context.recipientAddress,
            amount: amountToBeSend
        }],
        hop: isHop,
    };

    try {
        halfSignedTransaction = await bitGoJSUtilWalletUtils.prebuildAndSignTransaction(
            this.context.senderWalletId,
            coinToSend,
            await bitGoJSUtilWalletUtils.getBitGoInstance(bearerToken, undefined),
            params);
    } catch (e) {
        if (e.status === 400 && e.result.name === 'InsufficientBalance'
            || e.message === 'Signed hop txid does not equal actual txid' || e.result.name === 'InvalidAmount') {
            this.restObjects.push(new RestObject('sign-bitgojs', e, 'response'));
        } else {
            throw new Error(e.message);
        }
    }

    const selectParams = _.pick(params, [
        'recipients', 'numBlocks', 'feeRate', 'maxFeeRate', 'minConfirms',
        'enforceMinConfirmsForChange', 'targetWalletUnspents',
        'message', 'minValue', 'maxValue', 'sequenceId',
        'lastLedgerSequence', 'ledgerSequenceDelta',
        'noSplitChange', 'unspents', 'comment', 'otp', 'changeAddress',
        'instant', 'memo', 'type', 'trustlines', 'transferId',
        'stakingOptions'
    ]);
    const finalTxParams = _.extend({}, halfSignedTransaction, selectParams);

    if (transactionType == 'eip1559' || transactionType == 'no_specified_fee_model' || transactionType == 'hop_eip1559' || transactionType == 'fixed_token_eip1559' || transactionType == 'gusdt_token_eip1559') {

        try {
            sendResponse = await apiWalletPlatformTransactionUtils.sendETHTransaction(
                baseUrl,
                coinToSend,
                this.context.senderWalletId,
                bearerToken,
                finalTxParams,
                sendNonce,
                gasLimit,
                gasPrice,
                maxFeePerGas,
                maxPriorityFeePerGas);

            this.restObjects.push(new RestObject('send', sendResponse, 'response'));
            this.context.sentTxidToAwait = sendResponse.data.txid;
            this.context.sendingWalletOfTxToAwait = this.context.senderWalletId;
        } catch (e) {
            if (e.response.status === 400 && e.response.statusText === 'Bad Request' &&
                (e.response.data.error === 'missing signature' || e.response.data.error === 'expecting array of recipients of size 1')) {
                this.restObjects.push(new RestObject('send', e.response, 'response'));
            } else {
                throw new Error(e.message);
            }
        }
    } else {
        try {
            sendResponse = await apiWalletPlatformTransactionUtils.sendETHTransaction(
                baseUrl,
                coinToSend,
                this.context.senderWalletId,
                bearerToken,
                finalTxParams,
                sendNonce,
                gasLimit,
                gasPrice);

            this.restObjects.push(new RestObject('send', sendResponse, 'response'));
            this.context.sentTxidToAwait = sendResponse.data.txid;
            this.context.sendingWalletOfTxToAwait = this.context.senderWalletId;
        } catch (e) {
            if (e.response.status === 400 && e.response.statusText === 'Bad Request' &&
                (e.response.data.error === 'missing signature' || e.response.data.error === 'expecting array of recipients of size 1')) {
                this.restObjects.push(new RestObject('send', e.response, 'response'));
            } else {
                throw new Error(e.message);
            }
        }
    }
});

When('I flush the {word} in the recipient', async function (this: CustomWorld, coinType: string) {
    let token: string;
    if (coinType === 'gusdt_token') {
        token = 'gusdt';
    } else if (coinType === 'fixed_token') {
        token = 'fixed';
    } else {
        throw new Error('a valid value is required for the role');
    }
    try {
        const flushTokenResponse = await flushToken(baseUrl, token, bearerToken, this.context.recipientWalletId, [this.context.recipientAddress], false);
        this.restObjects.push(new RestObject('flush', flushTokenResponse, 'response'));
    } catch (e) {
        throw new Error(e.message);
    }
});
