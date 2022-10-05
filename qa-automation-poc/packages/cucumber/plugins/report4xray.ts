/**
 * @author Claudia Ortiz <cortiz@simtlix.com>
 */

 import fs from 'fs';
 import readline from 'readline';
 import jsonpath from 'jsonpath';
 import dotenv from 'dotenv';
 import { AxiosRequestConfig } from "axios";
 import axiosRequest from "../utils/axiosUtils";
 
 
 dotenv.config();
 
 const eXrayTestExec:string|undefined = process.env.XRAY_TEST_EXECUTION;
 const eXrayTestPlan:string|undefined = process.env.XRAY_TEST_PLAN;
 const eXrayTestPLanSummary: string|undefined = process.env.XRAY_EXEC_SUMMARY;
 const xrayUrl:string = process.env.XRAY_URL!; 
 const eXrayUrlAuth: string = process.env.XRAY_AUTH_URL!;
 const lClientID: string = process.env.XRAY_CLIENT_ID!;
 const lSecretID: string = process.env.XRAY_SECRET_ID!;
 
 
 /**
  * Interface Variables and Constants
  */
 
  interface IStateTest {
     idTest: string,
     statusTest: string
 }
 
 interface ITestCasesFinal {
     testKey:string,
     status:string
 }
 
 interface IInfoTestPlanKey {
     testPlanKey: string,
     summary: string,
     startDate?: string,
     finishDate?: string
 }
 
 interface IOutput4XRay {
     testExecutionKey?: string,
     info?: IInfoTestPlanKey,
     tests?: ITestCasesFinal[]
 }
 
 var axios = require("axios").default;
 var flagNewTestCase: boolean;
 var saveAfterData: boolean;
 var newTestKEYOut = "";
 var statusAUX2Out ="";
 var aStatus = new Array();
 var statusValueJSON: any;
 var tcPickleId: any;
 var statusMain = "";
 var statusTestAr: IStateTest[]=[];
 var testFinalWithTags: ITestCasesFinal[]=[];
 var testPlanKeyVar: IInfoTestPlanKey;
 var output4XRayCucumber:IOutput4XRay;
 var today = new Date();
 
 const testCaseER = /\btestCase\b/;
 const testStepFinishedER = /\btestStepFinished\b/;
 const passedER = /\bPASSED\b/;
 const finishedRunER = /\btestRunFinished\b/;
 const pickleER = /\bpickle\b/;
 const testKeyER = /@testkey/g;
 

 /**
  * Main Function
  */
 
 async function processNDJSON4CucumberXRayReport() {
     const fileStream = fs.createReadStream('packages/cucumber/output/cucumber.ndjson');
 
                 const rl = readline.createInterface({
                     input: fileStream,
                     crlfDelay: Infinity
                 });
                 
                 flagNewTestCase = true;
                 saveAfterData = false;
                 for await (const line of rl) {
                     if (testCaseER.test(line) && flagNewTestCase == true) {
                         flagNewTestCase = false;
                         // Save the data from the Previous Test Case
                         if (saveAfterData) {
                             for (var i in aStatus) {
                                 if (passedER.test(aStatus[i])) {
                                     statusMain = "PASSED";
                                 } else {
                                     statusMain = "FAILED";
                                     break;
                                 }
                             }
                             statusTestAr.push({idTest:tcPickleId,statusTest:statusMain});
                             aStatus = [];
                         }
                         // First testCase, then I get the pickledId and save it to an array. Then with a next I look for all the jsons that say testStepFinished and I will obtain the field testStepResult
                         tcPickleId = jsonpath.query(JSON.parse(line),'$.testCase.pickleId');
                     } 
                     
                     // I save the status values ​​of the steps
                     if (testStepFinishedER.test(line)) {
                         flagNewTestCase = true;
                         saveAfterData = true;
                         // Treat testStepFinished
                         statusValueJSON = jsonpath.query(JSON.parse(line),'$.testStepFinished.testStepResult.status');  
                         aStatus.push(statusValueJSON);  
                     }
 
                     // In case the file is terminated, I have to save the stored data
                     if (finishedRunER.test(line)) {
                         for (var i in aStatus) {
                             if (passedER.test(aStatus[i])) {
                                 statusMain = "PASSED";
                             } else {
                                 statusMain = "FAILED";
                                 break;
                             }
                         }
                         statusTestAr.push({idTest:tcPickleId,statusTest:statusMain});
                     }
                 
                     }
 
                     /**
                      * Second part: Generate the final format with testKey and status
                      */
                     // Open the ndjson file again
                 var text = fs.readFileSync('packages/cucumber/output/cucumber.ndjson').toString('utf-8');
                 var arrayStrText = text.split('\n');
                     
                     for (var n=0; n < arrayStrText.length - 1; n++) {
                         if (pickleER.test(arrayStrText[n].toString())) {
                             let pickleId2Tags = jsonpath.query(JSON.parse(arrayStrText[n]),'$.pickle.id').toString();
                                 // Try to loop FOR the Pickle ID with previously saved IDs
                                 for (var c=0;c<statusTestAr.length;c++) {
                                     if (pickleId2Tags == statusTestAr[c].idTest.toString()) {
                                         // I store the test status
                                         statusAUX2Out = statusTestAr[c].statusTest.toString();
                                         // I get the Tags of the line that contains a pickle
                                         let arrayTAGS = jsonpath.query(JSON.parse(arrayStrText[n]),'$.pickle.tags');
                                         for (var j=0; j< arrayTAGS.length; j++) {
                                             let innerTAGS = arrayTAGS[j].length;
                                             for (var k=0; k < innerTAGS;k++) {
                                                 let tagsName = (Object.values(arrayTAGS)[j][k]).name;
                                                 if (testKeyER.test(tagsName)) {
                                                     // I create an array with the testKey to go through it later and copy the name from "_"
                                                     let arrTestKey = Array.from(tagsName);
                                                     for (var d=0; d<arrTestKey.length;d++) {
                                                         if (arrTestKey[d] == '_') {
                                                             newTestKEYOut = arrTestKey.slice(d+1).join('');
                                                             break;
                                                         }   
                                                     }
                                                     testFinalWithTags.push({testKey:newTestKEYOut,status:statusAUX2Out});
                                                 }
                                             }            
                                         } 
                                     }
                                 }
 
                                 
                         }
 
                     }
           return  testFinalWithTags;
 }
 
 /**
  * Send Xray Json to Xray
  * */


