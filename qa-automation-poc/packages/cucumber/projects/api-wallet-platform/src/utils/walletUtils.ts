import * as randomGeneratorUtils from "../../../../utils/randomGeneratorUtils";
import { AxiosRequestConfig } from "axios";
import axiosRequest from "../../../../utils/axiosUtils";
import BigNumber from "bignumber.js";
import * as apiWalletPlatformTransactionUtils from "../utils/transactionUtils"
import * as syncUtils from "../../../../utils/syncUtils";
import * as objectUtils from "../../../../utils/objectUtils";
import jsonpath from "jsonpath";
import * as _ from "lodash";
import * as bitGoJSUtilWalletUtils from "../../../../utils/bitGoJSUtils/walletUtils";
import {BitGo} from "bitgo";
import * as myGlobals from "../../../../globals";

const adminBearerToken:string|undefined = myGlobals.gAdminBearerToken;

/**
 * Create a Hot wallet
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} userKey - The User key of the wallet
 * @param {string} backupKey - The Backup key of the wallet
 * @param {string} bitgoKey - The BitGo key of the wallet
 * @param {string} [enterpriseId] - The ID of the enterprise user
 * @param {number | null} [walletVersion] - version of the wallet
 * @param {string} [type] - The type of the wallet we want to create
 * @returns {Promise} - The promise of the Post BitGo Wallet HTTP Request
 * */
export async function createWallet(baseUrl:string, coin:string, bearerToken:string, userKey:string, backupKey:string, bitgoKey:string, enterpriseId?:string, walletVersion?: number | null, type?:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/wallet`;
    let data:any = {
        'label': `Wallet${randomGeneratorUtils.randomString(6)}Test`
    };

    if (type == 'hot') {
        data.keys = [userKey, backupKey, bitgoKey];
        data.m = 2;
        data.n = 3;
        data.isCold = false;
    } else if (type == 'cold') {
        data.keys = [userKey, backupKey, bitgoKey];
        data.m = 2;
        data.n = 3;
        data.isCold = true;
    } else if (type == 'custodial') {
        data.isCold = true;
        data.type = type;
    }

    console.log(`\t\tCreating wallet: ${data.label}`);

    if (enterpriseId) {
        data.enterprise = enterpriseId;
    }
    if (walletVersion && _.isNumber(walletVersion)) {
        data.walletVersion = walletVersion;
    }

    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('POST', url, data, config);
}

/**
 * Get list of wallets
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} [enterpriseId] - The ID of the enterprise user
 * @param {string} [coin] - The identifier of the coin
 * @param {string} [limit] - Maximum number of wallets to be listed
 * @returns {Promise} - The promise of the Get BitGo List Wallets HTTP Request
 * */
export async function getListWallets(baseUrl:string, bearerToken:string, enterpriseId?:string, coin?:string, limit?:string):Promise<any> {
    let url:string = `${baseUrl}/api/v2/wallets`;
    let params:string[] = [];

    if (enterpriseId) {
        params.push(`enterprise=${enterpriseId}`);
    }

    if (coin) {
        params.push(`coin=${coin}`);
    }

    if (limit) {
        params.push(`limit=${limit}`);
    }

    const stringParams:string = params.join('&');

    if (stringParams) {
        url = url.concat('?', stringParams);
    }
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}

/**
 * Get Wallet
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} walletId - The ID of the wallet
 * @returns {Promise} - The promise of the Get BitGo Wallet HTTP Request
 * */
export async function getWallet(baseUrl:string, bearerToken:string, coin:string, walletId:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/wallet/${walletId}`;
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}

