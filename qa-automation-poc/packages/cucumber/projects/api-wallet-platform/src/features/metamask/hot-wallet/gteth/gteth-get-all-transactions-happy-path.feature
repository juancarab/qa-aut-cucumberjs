@project_api-wallet-platform
@feature_metamask
@subfeature_hot-wallet
@coin_gteth
@testsuite_acceptance
@testlevel_e2e
@testid_XXX @testkey_QA-XXXX

Feature: Metamask gets all wallet transactions

    Scenario: Metamask gets all wallet transactions - Happy path

        Given I will test the coin 'gteth'
        Given I have an enterprise user with 'gteth' wallets
        When Metamask gets the wallet information
        And I create a metamask transaction
        Then I verify metamask transactions can be retrieved

