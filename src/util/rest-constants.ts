
 /* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { getContext } from '../extension';
import { LocalStorageService } from './local-storage';
import { AppConstants } from './app-constants';

 const BASE_64 = "base64";
 const BINARY = "binary";
 const fs = require('fs');

export class RestConstants {

  public static CLOUD_LAB_URL = "/apigateway/associates/secure/cloud-lab/";
  public static SEND_TESTCASE_LOG = `https://${this.getDomain()}${
    this.CLOUD_LAB_URL
  }test-case`;
  public static FETCH_SSH_DATA = `https://${this.getDomain()}/apigateway/associates/secure/interns/cloud-lab/ssh-data`;
  public static ERROR_FROM_PLUGIN = `https://${this.getDomain()}${
    this.CLOUD_LAB_URL
  }plugin-info`;
  public static SAVE_SESSION_DETAILS = `https://${this.getDomain()}${
    this.CLOUD_LAB_URL
  }session-details`;
  public static SAVE_COMMIT_DETAILS = `https://${this.getDomain()}${
    this.CLOUD_LAB_URL
  }commit-details`;
  public static SAVE_WORKSPACE_DETAILS = `https://${this.getDomain()}${
    this.CLOUD_LAB_URL
  }update/gitpod-workspace`;
  public static DECRYPT_CLOUDLAB_TOKEN = `https://${this.getDomain()}/apigateway/security/revtek/cloud-lab/decrypt-token`;
  public static UPDATE_COMMIT_STATUS = `https://${this.getDomain()}${
    this.CLOUD_LAB_URL
  }commit-status`;
  public static PRODUCE_EXTENSION_LOG = `https://${this.getDomain()}${this.CLOUD_LAB_URL}logs`;

  static getDomain(): string {
    // let encryptedDomain = this.getDomainFromFile();
    // if(encryptedDomain==""){
    //   return Buffer.from(process.env.HOST!, BASE_64).toString(BINARY);
    // }
    // return Buffer.from(encryptedDomain!, BASE_64).toString(BINARY);
    return "Dev"
  }
  static getAccessToken() {
    // let context = getContext();
    // let workspaceStorageManager = new LocalStorageService(context.workspaceState);
    // if(workspaceStorageManager.getValue(AppConstants.IS_GITPOD)){
    //   return process.env.TOKEN;
    // }
    // return workspaceStorageManager.getValue("TOKEN")!;
    return "";
  }
  static getDomainFromFile():string{
    const workspaceFolders = vscode.workspace.workspaceFolders;
    let projectPath=""
    if(workspaceFolders !== undefined && workspaceFolders?.length > 0){
        projectPath = workspaceFolders[0].uri.fsPath;
    }

    let filepath = projectPath.replace(/\\/g, '/')+AppConstants.ENV_FILE;
    if(fs.existsSync(filepath))
    {
        let envFileContent =  fs.readFileSync(filepath,{ encoding: "utf8", flag: "r" });
        const jsonData = JSON.parse(envFileContent);
         for (const key in jsonData) {
          if (jsonData.hasOwnProperty(key) && key==='HOST') {
              const value = jsonData[key];
              return value;
          }
      }
      }
        return ""
  }
}
