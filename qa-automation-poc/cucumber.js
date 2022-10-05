/**
 * Profiles
 */

const common = [
    '--publish-quiet',
    'packages/cucumber/**/*.feature',                               // Specify our feature files
    '--require packages/cucumber/globals.ts',                       // Load globals
    '--require packages/cucumber/world.ts',                         // Load world
    '--require-module ts-node/register',                            // Load ts-node/register to allow us to write step definitions in Typescript (https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#non-js-files)
    '--require packages/cucumber/hooks.ts',                         // Load hooks
    '--require packages/cucumber/projects/*/src/steps/**/*.ts',     // Load step definitions
    '--require packages/cucumber/common_steps/*.ts',                // Load step definitions
    '--format node_modules/@cucumber/pretty-formatter',             // Load custom formatter
    '--format json:packages/cucumber/output/cucumber.json',         // Generate cucumber.json for reporting
    '--format message:packages/cucumber/output/cucumber.ndjson',    // Generate cucumber.txt for Xray reporting
].join(' ');

module.exports = {
    default: common
};