/**
 * Invite user to a Hot wallet
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} walletId - The id of the wallet
 * @param {string} userId - The id of the user
 * @param {string} permissions - Permissions added to the user invited to the wallet
 * @returns {Promise} - The promise of the Post BitGo Invite user to the wallet HTTP Request
 * */
 export async function inviteUserHotWallet(baseUrl:string, coin:string, bearerToken:string, walletId:string, userId:string, permissions:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/wallet/${walletId}/share`;
    const data:any = {
        'user': `${userId}`,
        'permissions': `${permissions}`,
        'message': 'Come join my wallet',
        'keychain': {}
    };
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('POST', url, data, config);
}

/**
 * Get the wallet balance
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} walletId - The ID of the wallet
 * @returns {Promise<BigNumber>} - The promise of the updated wallet balance
 * */
export async function getWalletBalance(baseUrl:string, bearerToken:string, coin:string, walletId:string, balanceType:string):Promise<BigNumber> {
    let finalBalance:BigNumber;
    let getBitGoWalletResponse:any;

    try {
        getBitGoWalletResponse = await getWallet(baseUrl, bearerToken, coin, walletId);
        switch (balanceType) {
            case "confirmed":
                finalBalance = new BigNumber(getBitGoWalletResponse.data.confirmedBalanceString);
                break;
            case "spendable":
                finalBalance = new BigNumber(getBitGoWalletResponse.data.spendableBalanceString);
                break;
            default: // total
                finalBalance = new BigNumber(getBitGoWalletResponse.data.balanceString);
        }
    } catch (e) {
        throw new Error(e.message);
    }

    return finalBalance;
}

/**
 * Accept an invitation to a Hot wallet
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} shareId - The id of the share process
 * @param {string} encryptedPrv - The encrypted private key of the key pair
 * @returns {Promise} - The promise of the Post BitGo Accept invitation to the wallet HTTP Request
 * */
export async function acceptInvitationHotWallet(baseUrl:string, coin:string, bearerToken:string, shareId:string, encryptedPrv:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/walletshare/${shareId}`;
    const data:any = {
        'walletShareId': `${shareId}`,
        'state': 'accepted',
        'message': 'Come join my wallet',
        'encryptedPrv': `${encryptedPrv}`
    };
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('POST', url, data, config);
}

/**
 * Remove a user from Hot wallet
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} walletId - The id of the wallet
 * @param {string} userId - The id of the user
 * @returns {Promise} - The promise of the Delete BitGo User from the wallet HTTP Request
 * */
export async function removeUserFromHotWallet(baseUrl:string, coin:string, bearerToken:string, walletId:string, userId:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/wallet/${walletId}/user/${userId}`;
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('DELETE', url, {}, config);
}

/**
 * Delete a Hot wallet
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} walletId - The id of the wallet
 * @returns {Promise} - The promise of the Delete BitGo Hot Wallet HTTP Request
 * */
export async function deleteWallet(baseUrl:string, coin:string, bearerToken:string, walletId:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/wallet/${walletId}`;
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('DELETE', url, {}, config);
}

/**
 * Get the total balance of all the wallets of a specific coin
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} [enterpriseId] - The ID of the enterprise user
 * @param {string} [allTokens] - Include data for all subtokens
 * @returns {Promise} - The promise of the Get BitGo Wallet HTTP Request
 * */
export async function getTotalBalanceForCoin(baseUrl:string, bearerToken:string, coin:string, enterpriseId?:string, allTokens?:string):Promise<any> {
    let url:string = `${baseUrl}/api/v2/${coin}/wallet/balances`;
    let params:string[] = [];

    if (enterpriseId) {
        params.push(`enterprise=${enterpriseId}`);
    }

    if (allTokens) {
        params.push(`allTokens=${allTokens}`);
    }

    const stringParams:string = params.join('&');

    if (stringParams) {
        url = url.concat('?', stringParams);
    }

    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}

/**
 * Get the total balance of all the wallets
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} [coin] - The identifier of the coin
 * @param {string} [enterpriseId] - The ID of the enterprise user
 * @param {string} [allTokens] - Include data for all subtokens
 * @returns {Promise} - The promise of the Get BitGo Wallet HTTP Request
 * */
export async function getGeneralTotalBalance(baseUrl:string, bearerToken:string, coin?:string, enterpriseId?:string, allTokens?:string):Promise<any> {
    let url:string = `${baseUrl}/api/v2/wallet/balances`;
    let params:string[] = [];

    if (enterpriseId) {
        params.push(`enterprise=${enterpriseId}`);
    }

    if (allTokens) {
        params.push(`allTokens=${allTokens}`);
    }

    if (coin) {
        params.push(`coin=${coin}`);
    }

    const stringParams:string = params.join('&');

    if (stringParams) {
        url = url.concat('?', stringParams);
    }

    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}

/**
 * Add a new Whitelist policy rule to the Hot wallet
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} walletId - The id of the wallet
 * @param {string} whitelistId - The id of the Whitelist policy rule
 * @param {string} recipientAddress - The address of the recipient wallet
 * @returns {Promise} - The promise of the Post BitGo Add Policy Rule HTTP Request
 * */
