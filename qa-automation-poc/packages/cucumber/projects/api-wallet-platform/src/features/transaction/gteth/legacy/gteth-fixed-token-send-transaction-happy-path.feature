@project_api-wallet-platform
@feature_transaction @subfeature_legacy
@coin_gteth_token_fixed
@testsuite_acceptance
@testlevel_e2e
@story_STLX-XXXX
@testid_XX @testkey_QA-XXXX
Feature: ETH Fixed Token Send Transaction - Happy path

    Scenario: ETH Fixed Token Send Transaction - Happy path

        # Preconditions to get wallets
        Given I will test the coin 'gteth'
        And I have an enterprise user with enough funds in the gas tank to create a new ETH wallet
        And I have a 'sender' wallet with fixed_token
        And I have a 'recipient' wallet with fixed_token
        # Send to recipient
        When I build and send the 'fixed_token' transaction with an amount 'smallest_greater_than_zero' the current balance of the sender wallet 'successfully'
        Then I verify that the response contains the following fields
            | API       | JsonPath                      | Value                                            |
            | pre-build | status                        | 200                                              |
            | pre-build | data.recipients               | object                                           |
            | pre-build | data.recipients[0].amount     | string                                           |
            | pre-build | data.recipients[0].address    | string                                           |
            | pre-build | data.nextContractSequenceId   | number                                           |
            | pre-build | data.isBatch                  | false                                            |
            | pre-build | data.coin                     | string                                           |
            | build     | status                        | 200                                              |
            | build     | data.recipients               | object                                           |
            | build     | data.recipients[0].amount     | string                                           |
            | build     | data.recipients[0].address    | string                                           |
            | build     | data.nextContractSequenceId   | number                                           |
            | build     | data.isBatch                  | false                                            |
            | build     | data.coin                     | string                                           |
            | send      | status                        | 200                                              |
            | send      | data.transfer                 | object                                           |
            | send      | data.transfer.id              | string                                           |
            | send      | data.transfer.coin            | string                                           |
            | send      | data.transfer.wallet          | _api_wallet_platform.transaction.senderWalletId_ |
            | send      | data.transfer.walletType      | hot                                              |
            | send      | data.transfer.enterprise      | _enterpriseId_                                   |
            | send      | data.transfer.txid            | string                                           |
            | send      | data.transfer.heightId        | string                                           |
            | send      | data.transfer.date            | string                                           |
            | send      | data.transfer.type            | send                                             |
            | send      | data.transfer.valueString     | string                                           |
            | send      | data.transfer.baseValueString | string                                           |
            | send      | data.transfer.feeString       | string                                           |
            | send      | data.transfer.payGoFeeString  | string                                           |
            | send      | data.transfer.state           | signed                                           |
            | send      | data.transfer.instant         | false                                            |
            | send      | data.transfer.isReward        | false                                            |
            | send      | data.transfer.isFee           | false                                            |
            | send      | data.transfer.tags            | object                                           |
            | send      | data.transfer.history         | object                                           |
            | send      | data.transfer.signedDate      | string                                           |
            | send      | data.transfer.coinSpecific    | object                                           |
            | send      | data.transfer.entries         | object                                           |
            | send      | data.transfer.signedTime      | string                                           |
            | send      | data.txid                     | string                                           |
            | send      | data.status                   | signed                                           |
        And I verify that the fixed_token total balance of the 'sender' ETH wallet was updated properly
        And I verify that the fixed_token confirmed balance of the 'recipient' ETH wallet was updated properly
        # Flush
        When I flush the fixed_token in the recipient
        Then I verify that the response contains the following fields
            | API   | JsonPath      | Value  |
            | flush | status        | 200    |
            | flush | data.txids[0] | string |
        And I verify that the fixed_token spendable balance of the 'recipient' ETH wallet was updated properly
        And I verify that the fixed_token total balance of the 'recipient' ETH wallet was updated properly
        # Send back tokens to reuse in future test cases
        And I swap fixed_token sender with recipient
        When I build and send the 'fixed_token' transaction with an amount 'smallest_greater_than_zero' the current balance of the sender wallet 'successfully'
        Then I verify that the response contains the following fields
            | API       | JsonPath | Value |
            | pre-build | status   | 200   |
            | build     | status   | 200   |
            | send      | status   | 200   |
        And I verify that the fixed_token total balance of the 'sender' ETH wallet was updated properly
        And I verify that the fixed_token confirmed balance of the 'recipient' ETH wallet was updated properly
        When I flush the fixed_token in the recipient
        Then I verify that the fixed_token spendable balance of the 'recipient' ETH wallet was updated properly
        And I verify that the fixed_token total balance of the 'recipient' ETH wallet was updated properly
