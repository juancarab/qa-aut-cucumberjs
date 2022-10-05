import { AxiosRequestConfig } from "axios";
import axiosRequest from "../../../../utils/axiosUtils";
import * as bitGoJSUtilWalletUtils from "../../../../utils/bitGoJSUtils/walletUtils";

/**
 * Create a User key
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} pub - The public key of the key pair
 * @param {string} encryptedPrv - The encrypted private key of the key pair
 * @returns {Promise} - The promise of the Post User Key HTTP Request
 * */
export async function createUserKey(baseUrl:string, coin:string, bearerToken:string, pub:string, encryptedPrv:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/key`;
    const data:any = {
        'pub': `${pub}`,
        'encryptedPrv': `${encryptedPrv}`,
        'source': 'user'
    }
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('POST', url, data, config);
}

/**
 * Create a Backup key in Trusted Partner
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @returns {Promise} - The promise of the Post Backup Key in trusted partner HTTP Request
 * */
export async function createBackupKeyInTrustedPartner(baseUrl:string, coin:string, bearerToken:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/key`;
    const data:any = {
        'source': 'backup',
        'provider': 'dai'
    }
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('POST', url, data, config);
}

/**
 * Create a Backup key in own key
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} pub - The public key of the key pair
 * @param {string} encryptedPrv - The encrypted private key of the key pair
 * @returns {Promise} - The promise of the Post Backup Key in my own key HTTP Request
 * */
export async function createBackupKeyWithMyOwnKey(baseUrl:string, coin:string, bearerToken:string, pub:string, encryptedPrv:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/key`;
    const data:any = {
        'pub': `${pub}`,
        'encryptedPrv': `${encryptedPrv}`,
        'source': 'backup'
    }
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('POST', url, data, config);
}

/**
 * Create a BitGo key
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} enterpriseId - The ID of the enterprise user
 * @returns {Promise} - The promise of the Post BitGo key HTTP Request
 * */
export async function createBitGoKey(baseUrl:string, coin:string, bearerToken:string, enterpriseId?:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/key`;
    let data:any = {
        'source': 'bitgo'
    }

    if (enterpriseId) {
        data.enterprise = enterpriseId;
    }

    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('POST', url, data, config);
}

/**
 * Create a Backup key with an existing public key
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} pub - The public key of the key pair
 * @returns {Promise} - The promise of the Post Backup key using my public Key HTTP Request
 * */
export async function createBackupKeyWithAnExistingPublicKey(baseUrl:string, coin:string, bearerToken:string, pub:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/key`;
    const data:any = {
        'pub': `${pub}`,
        'source': 'backup'
    }
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('POST', url, data, config);
}

/**
 * Get key
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} keyId - The ID of the key
 * @returns {Promise} - The promise of the Get Key HTTP Request
 * */
export async function getKey(baseUrl:string, coin:string, bearerToken:string, keyId:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/key/${keyId}`;
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('GET', url, {}, config);
}

/**
 * Create backup key per type of backup key
 * - Backup key in trusted partner
 * - Backup key with my own key
 * - Backup key with an existing public key
 *
 * @param {string} backupKey - Type of backup key defined in Gherkin
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {*} keyPairForUserKey - Key Pair of the User key
 * @param {string} walletPassphrase - Passphrase of the wallet
 * @returns {Promise} The promise of the Post Backup key HTTP Request
 * */
export async function createBackupKeyPerTypeOfBackupKey(backupKey:string, baseUrl:string, coin:string, bearerToken:string, keyPairForUserKey:any, walletPassphrase:string):Promise<any> {
    let keyPairForBackupKey:any;
    let encryptedPrvForOwnKey:any;

    if (backupKey === 'with backup key in trusted partner') {
        return await createBackupKeyInTrustedPartner(baseUrl, coin, bearerToken);
    } else if (backupKey === 'with my own key') {
        keyPairForBackupKey = bitGoJSUtilWalletUtils.generateKeyPair(coin, await bitGoJSUtilWalletUtils.getBitGoInstance(bearerToken, baseUrl));
        encryptedPrvForOwnKey = bitGoJSUtilWalletUtils.generateEncryptedPrv(keyPairForUserKey.prv, walletPassphrase, await bitGoJSUtilWalletUtils.getBitGoInstance(bearerToken, baseUrl));
        return await createBackupKeyWithMyOwnKey(baseUrl, coin, bearerToken, keyPairForBackupKey.pub, encryptedPrvForOwnKey);
    } else if (backupKey === 'with an existing public key to create the backup key') {
        keyPairForBackupKey = bitGoJSUtilWalletUtils.generateKeyPair(coin, await bitGoJSUtilWalletUtils.getBitGoInstance(bearerToken, baseUrl));
        return await createBackupKeyWithAnExistingPublicKey(baseUrl, coin, bearerToken, keyPairForBackupKey.pub);
    } else {
        throw new Error('Bad backup key type given');
    }
}

/**
 * Change the password of a wallet
 *
 * @param {string} baseUrl - The base url of the BitGo APIs
 * @param {string} coin - The identifier of the coin
 * @param {string} bearerToken - The bearer token to access to BitGo APIs
 * @param {string} keyId - The ID of the key
 * @param {string} encryptedPrv - The encrypted private key of a wallet
 * @returns {Promise} - The promise of the Put Key HTTP Request
 * */
 export async function changePassword(baseUrl:string, coin:string, bearerToken:string, keyId:string, encryptedPrv:string):Promise<any> {
    const url:string = `${baseUrl}/api/v2/${coin}/key/${keyId}`;
    const data:any = {
        'encryptedPrv': `${encryptedPrv}`
    }
    const config:AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };
    return await axiosRequest('PUT', url, data, config);
}
