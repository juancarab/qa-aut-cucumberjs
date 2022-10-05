import {After, AfterAll, Before, Status} from "@cucumber/cucumber";
import {TearDownTasks} from "./utils/teardown_task";
import {CustomWorld} from "./world";
import * as myGlobals from "./globals";
import {writeCoinsToTxtFile} from "./utils/writeAndReadFileFromTxtUtils";

Before(function (this: CustomWorld) {
    this.context.cleanup = new TearDownTasks;
});

After(function (this: CustomWorld, testCase) {
    if (testCase.result.status === Status.FAILED && myGlobals.gCleanup != 'false') {
        this.context.cleanup.execute_teardown();
    }
});

AfterAll(function () {
    writeCoinsToTxtFile();
});