export async function addWhitelistPolicyRule(baseUrl:string, bearerToken:string, coin:string, walletId:string, whitelistId:string, recipientAddress:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/wallet/${walletId}/policy/rule`;
    const data:any = {
        'id': `${whitelistId}`,
        'action': {
            'type': 'getApproval'
        },
        'type': 'advancedWhitelist',
        'condition': {
            'add': {
                'item': `${recipientAddress}`,
                'metaData': {
                    'label': 'PolicyRuleTest'
                },
                'type': 'address'
            }
        }
    };
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('POST', url, data, config);
}

/**
 * Remove a Whitelist policy rule from the Hot wallet
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} walletId - The id of the wallet
 * @param {string} whitelistId - The id of the Whitelist policy rule
 * @param {string} recipientAddress - The address of the recipient wallet
 * @returns {Promise} - The promise of the Delete BitGo Remove Policy Rule HTTP Request
 * */
export async function removeWhitelistPolicyRule(baseUrl:string, coin:string, bearerToken:string, walletId:string, whitelistId:string, recipientAddress:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/wallet/${walletId}/policy/rule`;
    // Axios does not support data object on DELETE method,
    // because of that we added the request body inside 'config.data' object
    // as a workaround
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        },
        data: {
            'condition': {
                'remove': {
                    'item': `${recipientAddress}`
                }
            },
            'action': {
                'type': 'getApproval'
            },
            'type': 'advancedWhitelist',
            'id': `${whitelistId}`
        }
    };
    return await axiosRequest('DELETE', url, {}, config);
}

/**
 * Add webhook to a wallet
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} walletId - The id of the wallet
 * @param {string} type - Type of event to listen to (can be transfer or pendingapproval)
 * @returns {Promise} - The promise of the Post BitGo Add Wallet Webhook HTTP Request
 * */
export async function addWalletWebhook(baseUrl:string, coin:string, bearerToken:string, walletId:string, type:string, webhookUrl:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/wallet/${walletId}/webhooks`;

    const data:any = {
        'type': `${type}`,
        'url': `${webhookUrl}`
    };

    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('POST', url, data, config);
}

/**
 * Simulate wallet webhook
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} walletId - The id of the wallet
 * @param {string} webhookId - The id of the webhook already added
 * @param {string} [pendingApprovalId] - The id of the pendingApproval
 * @returns {Promise} - The promise of the Post BitGo Simulate Wallet Webhook HTTP Request
 * */
export async function simulateWalletWebhookByType(baseUrl:string, coin:string, bearerToken:string, walletId:string, webhookId:string, walletWebhookType:string, pendingApprovalId?:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/wallet/${walletId}/webhooks/${webhookId}/simulate`;
    let data:any;

    const firstMatchElement:number = 0;
    const jsonpathExpected:string = 'data.transfers[0].id';
    let actualValue:any[];
    let aux:number = 0; //This variable is to prevent a infinite cycle executions

    if (walletWebhookType === 'transfer') {
        do { // TODO: create a generate function for the do while
            aux++;
            console.log('\t\tWaiting for internal transfer to be made ...');
            syncUtils.sleep(3000);
            let listTransfersResponse:any;

            try {
                listTransfersResponse = await apiWalletPlatformTransactionUtils.getListOfTransactions(baseUrl, coin, walletId, bearerToken);
            } catch (e) {
                throw new Error(e);
            }

            actualValue = jsonpath.query(listTransfersResponse, jsonpathExpected);
            if (aux === 30) {
                throw new Error('Max number of attempts reached');
            }
        } while ( objectUtils.isEmpty(actualValue) );

        data = {'transferId': actualValue[firstMatchElement]}
    } else if (walletWebhookType === 'pendingapproval') {
        data = {'pendingApprovalId': pendingApprovalId}
    }

    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('POST', url, data, config);
}

/**
 * Remove a webhook from a wallet
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} walletId - The id of the wallet
 * @returns {Promise} - The promise of the Delete BitGo Remove Wallet Webhook HTTP Request
 * */
