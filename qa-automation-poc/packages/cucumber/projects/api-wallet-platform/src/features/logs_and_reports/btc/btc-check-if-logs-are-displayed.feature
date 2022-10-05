@project_api-wallet-platform
@feature_audit_logs
@subfeature_enterprise-activity
@coin_btc
@testsuite_bitgocore
@testlevel_e2e
@story_STLX-XXXX
@testid_XXX @testkey_QA-XXXX

Feature: BTC Check if logs are shown in bitgo account

    Scenario: BTC Check if logs are displayed

        Given I will test the coin 'tbtc'
        And I have a valid user in bitgo
        When I check if the logs are displayed
        Then I verify that the response contains the following fields
            | API  | JsonPath                    | Value                           |
            | logs | status                      | 200                             |
            | logs | $.headers..["content-type"] | application/json; charset=utf-8 |
            | logs | data.logs[0].id             | string                          |
            | logs | data.logs[0].ip             | string                          |
            | logs | data.logs[0].date           | string                          |
            | logs | data.logs[0].user           | string                          |
            | logs | data.logs[0].type           | string                          |
