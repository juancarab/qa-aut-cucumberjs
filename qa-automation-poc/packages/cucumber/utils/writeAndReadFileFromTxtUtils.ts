import fs from "fs";
import {coin, stringOfCoinsTested} from "../globals";

const path: string = "packages/cucumber/output/coinsTested.txt";

export function writeCoinsToTxtFile(): void {
    let fs = require('fs');
    fs.writeFile(path, stringOfCoinsTested, function (err: any) {
        if (err) {
            return console.log(err);
        }
    });
}

export function readingCoinsFromTxtFile(): string {
    return fs.readFileSync(path, 'utf-8');
}

export function rewritingJsonCoinFile(newSenderWalletId: string, newRecipientWalletId: string, newOneUserWalletId: string): void {
    const coinPath: string = `packages/cucumber/config/coins/${coin}.json`;
    var fs = require('fs');
    var data = JSON.parse(fs.readFileSync(coinPath));

    data.env['test2']['api_wallet_platform']['transaction'].senderWalletId = newSenderWalletId;
    data.env['test2']['api_wallet_platform']['transaction'].recipientWalletId = newRecipientWalletId;
    data.env['test2']['api_wallet_platform']['wallet'].oneUserWalletId = newOneUserWalletId;

    fs.writeFile(coinPath, JSON.stringify(data), function (err: any) {
        if (err) {
            return console.log(err);
        }
    });
}
