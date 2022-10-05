import dotenv from 'dotenv';
import {setupSuiteParameters} from "./config";
import {uniq} from "lodash";

dotenv.config();

/**
 * Global variables
 *
 * - gEnvironment: This variable defines the test environment of the test execution
 * - gCoin: This variable defines the coin under test
 * - gBearerToken: This variable defines the Bearer Token used for Authentication of the APIs
 * - gDefaultTimeout: This variable defines the timeout of all the test steps
 * - gConfig: This variable defines all the test arguments provides by the JSON files
 *
 * Local variables
 *
 * The following variables are loaded OPTIONALLY from environmental variables(or .env file).
 * In case any of them is set, it will override its equivalente parameter/value included in environment.json or coin/*.json
 * Otherwise, the parameters to be used by the framework will be retrieved form json files
 *
 * - ebaseUrl: environment URL the automation will be executed against
 * - eCucumberBearerToken: Bearer Token of a second account that has a wallet to share, used to share wallets
 * - eEnterpriseId: Enterprise grouping accounts
 * - eWalletPassphrase: Password of the account asociated to the bearertoken provided in .env, used to create new wallets
 * - eInvitedUserId: User ID of an account invited to a wallet (wallet sharing)
 * - eInvitedUserBearerToken: Bearer token of an account invited to a wallet (wallet sharing)
 * - eSenderWalletId: Sender wallet used to transfer funds
 * - eRecipientWalletId: Wallet used to receive funds
 * - eGasTankLimit: Minimum gas necessary to perform ETH transactions
 * - eOneUserWalletId: Wallet ID used to perform a wallet sharing
 * - eRecipientAddress: Address ID of a wallet used to set a whitelist policy
 * - eWhitelistId: Whitelist ID of an added whitelist policy rule
 * */

export const gEnvironment: string | undefined = process.env.ENVIRONMENT;
let gCoin: string | undefined = 'teth';
if (!process.env.BEARER_TOKEN) {
    throw new Error('No bearer token given');
}

export let gConfig: any = setupSuiteParameters(gEnvironment, gCoin);

loadConfig(gConfig.coin);

export const gBearerToken: string = process.env.BEARER_TOKEN;
export const gAdminBearerToken: string | undefined = process.env.ADMIN_BEARER_TOKEN;
export const gCleanup: string | undefined = process.env.CLEANUP;
export const gDefaultTimeout: number = (process.env.DEFAULT_TIMEOUT as unknown as number) || 50 * 5000;
export const gToken: string | undefined = process.env.TOKEN;
export let baseUrl: string = gConfig.baseUrl;
export let bearerToken: string = gBearerToken;
export let cucumberBearerToken: string = gConfig.cucumberBearerToken;
export let invitedUserId: string = gConfig.invitedUserId;
export let walletPassphrase: string = gConfig.walletPassphrase;
export let invitedUserBearerToken: string = gConfig.invitedUserBearerToken;
export let enterpriseId = gConfig.enterpriseId;

export let coin = gConfig.coin;
export let senderWalletId = gConfig.api_wallet_platform.transaction.senderWalletId;
export let recipientAddress = gConfig.api_wallet_platform.wallet.recipientAddress;
export let senderWalletId_v1 = gConfig.api_wallet_platform.transaction.senderWalletId_v1;
export let recipientWalletId = gConfig.api_wallet_platform.transaction.recipientWalletId;
export let recipientWalletId_v1 = gConfig.api_wallet_platform.transaction.recipientWalletId_v1;
export let senderAddress = gConfig.api_wallet_platform.wallet.senderAddress;
export let recipientExternalAddress = gConfig.api_wallet_platform.wallet.recipientExternalAddress;
export let recipientLowPriorityFeeAddress = gConfig.api_wallet_platform.wallet.recipientLowPriorityFeeAddress;
export let oneUserWalletId = gConfig.api_wallet_platform.wallet.oneUserWalletId;
export let goerliFeeAddress = gConfig.api_wallet_platform.wallet.goerliFeeAddress;
export let gasLimitForNonceHole = gConfig.api_wallet_platform.transaction.gasLimitForNonceHole;
export let gasPriceForNonceHole = gConfig.api_wallet_platform.transaction.gasPriceForNonceHole;
export let gasTankLimit = gConfig.api_wallet_platform.wallet.gasTankLimit;
export let whitelistId = gConfig.api_wallet_platform.wallet.whitelistId;
export let listOfCoinsTested: Array<string> | null | undefined = new Array<string>();
export let stringOfCoinsTested: string;
export let usingDefaultCoin: boolean = true;


