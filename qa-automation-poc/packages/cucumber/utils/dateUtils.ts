/**
 * Returns a date with the format: yyyymmddhhmmss
 *
 * @returns {string} - String with the date in the format [yyyymmddhhmmss]
 */
export function getDateCustomFormat():string {
    let date_ob:Date = new Date();

    // adjust 0 before single digit date
    let date:string = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month:string = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year:number = date_ob.getFullYear();

    // current hours
    let hours:number = date_ob.getHours();

    // current minutes
    let minutes:number = date_ob.getMinutes();

    // current seconds
    let seconds:number = date_ob.getSeconds();

    return `${year}${month}${date}${hours}${minutes}${seconds}`;
}

/**
 * Return timestamp N days in the future
 * Timestamp is the number of seconds that have elapsed since 0 o'clock on January 1, 1970 GMT
 *
 * @param {number} daysInFuture - The number of days in future
 * @returns {number} - timestamp
 * */
export function getDaysInFutureTimestamp(daysInFuture:number):number {
    const oneHourTimestamp:number = 3600
    // Get timestamp for now
    let timestamp:number = Math.round(new Date().getTime() / 1000);
    if (daysInFuture < 1) {
        throw new Error('The number of days must be at least one');
    }
    // Now + N days
    timestamp += ((oneHourTimestamp * 24) * daysInFuture);
    return timestamp;
}
