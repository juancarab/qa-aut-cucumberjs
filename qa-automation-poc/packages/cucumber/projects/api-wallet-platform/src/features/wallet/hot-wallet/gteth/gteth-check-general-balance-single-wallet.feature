@project_api-wallet-platform
@feature_wallet
@subfeature_hot-wallet
@coin_gteth
@testsuite_sanity
@testlevel_e2e
@story_STLX-XXXX
@testid_XXX @testkey_QA-XXXX

Feature: ETH Check general balance of a single wallet

    Scenario: ETH Check general balance of a single wallet - Happy path

        Given I will test the coin 'gteth'
        And I have 'bitgo' wallet
        When I get the wallet information
        Then I verify that the response contains the following fields
            | API    | JsonPath                      | Value                           |
            | wallet | status                        | 200                             |
            | wallet | $.headers..["content-type"]   | application/json; charset=utf-8 |
            | wallet | data.id                       | string                          |
            | wallet | data.admin.policy.id          | string                          |
            | wallet | data.coin                     | gteth                           |
            | wallet | data.coinSpecific.baseAddress | string                          |
            | wallet | data.balanceString            | string                          |
            | wallet | data.confirmedBalanceString   | string                          |
            | wallet | data.spendableBalanceString   | string                          |
            | wallet | data.receiveAddress.address   | string                          |
            | wallet | data.users                    | object                          |
