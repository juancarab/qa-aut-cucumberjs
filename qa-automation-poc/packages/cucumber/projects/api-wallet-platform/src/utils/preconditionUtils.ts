import * as apiWalletPlatformWalletUtils from "./walletUtils";
import { AxiosRequestConfig } from "axios";
import axiosRequest from "../../../../utils/axiosUtils";

/**
 * Set the wallet by role in the context object of the CustomWorld
 *
 * @param {*} context - The Context World variable
 * @param {string} role - The role of the wallet in the test scenario (sender or recipient)
 * @param {string} senderWalletId - The ID of the sender wallet
 * @param {string} recipientWalletId - The ID of the recipient wallet
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} coin - The identifier of the coin
 * */
export async function setETHWalletPerRoleInCustomWorldVariable(context:any, role:string, senderWalletId:string, recipientWalletId:string, baseUrl:string, bearerToken:string, coin:string):Promise<void> {
    // TODO: Find a better way to handle the roles instead using if else conditions
    if (role === 'sender') {
        context.senderWalletId = senderWalletId;
        console.log(`\t\tSender Wallet Id: ${senderWalletId}`);

        try {
            let getSenderBitGoWalletResponse:any = await apiWalletPlatformWalletUtils.getWallet(baseUrl, bearerToken, coin, senderWalletId);
            context.senderInitialBalance = getSenderBitGoWalletResponse.data.balanceString;
            context.senderInitialConfirmedBalance = getSenderBitGoWalletResponse.data.confirmedBalanceString;
            context.senderInitialSpendableBalance = getSenderBitGoWalletResponse.data.spendableBalanceString;
            context.senderAddress = getSenderBitGoWalletResponse.data.receiveAddress.address;
            if (coin == 'tsxt') {
                context.senderAddress = getSenderBitGoWalletResponse.data.coinSpecific.baseAddress;
            }
            console.log(`\t\tInitial sender balance: ${getSenderBitGoWalletResponse.data.balanceString}`);
        } catch (e) {
            throw new Error(e.message);
        }

    } else if (role === 'recipient') {
        console.log(`\t\tRecipient Wallet Id: ${recipientWalletId}`);
        context.recipientWalletId = recipientWalletId;

        try {
            let getRecipientBitGoWalletResponse:any = await apiWalletPlatformWalletUtils.getWallet(baseUrl, bearerToken, coin, recipientWalletId);
            context.recipientAddress = getRecipientBitGoWalletResponse.data.receiveAddress.address;
            context.recipientInitialBalance = getRecipientBitGoWalletResponse.data.balanceString;
            context.recipientInitialConfirmedBalance = getRecipientBitGoWalletResponse.data.confirmedBalanceString;
            context.recipientInitialSpendableBalance = getRecipientBitGoWalletResponse.data.spendableBalanceString;
            if (coin == 'tstx') {
                context.recipientAddress = getRecipientBitGoWalletResponse.data.coinSpecific.baseAddress;
            }
            console.log(`\t\tInitial recipient balance: ${getRecipientBitGoWalletResponse.data.balanceString}`);
        } catch (e) {
            throw new Error(e.message);
        }

    } else {
        throw new Error('Bad role given');
    }
}

/**
 * Get Logs
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @returns {Promise} - The promise of the Get BitGo Wallet HTTP Request
 * */
 export async function getLogs(baseUrl:string, bearerToken:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/auditlog`;
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}
