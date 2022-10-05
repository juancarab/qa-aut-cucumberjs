import {generate, Options} from 'cucumber-html-reporter';
import {getDateCustomFormat} from "../utils/dateUtils";
import dotenv from 'dotenv';
import {readingCoinsFromTxtFile} from "../utils/writeAndReadFileFromTxtUtils";

dotenv.config();

if (!process.env.ENVIRONMENT) {
    throw new Error('No environment given');
}

const options: Options = {
    theme: 'bootstrap',
    jsonFile: 'packages/cucumber/output/cucumber.json',
    output: `packages/cucumber/output/cucumber_report_${getDateCustomFormat()}.html`,
    reportSuiteAsScenarios: true,
    scenarioTimestamp: true,
    launchReport: false,
    name: 'Cucumber-JS BitGo test report',
    metadata: {
        "Test Environment": process.env.ENVIRONMENT,
        "Test Coins": `${readingCoinsFromTxtFile()}`,
        "Deployed Version": process.env.ENV_VERSION || 'v1',
        "Execution Timestamp": `${getDateCustomFormat()}`
    }
};

generate(options);
