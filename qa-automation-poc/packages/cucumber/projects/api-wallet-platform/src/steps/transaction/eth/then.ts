import {Then} from '@cucumber/cucumber';
import {CustomWorld} from "../../../../../../world";
import BigNumber from "bignumber.js";
import * as apiWalletPlatformWalletUtils from "../../../utils/walletUtils";
import * as apiWalletPlatformAssertionUtils from "../../../utils/assertionUtils";
import {baseUrl, bearerToken, coin, enterpriseId} from "../../../../../../globals";
import * as bignumberUtils from "../../../../../../utils/bignumberUtils";
import * as apiWalletPlatformTransactionUtils from "../../../utils/transactionUtils";
import * as apiWalletPlatformEnterpriseUtils from "../../../utils/enterpriseUtils";

Then('I verify that the {word} {word} balance of the {string} ETH wallet was updated properly', async function (this: CustomWorld, coinType: string, balanceType: string, role: string) {
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
    const walletId: string = apiWalletPlatformAssertionUtils.getWalletIdPerRole(role, this.context);
    const initialBalance: BigNumber = apiWalletPlatformAssertionUtils.getInitialBalancePerRole(role, this.context, balanceType);
    await apiWalletPlatformTransactionUtils.waitTransactionToBeConfirmed(this.context.sentTxidToAwait, this.context.sendingWalletOfTxToAwait, baseUrl, coinOfInterest, bearerToken);
    let finalBalance: BigNumber = await apiWalletPlatformWalletUtils.getWalletBalance(baseUrl, bearerToken, coinOfInterest, walletId, balanceType);
    console.log(`\t\tFinal ${role} wallet balance: ${bignumberUtils.bignumberToNumber(finalBalance)}`);
    apiWalletPlatformAssertionUtils.assertDifferenceBalancePerRole(this.context.amountDetail, role, apiWalletPlatformAssertionUtils.getDifferenceBalancePerRole(role, initialBalance, finalBalance),this.context);
});

Then('I check the balance of the goerli fee address', async function (this: CustomWorld) {
    let finalBalanceResponse: any;
    try {
        finalBalanceResponse = await apiWalletPlatformEnterpriseUtils.getGasTankBalance(baseUrl, coin, enterpriseId, bearerToken);
    } catch (e) {
        throw new Error(e.message);
    }
    console.log('Goerli Final Balance:', finalBalanceResponse.data.balance);
});
