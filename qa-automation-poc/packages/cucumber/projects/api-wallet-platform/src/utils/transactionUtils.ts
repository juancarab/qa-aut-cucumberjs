import * as syncUtils from "../../../../utils/syncUtils";
import * as objectUtils from "../../../../utils/objectUtils";
import {searchRestObject} from "../../../../utils/restObjectUtils";
import {AxiosRequestConfig} from "axios";
import axiosRequest from "../../../../utils/axiosUtils";
import jsonpath from "jsonpath";
import BigNumber from "bignumber.js";

/**
 * Get the smart contract deployment transaction after wallet was created
 *
 * @param {Array} restObjectArray - REST Objects World array
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @returns {Promise} - The promise of the smart contract deployment transaction
 * */

export async function getSmartContractDeploymentTransactionAfterWalletCreation(restObjectArray: Array<any>, baseUrl: string, coin: string, bearerToken: string): Promise<any> {
    const firstMatchElement = 0;
    const walletCreationResponse: any = searchRestObject('wallet', restObjectArray, 'response');
    const walletId: string = walletCreationResponse.data.id;
    const jsonpathExpected: string = 'data.transfers[0].state';
    let actualValue: any[];
    let aux: number = 0; //This variable is to prevent a infinite cycle executions

    do {
        aux++;
        console.log('\t\tWaiting for internal transfer to be made ...');
        syncUtils.sleep(4500);
        let listTransfersResponse: any;

        try {
            listTransfersResponse = await getListOfTransactions(baseUrl, coin, walletId, bearerToken);
        } catch (e) {
            throw new Error(e);
        }

        actualValue = jsonpath.query(listTransfersResponse, jsonpathExpected);
        if (aux === 70) {
            throw new Error('Max number of attempts reached');
        }
    } while (objectUtils.isEmpty(actualValue));

    return actualValue[firstMatchElement];
}

/**
 * Waits and gets the smart contract deployment transaction after a forwarder address was created and deployed
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} walletId - The Id of the wallet to search in
 * @param {string} forwarderAddress - The forwarder address to be deployed
 *
 * @returns {Promise} - The promise of the smart contract deployment transaction
 * */
export async function getSmartContractDeploymentTransactionForForwarderCreation(
    baseUrl: string,
    coin: string,
    bearerToken: string,
    walletId: string,
    forwarderAddress: string
): Promise<any> {
    // extracts transactions related to Address Creation
    const jsonpathFilterAddressCreation = 'data.transfers[?(@.comment==\'Address Creation\')]';
    // among those transactions, we filter in the one that is related to forwarderAddress
    const jsonpathFilterForwarderAddress = `entries[?(@.address=='${forwarderAddress}')]`;
    // the remaining set of transactions should be the forwarder creation contract for the specified forwarder address

    let aux: number = 0; // This variable is to prevent a infinite cycle executions
    let actualValue: any[];

    do {
        aux++;
        console.log('\t\tWaiting for internal transfer to be made ...');
        syncUtils.sleep(4500);
        let listTransfersResponse: any;

        try {
            listTransfersResponse = await getListOfTransactions(baseUrl, coin, walletId, bearerToken);
        } catch (e) {
            throw new Error(e);
        }

        // search for address creation transactions
        actualValue = jsonpath.query(listTransfersResponse, jsonpathFilterAddressCreation);
        // filter out transactions unrelated to specified forwarder address
        actualValue = actualValue.filter((creationTransaction) => {
            return jsonpath.query(creationTransaction, jsonpathFilterForwarderAddress).length > 0;
        });

        if (aux === 70) {
            throw new Error('Max number of attempts reached');
        }
    } while (objectUtils.isEmpty(actualValue));

    return actualValue[0];
}

/**
 * Get List of Transactions
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} walletId - The ID of the wallet
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} [limit] - (Query param) Maximum number of transactions to return
 * @param {string} [type] - The type of the transaction (send/receive)
 * @returns {Promise} - The promise of the Get BitGo list transactions HTTP Request
 * */
export async function getListOfTransactions(baseUrl: string, coin: string, walletId: string, bearerToken: string, limit?: string, type?: string): Promise<any> {
    let url: string = `${baseUrl}/api/v2/${coin}/wallet/${walletId}/transfer`;
    let params: string[] = [];

    if (limit) {
        params.push(`limit=${limit}`);
    }

    if (type) {
        params.push(`type=${type}`);
    }

    const stringParams: string = params.join('&');

    if (stringParams) {
        url = url.concat('?', stringParams);
    }

    const config: AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}