export function loadConfig(_coin: string | undefined): any {
    const eBaseUrl: string | undefined = process.env.BASE_URL;
    const eCucumberBearerToken: string | undefined = process.env.CUCUMBER_BEARER_TOKEN;
    const eEnterpriseId: string | undefined = process.env.ENTERPRISE_ID;
    const eWalletPassphrase: string | undefined = process.env.WALLET_PASSPHRASE;
    const eInvitedUserId: string | undefined = process.env.INVITED_USER_ID;
    const eInvitedUserBearerToken: string | undefined = process.env.INVITED_USER_BEARER_TOKEN;
    const eSenderWalletId: string | undefined = process.env.SENDER_WALLET_ID;
    const eRecipientWalletId: string | undefined = process.env.RECIPIENT_WALLET_ID;
    const eGasTankLimit: string | undefined = process.env.GAS_TANK_LIMIT;
    const eOneUserWalletId: string | undefined = process.env.ONE_USER_WALLET_ID;
    const eRecipientAddress: string | undefined = process.env.RECIPIENT_ADDRESS;
    const eWhitelistId: string | undefined = process.env.WHITE_LIST_ID;
    const eGoerliFeeAddress: string | undefined = process.env.GOERLI_FEE_ADDRESS;
    const eGasLimitForNonceHole: string | undefined = process.env.GAS_LIMIT_FOR_NONCE_HOLE;
    const eGasPriceForNonceHole: string | undefined = process.env.GAS_PRICE_FOR_NONCE_HOLE;


    if (gConfig.baseUrl && eBaseUrl) {
        gConfig.baseUrl = eBaseUrl
    }
    if (gConfig.cucumberBearerToken && eCucumberBearerToken) {
        gConfig.cucumberBearerToken = eCucumberBearerToken
    }
    if (gConfig.enterpriseId && eEnterpriseId) {
        gConfig.enterpriseId = eEnterpriseId
    }
    if (gConfig.walletPassphrase && eWalletPassphrase) {
        gConfig.walletPassphrase = eWalletPassphrase
    }
    if (gConfig.invtitedUserId && eInvitedUserId) {
        gConfig.invtitedUserId = eInvitedUserId
    }
    if (gConfig.invitedUserBearerToken && eInvitedUserBearerToken) {
        gConfig.invitedUserBearerToken = eInvitedUserBearerToken
    }
    if (gConfig.api_wallet_platform.transaction.senderWalletId && eSenderWalletId) {
        gConfig.api_wallet_platform.transaction.senderWalletId = eSenderWalletId
    }
    if (gConfig.api_wallet_platform.transaction.recipientWalletId && eRecipientWalletId) {
        gConfig.api_wallet_platform.transaction.recipientWalletId = eRecipientWalletId
    }
    if (gConfig.api_wallet_platform.wallet.gasTankLimit && eGasTankLimit) {
        gConfig.api_wallet_platform.wallet.gasTankLimit = eGasTankLimit
    }
    if (gConfig.api_wallet_platform.wallet.oneUserWalletId && eOneUserWalletId) {
        gConfig.api_wallet_platform.wallet.oneUserWalletId = eOneUserWalletId
    }
    if (gConfig.api_wallet_platform.wallet.recipientAddress && eRecipientAddress) {
        gConfig.api_wallet_platform.wallet.recipientAddress = eRecipientAddress
    }
    if (gConfig.api_wallet_platform.wallet.whitelistId && eWhitelistId) {
        gConfig.api_wallet_platform.wallet.whitelistId = eWhitelistId
    }
    if (gConfig.api_wallet_platform.wallet.goerliFeeAddress && eGoerliFeeAddress) {
        gConfig.api_wallet_platform.wallet.goerliFeeAddress = eGoerliFeeAddress
    }
    if (gConfig.api_wallet_platform.transaction.gasLimitForNonceHole && eGasLimitForNonceHole) {
        gConfig.api_wallet_platform.transaction.gasLimitForNonceHole = eGasLimitForNonceHole
    }
    if (gConfig.api_wallet_platform.transaction.gasPriceForNonceHole && eGasPriceForNonceHole) {
        gConfig.api_wallet_platform.transaction.gasPriceForNonceHole = eGasPriceForNonceHole
    }

    baseUrl = gConfig.baseUrl;
    bearerToken = gBearerToken;
    cucumberBearerToken = gConfig.cucumberBearerToken;
    invitedUserId = gConfig.invitedUserId;
    walletPassphrase = gConfig.walletPassphrase;
    enterpriseId = gConfig.enterpriseId;

    invitedUserBearerToken = gConfig.invitedUserBearerToken;
    coin = gConfig.coin;
    senderWalletId = gConfig.api_wallet_platform.transaction.senderWalletId;
    recipientAddress = gConfig.api_wallet_platform.wallet.recipientAddress;
    senderWalletId_v1 = gConfig.api_wallet_platform.transaction.senderWalletId_v1;
    recipientWalletId = gConfig.api_wallet_platform.transaction.recipientWalletId;
    recipientWalletId_v1 = gConfig.api_wallet_platform.transaction.recipientWalletId_v1;
    senderAddress = gConfig.api_wallet_platform.wallet.senderAddress;
    recipientExternalAddress = gConfig.api_wallet_platform.wallet.recipientExternalAddress;
    recipientLowPriorityFeeAddress = gConfig.api_wallet_platform.wallet.recipientLowPriorityFeeAddress;
    oneUserWalletId = gConfig.api_wallet_platform.wallet.oneUserWalletId;
    goerliFeeAddress = gConfig.api_wallet_platform.wallet.goerliFeeAddress;
    gasLimitForNonceHole = gConfig.api_wallet_platform.transaction.gasLimitForNonceHole;
    gasPriceForNonceHole = gConfig.api_wallet_platform.transaction.gasPriceForNonceHole;
    gasTankLimit = gConfig.api_wallet_platform.wallet.gasTankLimit;
    whitelistId = gConfig.api_wallet_platform.wallet.whitelistId;

    if (_coin != null && listOfCoinsTested != null) {
        listOfCoinsTested.push(_coin);
        listOfCoinsTested = uniq(listOfCoinsTested)
        stringOfCoinsTested = String(listOfCoinsTested);
    }
}
