/**
 * Return true if the object parameter is empty. Return false if not.
 *
 * @param {Object} obj - The object to be checked if it is empty
 * @returns {boolean} - The check result is empty
 * */
export function isEmpty(obj:any):boolean {
    return Object.keys(obj).length === 0;
}
