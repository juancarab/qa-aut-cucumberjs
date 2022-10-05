/**
 * Pause the execution of the tests for a while
 *
 * @param {number} ms - Milliseconds to wait
 */
export function sleep(ms:number):void {
    const date:number = Date.now();
    let currentDate:number;
    do {
        currentDate = Date.now();
    } while (currentDate - date < ms)
}