/**
 * Do a POST to build API for ETH pre-build transaction
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} senderWalletId - The ID of the sender wallet
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} amountToBeSend - The amount to send to the recipient wallet
 * @param {string} recipientAddress - The address of the recipient wallet
 * @param {boolean} isHop - Whether the send transaction should be a hop transaction
 * @param {string} transactionType - The type of the transaction (normal, hop, eip1559, token, token eip1559)
 * @returns {Promise} - The promise of the Post BitGo Pre-build HTTP Request
 * */
export async function prebuildETHTransaction(baseUrl: string, coin: string, senderWalletId: string, bearerToken: string, amountToBeSend: string, recipientAddress: string, isHop: boolean, transactionType: string): Promise<any> {
    const url: string = `${baseUrl}/api/v2/${coin}/wallet/${senderWalletId}/tx/build`;
    const data: any = {
        'instant': false,
        'numBlocks': 2,
        'recipients': [
            {
                'amount': amountToBeSend,
                'address': recipientAddress,
                'recipientLabel': null
            }
        ],
        'hop': isHop,
    };

    if (transactionType == 'eip1559' || transactionType == 'hop_eip1559' || transactionType == 'fixed_token_eip1559' || transactionType == 'gusdt_token_eip1559') {
        data.eip1559 = {
            'maxFeePerGas': 12000000000,
            'maxPriorityFeePerGas': 5000000000
        };
    }

    if (transactionType == 'no_specified_fee_model') {
        data.eip1559 = {
            'maxFeePerGas': undefined,
            'maxPriorityFeePerGas': undefined
        };
    }

    const config: AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('POST', url, data, config);
}

/**
 * Do a POST to build API for ETH build transaction
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} senderWalletId - The ID of the sender wallet
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} amountToBeSend - The amount to send to the recipient wallet
 * @param {string} recipientAddress - The address of the recipient wallet
 * @param {string} gasLimit - The gas limit of the transaction
 * @param {string} gasPrice - The gas price of the transaction
 * @param {boolean} isHop - Whether the send transaction should be a hop transaction
 * @param {string} transactionType - The type of the transaction (normal, hop, eip1559, token, token eip1559)
 * @returns {Promise} - The promise of the Post BitGo Build HTTP Request
 * */
export async function buildETHTransaction(baseUrl: string, coin: string, senderWalletId: string, bearerToken: string, amountToBeSend: string, recipientAddress: string, gasLimit: string, gasPrice: string, isHop: boolean, transactionType: string): Promise<any> {
    const url: string = `${baseUrl}/api/v2/${coin}/wallet/${senderWalletId}/tx/build`;
    const data: any = {
        'gasLimit': gasLimit,
        'gasPrice': gasPrice,
        'instant': false,
        'recipients': [
            {
                'address': recipientAddress,
                'amount': amountToBeSend
            }
        ],
        'hop': isHop,
    };

    if (transactionType == 'eip1559' || transactionType == 'hop_eip1559' || transactionType == 'fixed_token_eip1559' || transactionType == 'gusdt_token_eip1559') {
        data.eip1559 = {
            'maxFeePerGas': 12000000000,
            'maxPriorityFeePerGas': 5000000000
        };
    }

    if (transactionType == 'no_specified_fee_model') {
        data.eip1559 = {
            'maxFeePerGas': undefined,
            'maxPriorityFeePerGas': undefined
        };
    }

    const config: AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('POST', url, data, config);
}

/**
 * Do a POST to send API for ETH send transaction
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} senderWalletId - The ID of the sender wallet
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {any} data - The object containing the all the data and parameters for the transaction to be sent
 * @param {string} [gasLimit] - Gas limit for nonce hole transaction
 * @param {string} [gasPrice] - Gas price for nonce hole transaction
 * @param {string} [sendNonce] - Define if the transaction is nonce type from step
 * @param {string} [maxFeePerGas] - Max total gasPrice for EIP1559 transactions
 * @param {string} [maxPriorityFeePerGas] - Max priority tip price for EIP1559 transactions
 * @returns {Promise} - The promise of the Post BitGo Send HTTP Request
 * */
