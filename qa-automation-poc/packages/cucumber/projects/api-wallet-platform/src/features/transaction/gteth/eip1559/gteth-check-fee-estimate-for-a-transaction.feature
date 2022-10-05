@project_api-wallet-platform
@feature_transaction @subfeature_eip1559
@coin_gteth
@testsuite_acceptance
@testlevel_e2e
@story_STLX-XXXX
@testid_XX @testkey_QA-XXXX

Feature: Check the fee estimate for a ETH transaction EIP1559

    Scenario: Check the fee estimate for a ETH transaction EIP1559

        Given I will test the coin 'gteth'
        And I have a valid user in bitgo
        When I check the fee estimate for a transaction
        Then I verify that the response contains the following fields
            | API          | JsonPath                       | Value                           |
            | fee_estimate | status                         | 200                             |
            | fee_estimate | $.headers..["content-type"]    | application/json; charset=utf-8 |
            | fee_estimate | data.eip1559.baseFee           | string                          |
            | fee_estimate | data.eip1559.fastestMinerTip   | string                          |
            | fee_estimate | data.eip1559.gasUsedRatio      | string                          |
            | fee_estimate | data.eip1559.ludicrousMinerTip | string                          |
            | fee_estimate | data.eip1559.normalMinerTip    | string                          |
            | fee_estimate | data.eip1559.safeLowMinerTip   | string                          |
            | fee_estimate | data.eip1559.standardMinerTip  | string                          |
            | fee_estimate | data.feeEstimate               | string                          |
            | fee_estimate | data.minGasPrice               | string                          |
            | fee_estimate | data.minGasLimit               | string                          |
            | fee_estimate | data.maxGasLimit               | string                          |
            | fee_estimate | data.minGasIncreaseBy          | number                          |
