import { When } from '@cucumber/cucumber';
import axiosRequest  from '../utils/axiosUtils';
import { RestObject } from "../rest/restObject";
import { CustomWorld } from "../world";
import { searchRestObject } from "../utils/restObjectUtils";
import {baseUrl} from "../globals";



When('I send {string} {string} request to {string}', async function (this: CustomWorld, method:string, api:string, path:string) {
  const data:any = searchRestObject(api, this.restObjects, 'request');
  const url:string = `${baseUrl}${path}`;

  this.restObjects.push(new RestObject(api, await axiosRequest(method, url, data), 'response'));
});
