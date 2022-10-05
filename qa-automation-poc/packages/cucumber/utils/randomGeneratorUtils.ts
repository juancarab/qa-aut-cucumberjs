/**
 * Generate a random email of given prefix with alphanumeric characters
 * This should be used for randomizing test data, not for true cryptographic purposes
 *
 * @param {string} prefix - The initial string of the email to generate
 * @returns {string} randomEmail - String with the random email generated
 */
export function randomEmail(prefix?:string):string {
    if(!prefix) {
        prefix = 'cucumber+';
    }
    return `${prefix}${randomString(12)}@test.bitgo.com`;
}

/**
 * Generate a random string of given length with alphanumeric characters
 * This should be used for randomizing test data, not for true cryptographic purposes
 *
 * @param {number} length - Length of the string to generate
 * @returns {string} randomString - Random string generated
 */
export function randomString(length:number):string {
    let result = '';
    let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
