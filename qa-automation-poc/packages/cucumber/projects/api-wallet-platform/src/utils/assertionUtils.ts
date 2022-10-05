import {strict as assert} from "assert";
import BigNumber from "bignumber.js";
import * as bignumberUtils from "../../../../utils/bignumberUtils";

/**
 * Assert the difference of wallet balance per role
 *
 * @param {string} amountDetail - The detail of the amount of the test scenario (For example: less_than)
 * @param {string} role - The role of the wallet in the test scenario (sender or recipient)
 * @param {number} differenceBalance - The difference between initial and final balance
 * */
export function assertDifferenceBalancePerRole(amountDetail: string, role: string, differenceBalance: number, context: any): void {
    let amountToCompare: number
    if (amountDetail === 'less_than' || amountDetail === 'equal_to') {
        let actualBalance: BigNumber = new BigNumber(context.senderInitialBalance);
        let newActualBalanceLessThan = actualBalance.dividedToIntegerBy(1000).toString()
        amountToCompare = parseInt(newActualBalanceLessThan);
        if (role === 'sender') {
            assert.strictEqual((differenceBalance >= amountToCompare), true,
                `The difference between the final and initial balance (${differenceBalance}) is not more than or equal to the amount set`);
        } else if (role === 'recipient') {
            assert.strictEqual(differenceBalance, amountToCompare,
                `The difference between the final and initial balance (${differenceBalance}) is not equal to the amount sent (${amountToCompare})`);
        } else {
            throw new Error('Bad role given');
        }
    } else if (amountDetail === 'zero') {
        amountToCompare = 0;
        assert.strictEqual(differenceBalance, amountToCompare,
            `The difference between the initial and final balance (${differenceBalance}) is not equal to zero`);

    } else if (amountDetail === 'smallest_greater_than_zero' || amountDetail === 'non_allowed_amount') {
        amountToCompare = 1;
        if (role === 'sender') {
            assert.strictEqual((differenceBalance >= amountToCompare), true,
                `The difference between the final and initial balance (${differenceBalance}) is not more than or equal to the amount set`);
        } else if (role === 'recipient') {
            assert.strictEqual(differenceBalance, amountToCompare,
                `The difference between the final and initial balance (${differenceBalance}) is not equal to the amount sent (${amountToCompare})`);
        } else {
            throw new Error('Bad role given');
        }

    } else {
        throw new Error('Bad amount detail given');
    }
}

/**
 * Get the difference between initial and final balance per role
 *
 * @param {string} role - The role of the wallet in the test scenario (sender or recipient)
 * @param {BigNumber} initialBalance - The initial wallet balance
 * @param {BigNumber} finalBalance - The final wallet balance
 * @returns {number} The difference between initial and final balance
 * */
export function getDifferenceBalancePerRole(role: string, initialBalance: BigNumber, finalBalance: BigNumber): number {
    if (role === 'sender') {
        return bignumberUtils.bignumberToNumber(bignumberUtils.bignumberCalculator('minus', initialBalance, finalBalance));
    } else if (role === 'recipient') {
        return bignumberUtils.bignumberToNumber(bignumberUtils.bignumberCalculator('minus', finalBalance, initialBalance));
    } else {
        throw new Error('Bad role given');
    }
}

/**
 * Get Wallet ID per role from the context World variable
 *
 * @param {string} role - The role of the wallet in the test scenario (sender or recipient)
 * @param {*} context - The Context World variable
 * @returns {string} - The sender or recipient wallet ID
 * */
export function getWalletIdPerRole(role: string, context: any): string {
    if (role === 'sender') {
        return context.senderWalletId;
    } else if (role === 'recipient') {
        return context.recipientWalletId;
    } else {
        throw new Error('Bad role given');
    }
}

/**
 * Get Initial wallet balance per role from the context World variable
 *
 * @param {string} role - The role of the wallet in the test scenario (sender or recipient)
 * @param {*} context - The Context World variable
 * @returns {BigNumber} - The sender or recipient initial wallet balance
 * */
export function getInitialBalancePerRole(role: string, context: any, balanceType: string): BigNumber {
    if (role === 'sender') {
        switch (balanceType) {
            case "confirmed":
                return new BigNumber(context.senderInitialConfirmedBalance);
            case "spendable":
                return new BigNumber(context.senderInitialSpendableBalance);
            default: // total
                return new BigNumber(context.senderInitialBalance);
        }
    } else if (role === 'recipient') {
        switch (balanceType) {
            case "confirmed":
                return new BigNumber(context.recipientInitialConfirmedBalance);
            case "spendable":
                return new BigNumber(context.recipientInitialSpendableBalance);
            default: // total
                return new BigNumber(context.recipientInitialBalance);
        }
    } else {
        throw new Error('Bad role given');
    }
}
