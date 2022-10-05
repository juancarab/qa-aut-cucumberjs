import { AxiosRequestConfig } from "axios";
import { BitGo } from 'bitgo';

import axiosRequest from "../../../../utils/axiosUtils";
import * as myGlobals from "../../../../globals";

/**
 * Get list of ethereum wallets from defi wallet service
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @returns {Promise} - The promise of the Get BitGo List Wallets HTTP Request
 * */
export async function getEthereumAccounts(baseUrl: string, bearerToken: string): Promise<any> {
    const url = `${baseUrl}/defi/v1/mmi/eth/wallets`;
    const config: AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}

/**
 * Get an ethereum wallet by an address from defi wallet service
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} walletAddress - The address of the wallet to retrieve information for
 * @returns {Promise} - The promise of the Get BitGo List Wallets HTTP Request
 * */
export async function getEthereumAccountByAddress(baseUrl: string, bearerToken: string, walletAddress: string): Promise<any> {
    const url = `${baseUrl}/defi/v1/mmi/eth/wallets/address/${walletAddress}`;
    const config: AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}

/**
 * Get all metamask wallet transactions from defi wallet service
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} walletAddress - The address of the wallet to retrieve information for
 * @returns {Promise} - The promise of the Get BitGo List Wallets HTTP Request
 * */
export async function getAllTransactions(baseUrl: string, bearerToken: string, walletAddress: string): Promise<any> {
    const url = `${baseUrl}/defi/v1/mmi/eth/wallets/${walletAddress}/transactions`;
    const config: AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}

/**
 * Get all metamask wallet transactions from defi wallet service in the bitgo js format
 * for signing and sending. This is the call the UI will uses to display transactions to the user.
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} walletAddress - The address of the wallet to retrieve information for
 * @returns {Promise} - The promise of the Get BitGo List Wallets HTTP Request
 * */
export async function getAllTransactionsInBitgoFormat(baseUrl: string, bearerToken: string, walletAddress: string): Promise<any> {
    const url = `${baseUrl}/defi/v1/mmi/eth/wallets/${walletAddress}/bitgoTransactions`;
    const config: AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}

/**
 * Get metamask wallet transaction by id from defi wallet service
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} custodianTxId - The id generated when creating a metamask transaction through the defi wallet service
 * @returns {Promise} - The promise of the Get BitGo List Wallets HTTP Request
 * */
export async function getTransactionById(baseUrl: string, bearerToken: string, custodianTxId: string): Promise<any> {
    const url = `${baseUrl}/defi/v1/mmi/eth/wallets/transactions/${custodianTxId}`;
    const config: AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}

/**
 * Create a metamask transaction and send to defi wallet service
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} walletAddress - The address of the wallet to retrieve information for
 * @param {string} noCallData - A flag used to remove the call data from transaction payload
 * @returns {Promise} - The promise of the Get BitGo List Wallets HTTP Request
 * */
export async function createTransaction(baseUrl: string, bearerToken: string, defiWallet: any, noCallData = false): Promise<any> {
    let body = {
        // ETH swap for UNI on goerli using uniswap
        txParams: {
            from: defiWallet.address,
            to: '',
            value: (5 * 10 ^ 15).toString(),
            gasPrice: '100',
            gasLimit: '300000',
            data: '',
        },
    };
    if (noCallData) {
        // send eth to self
        body.txParams.to = body.txParams.from;
        // remove call data
        delete (body as any).txParams.data;
    }
    const url = `${baseUrl}/defi/v1/mmi/eth/wallet/${defiWallet.custodianDetails.id}/tx/build`;
    const config: AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('post', url, body, config);
}

/**
 * Signs and sends a defi transaction.
 *
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} transaction - The defi transaction to sign and send
 * @returns {Promise} - The promise of the Get BitGo List Wallets HTTP Request
 * */
export async function sendTransaction(bearerToken: string, transaction: any): Promise<any> {
    const { coin, gEnvironment } = myGlobals
    const bitgo = new BitGo({ env: gEnvironment === 'prod' ? 'prod' : 'test' })
    bitgo.authenticateWithAccessToken({ accessToken: bearerToken });
    const ethWallet = await bitgo.coin(coin).wallets().get({ id: transaction.wallet })
    transaction['walletPassphrase'] = myGlobals.gConfig.walletPassphrase

    await bitgo.unlock({ otp: '000000' })
    return await ethWallet.send(transaction);
}