export async function removeWalletWebhook(baseUrl:string, coin:string, bearerToken:string, walletId:string, webhookType:string, webhookUrl:string, webhookId:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/wallet/${walletId}/webhooks`;

    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        },
        data: {
            'type': webhookType,
            'url': webhookUrl,
            'id': webhookId
        }
    };
    return await axiosRequest('DELETE', url, {}, config);
}

/**
 * Generate a new recipient address for the wallet
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} walletId - The id of the wallet
 * @param {number | null} forwarderVersion - (ETH only) forwarder version
 * @returns {Promise} - The promise of the Post BitGo Generate address HTTP Request
 * */
export async function generateNewRecipientAddress(baseUrl:string, bearerToken:string, coin:string,
                                                  walletId:string, forwarderVersion?: number | null):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/wallet/${walletId}/address`;
    const config:AxiosRequestConfig = {
        headers:{
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    const data = forwarderVersion && _.isNumber(forwarderVersion) ? { forwarderVersion } : {};

    const firstMatchElement = 0;
    const jsonpathExpected:string = 'data.receiveAddress.address';
    let actualValue:any[];
    let aux:number = 0; //This variable is to prevent a infinite cycle executions

    do {
        aux++;
        console.log('\t\tWaiting for wallet initialization ...');
        syncUtils.sleep(5000);
        let getWalletResponse:any;

        try {
            getWalletResponse = await getWallet(baseUrl, bearerToken, coin, walletId);
        } catch (e) {
            throw new Error(e);
        }

        actualValue = jsonpath.query(getWalletResponse, jsonpathExpected);
        if (aux === 50) {
            throw new Error('Max number of attempts reached');
        }
    } while ( objectUtils.isEmpty(actualValue) );

    console.log(`\t\tRecipient address number 1: ${actualValue[firstMatchElement]}`);

    return await axiosRequest('POST', url, data, config);
}

/**
 * Get the list of addresses of the wallet
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} walletId - The id of the wallet
 * @param {string} [limit] - Maximum number of addresses to be listed
 * @returns {Promise} - The promise of the Get BitGo List addresses HTTP Request
 * */
export async function getListAddresses(baseUrl:string, bearerToken:string, coin:string, walletId:string, limit?:string):Promise<any> {
    let url:string = `${baseUrl}/api/v2/${coin}/wallet/${walletId}/addresses`;
    let params:string[] = [];

    if (limit) {
        params.push(`limit=${limit}`);
    }

    const stringParams:string = params.join('&');

    if (stringParams) {
        url = url.concat('?', stringParams);
    }

    const config:AxiosRequestConfig = {
        headers:{
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}

/**
 * Wait the confirmed recipient address recently added
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} walletId - The id of the wallet
 * @returns {Promise} - The promise void
 * */
export async function waitConfirmedNewRecipientAddress(baseUrl:string, bearerToken:string, coin:string, walletId:string):Promise<void> {
    const firstMatchElement = 0;
    const jsonpathExpected:string = 'data.pendingAddressCount';
    let actualValue:any[];
    let aux:number = 0; //This variable is to prevent a infinite cycle executions
    let getListAddressesResponse:any;

    do {
        aux++;
        console.log('\t\tWaiting for address confirmation ...');
        syncUtils.sleep(5000);

        try {
            getListAddressesResponse = await getListAddresses(baseUrl, bearerToken, coin, walletId);
        } catch (e) {
            throw new Error(e);
        }

        actualValue = jsonpath.query(getListAddressesResponse, jsonpathExpected);
        if (aux === 50) {
            throw new Error('Max number of attempts reached');
        }
    } while ( actualValue[firstMatchElement] === 1 );
}

/**
 * Perform OTP verification to keep authenticate a user
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @returns {Promise} - The promise of the Post OTP Verification HTTP Request
 * */
 export async function performOTPVerification(baseUrl:string, bearerToken:string):Promise<any> {
    const url:string = `${baseUrl}/api/v1/user/unlock`;
    const data:any = {
        'otp': '000000'
    };
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('POST', url, data, config);
}

export async function flushToken(baseUrl:string, coin:string, bearerToken:string, walletId:string, addressesToFlush:string[], force:boolean):Promise<any> {
    const bitgo:BitGo = await bitGoJSUtilWalletUtils.getBitGoInstance(bearerToken, undefined);
    if (!(bitgo.coin(coin) as any).tokenConfig) {
        throw new Error(`The ${coin} token provided needs to have a tokenConfig but none found`);
    }
    const tokenAddress:string = (bitgo.coin(coin) as any).tokenConfig.tokenContractAddress;
    const underlyingCoin:string = (bitgo.coin(coin) as any).tokenConfig.coin;
    const url = `${baseUrl}/api/v2/${coin}/admin/forwardToken`;
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${adminBearerToken}`
        }
    };
    const data:any = {
        'walletId': walletId,
        'addresses': addressesToFlush,
        'tokenAddress': tokenAddress,
        'force': force
    };
    const resp:any = await axiosRequest('POST', url, data, config);
    console.log(`Attempting to flush tokenAddress ${tokenAddress} for addresses: ${addressesToFlush}`);
    console.log('Flush Transaction Ids', resp.data.txids);
    for (const txid of resp.data.txids) {
        await apiWalletPlatformTransactionUtils.waitTransactionToBeConfirmed(txid, walletId, baseUrl, underlyingCoin, bearerToken);
    }
    return resp;
}
