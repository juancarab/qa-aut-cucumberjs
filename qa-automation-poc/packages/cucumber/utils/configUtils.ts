/**
 * Extract the expected value from the global.gConfig variable.
 * The values that will be extracted are those that are defined as "_path.of.the.value_" in the Gherkin table.
 *
 * @param {string} pathToExpectedValue - The JsonPath of the expected value in the config file
 * @param {Object} gConfig - The Global config variable with arguments for the tests
 * @return {*} expectedValue - The object with the expected value
 * */
export function extractValueFromGConfigObject(pathToExpectedValue:string, gConfig:any):any {
    // The substring function is used to extract the path of the "_path_".
    const startIndexPath:number = 1;
    const endIndexPath:number = pathToExpectedValue.length-1;
    const path:string = pathToExpectedValue.substring(startIndexPath, endIndexPath);
    return deepFind(gConfig, path);
}

/**
 * Find the value of an object by passing the path
 *
 * @param {*} obj - The object to be inspected to extract an internal property
 * @param {string} path - The path to the internal property of the object
 * @returns {*} [] - The internal property of the object (if it exist)
 */
export function deepFind(obj:any, path:string):any {
    let paths:string[] = path.split('.')
        , current:any = obj
        , i:number;

    for (i = 0; i < paths.length; ++i) {
        if (current[paths[i]] === undefined) {
            return undefined;
        } else {
            current = current[paths[i]];
        }
    }
    return current;
}

/**
 * Find the path of a property by passing the property and the object
 *
 * @param {*} obj - The object to be inspected to extract the path to the internal property
 * @param {string} name - The name of the internal property
 * @returns {string} [] - The path of the internal property (if it exist)
 */
export function findPropPath(obj:any, name:string):string|null {
    for (let prop in obj) {
        if (prop == name) {
            return name;
        } else if (typeof obj[prop] == "object") {
            let result:string|null = findPropPath(obj[prop], name);
            if (result) {
                return prop + '.' + result;
            }
        }
    }
    return null;    // Not strictly needed, but good style
}