export async function sendETHTransaction(baseUrl: string, coin: string, senderWalletId: string, bearerToken: string, data: any, sendNonce: string, gasLimit?: string, gasPrice?: string, maxFeePerGas?: string, maxPriorityFeePerGas?: string): Promise<any> {
    const url: string = `${baseUrl}/api/v2/${coin}/wallet/${senderWalletId}/tx/send`;

    if (maxFeePerGas && maxPriorityFeePerGas) {
        data.halfSigned["eip1559"] = {
            'maxFeePerGas': maxFeePerGas,
            'maxPriorityFeePerGas': maxPriorityFeePerGas
        };
    }

    if (sendNonce === 'generating_a_nonce_hole') {
        data.halfSigned.gasPrice = gasPrice
        data.halfSigned.gasLimit = gasLimit
    }

    const config: AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('POST', url, data, config);
}

/**
 * Get amount to be send in the transaction per test scenario
 *
 * @param {string} amountDetail - The detail of the amount of the test scenario (For example: less_than)
 * @returns {string} - The amount to be send in the transaction
 * */
export function getAmountToBeSend(amountDetail: string, context: any): string {
    let actualBalance: BigNumber = new BigNumber(context.senderInitialBalance);
    if (amountDetail === 'less_than') { // randomly chosen number used to perform send transaction (it represents 0.000000000000010000 ETH)
        let newActualBalanceLessThan = actualBalance.dividedToIntegerBy(1000).toString()
        console.log("\t\t Amount to be send ", newActualBalanceLessThan)
        return newActualBalanceLessThan;
    } else if (amountDetail === 'zero') {
        return '0';
    } else if (amountDetail === 'equal_to') {
        let equalBalance = actualBalance.toString()
        console.log("\t\t Amount to be send ", equalBalance)
        return equalBalance;
    } else if (amountDetail === 'more_than') {
        let newActualBalanceMoreThan = actualBalance.plus(10).toString()
        console.log("\t\t Amount to be send ", newActualBalanceMoreThan)
        return newActualBalanceMoreThan; // this number was defined to be sure that sending amount will be always greater than current balance
    } else if (amountDetail === 'smallest_greater_than_zero') {
        return '1'; // this value matches with 'smallest greater than zero' amount (0.000000000000000001 ETH) supported by Bitgo UI
    } else if (amountDetail === 'non_allowed_amount') {
        return '000000000000000000001'; // this value matches with a 'non allowed amount' (0.000000000000000000001 ETH) supported by Bitgo UI
    } else {
        throw new Error('Bad amount argument given');
    }
}

/**
 * Wait until the transaction made appears in the list of transactions and the state is confirmed
 *
 * @param {Array} txid - The transaction id to wait to confirm
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * */
export async function waitTransactionToBeConfirmed(txid: string, walletId: string, baseUrl: string, coin: string, bearerToken: string): Promise<void> {
    const firstMatchElement = 0;
    const stateExpected: string = 'confirmed';
    const queryParamLimit: string = '500';
    let myTransfer: any[];
    let currentTransState: any[];
    let aux: number = 0; //This variable is to prevent a infinite cycle executions

    console.log(`\t\ttransaction ID: ${txid}`);
    do {
        aux++;
        console.log(`\t\tWaiting for list of transfers to be updated ...attempt#${aux}`);
        syncUtils.sleep(15000);
        let listTransfersResponse: any;

        try {
            listTransfersResponse = await getListOfTransactions(baseUrl, coin, walletId, bearerToken, queryParamLimit);
        } catch (e) {
            console.log('Error', e);
            throw new Error(e);
        }

        // TODO: Find a better way to handle this. Review it for Sprint 27
        if (aux === 70) {
            throw new Error('Max number of attempts reached');
        }

        myTransfer = jsonpath.query(listTransfersResponse, `$.data.transfers[?(@.txid=="${txid}")]`);
        currentTransState = jsonpath.query(myTransfer, `$..state`);
        console.log(`\t\ttransaction status: ${currentTransState}`);

    } while (currentTransState[firstMatchElement] !== stateExpected);
}

/**
 * Get the fee estimate of a transaction for a specific coin
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @returns {Promise} - The promise of the Get BitGo Wallet HTTP Request
 * */
export async function getFeeEstimate(baseUrl: string, bearerToken: string, coin: string): Promise<any> {
    const url: string = `${baseUrl}/api/v2/${coin}/tx/fee`;
    const config: AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}
