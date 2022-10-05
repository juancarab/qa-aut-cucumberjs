/* it tears down created resources in test steps 
to asure they are properly deleted even when test failed*/
 import * as apiWalletPlatformWalletUtils from "../projects/api-wallet-platform/src/utils/walletUtils";

 export class TearDownTasks{
    teardown_tasks:any;
    constructor() {
      this.teardown_tasks = [];
    }


    add_delete_hot_wallet_task(theparams:any){
      this.teardown_tasks.push(this.delete_hot_wallet_task, theparams);
    }
    async delete_hot_wallet_task(params:any){
       try {
           await apiWalletPlatformWalletUtils.deleteWallet(params.baseUrl, params.coin, params.bearerToken, params.walletId);
           console.log(`\t\tHot wallet (id: ${params.walletId}) successfully cleaned up`);
       } catch(err) {
         console.log(`\t\tHot wallet(id: ${params.walletId}) clean up failed, please double check, It might be already removed`);
         console.log(`\t\t\tCurrent error:  ${err.name} : ${err.message}`);
      }
    }

    add_remove_invite_user_hot_wallet_task(theparams:any){
      this.teardown_tasks.push(this.remove_invite_user_hot_wallet_task, theparams);
    }
    async remove_invite_user_hot_wallet_task(params:any){
       try {
         await apiWalletPlatformWalletUtils.removeUserFromHotWallet(params.baseUrl, params.coin, params.bearerToken, params.walletId, params.invitedUserId);  
         console.log(`\t\tInvited user ${params.invitedUserId} successfully cleaned up from wallet ${params.walletId}`);
       } catch(err) {
         console.log(`\t\tInvited user ${params.invitedUserId} clean up failed, please double check, It might be already removed`);
         console.log(`\t\t\tCurrent error:  ${err.name} : ${err.message}`);
       }
    }



    execute_teardown(){
      let task:any; 
      let param:any;
      while (this.teardown_tasks.length >0){
         [task, param] = this.teardown_tasks.splice(0, 2);  
         task(param);
      };
    }
 }