const getToken =  () => {
        var options = {
            method: 'POST',
            url: eXrayUrlAuth,
            headers: {'content-type': 'application/json'},
            data: {
              client_id: lClientID,
              client_secret: lSecretID,
            }
          };
          return new Promise((resolve) => {
             setTimeout(() => {
                resolve(axios.request(options).then(function (response: { data: any; }) {
                    return response.data;
                  }))
              }, 1500);
          })

}

 async function sendResult2Xray(baseUrl:string, xjson:string):Promise<any> {
     const url:string = baseUrl;
     const tokenusr = await getToken().then(result => {
        return result;
    }).catch(e => console.log(e));
     const config:AxiosRequestConfig = {
         headers:{
             'Authorization': `Bearer ${tokenusr}`,
             'Content-Type': 'application/json'
             }
     };
     const data = xjson;
         return await axiosRequest('POST', url, data, config);  
 }
 
 
 async function finalJSON4XRAY() {
     
     if (eXrayTestExec) {
         const auxTestExec = await processNDJSON4CucumberXRayReport();
         output4XRayCucumber = {testExecutionKey:eXrayTestExec, tests:auxTestExec};
         sendResult2Xray(xrayUrl,JSON.stringify(output4XRayCucumber))
         .then(postData => {   
             if (JSON.stringify(jsonpath.query(postData,'status')) == '[200]'){
                 console.log(`Test Results succesfully uploaded to Test Execution: ${jsonpath.query(postData,'data.key')}`);
             }
         })
         .catch(error => {
             console.log(`Test Results upload failed: ${jsonpath.query(error.response,'status')} ${jsonpath.query(error.response,'statusText')}`);
         });
     }else if (eXrayTestPlan){
         let dateSummary = 
         today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();
            if (eXrayTestPLanSummary) {
                dateSummary = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds()+' '+eXrayTestPLanSummary;
            }
         const auxTestPlan = await processNDJSON4CucumberXRayReport();
         testPlanKeyVar = {testPlanKey:eXrayTestPlan, summary:dateSummary};
         output4XRayCucumber = {info:testPlanKeyVar, tests:auxTestPlan};   
         sendResult2Xray(xrayUrl, JSON.stringify(output4XRayCucumber))
         .then(postData => {    
             if(JSON.stringify(jsonpath.query(postData,'status')) == '[200]'){
                 console.log(`Test results succesfully uploaded to test Plan: ${eXrayTestPlan}`);
                 console.log(`Look Test results in new created test execution: ${jsonpath.query(postData,'data.key')}`);
             }
         })
         .catch(error => {
             console.log(`Test Results upload failed: ${jsonpath.query(error.response,'status')} ${jsonpath.query(error.response,'statusText')}`);
         });
     }else{
         const auxOnlyTest = await processNDJSON4CucumberXRayReport();
         output4XRayCucumber = {tests:auxOnlyTest};                        
         }
 
     // Write a new file report json parsed 
     fs.writeFile('packages/cucumber/output/cucumber4xray.json', 
     JSON.stringify(output4XRayCucumber), (err:any) => {
         if (err) throw err;
         console.log('New Report created and saved');
     });
 
 }
 
     finalJSON4XRAY();
 
 