import lodash from 'lodash';
import * as fs from 'fs';

export function setupSuiteParameters(environment: string|undefined, coin: string|undefined):any {
    if (!environment) {
        throw new Error('No environment given');
    }
    console.log(`\t\tTest execution with ${environment} environment`);

    if (!coin) {
        throw new Error('No coin given');
    }
    console.log(`\t\tTest execution with ${coin} coin`);

    const environmentPath:string = 'packages/cucumber/config/environment.json';
    const coinConfigPath:string = `packages/cucumber/config/coins/${coin}.json`;

    const environmentData:any = JSON.parse(fs.readFileSync(environmentPath).toString());
    const coinData:any = JSON.parse(fs.readFileSync(coinConfigPath).toString());

    const mergedData:any = lodash.merge(environmentData, coinData);
    return mergedData.env[environment];
}
