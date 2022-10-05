import BigNumber from "bignumber.js";

/**
 * Perform the plus and minus mathematical operations of BigNumbers
 *
 * @param {string} operation - The mathematical operation to perform
 * @param {BigNumber} bignumberFirstOperand - The first operand of the mathematical operation
 * @param {BigNumber} bignumberSecondOperand - The second operand of the mathematical operation
 * @returns {BigNumber} - The result of the operation
 * */
export function bignumberCalculator(operation:string, bignumberFirstOperand:BigNumber, bignumberSecondOperand:BigNumber):BigNumber {
    let result:BigNumber = bignumberFirstOperand;
    switch (operation) {
        case 'plus':
            result = result.plus(bignumberSecondOperand);
            return result;
        case 'minus':
            result = result.minus(bignumberSecondOperand);
            return result;
        default:
            throw Error('Bad operation');
    }
}

/**
 * Parse a Bignumber to a Number
 *
 * @param {BigNumber} bignumber - The Bignumber to be parsed to a number
 * @returns {number} - Object number parsed
 * */
export function bignumberToNumber(bignumber:BigNumber):number {
    return bignumber.toNumber();
}
