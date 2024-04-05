import * as vscode from "vscode";
import { LocalStorageService } from "./local-storage";
import { getContext} from "../extension";
import { AppConstants } from "./app-constants";

const BASE_64 = "base64";
const BINARY = "binary";

export class InternConstants {
  static internId: number;

  static getTraineeCodingLabId(): Number {
    return 1;
   }
   
   static getProjectCode(): string {
    //  let context = getContext();
    //  let workspaceStorageManager = new LocalStorageService(context.workspaceState);
    //  return workspaceStorageManager.getValue(AppConstants.IS_GITPOD) ? 
    //  Buffer.from(process.env.PROJECT_TYPE!, BASE_64).toString(BINARY):
    //  Buffer.from(workspaceStorageManager.getValue("PROJECT_TYPE")!, BASE_64).toString(BINARY);
    return "PT001";
   }

  static setInternId(internId: number) {
    this.internId = internId;
  }

  static getGitpodWorkspaceId() {
    let context = getContext();
     let workspaceStorageManager = new LocalStorageService(context.workspaceState);
     return workspaceStorageManager.getValue(AppConstants.IS_GITPOD) ? process.env.GITPOD_WORKSPACE_ID! : workspaceStorageManager.getValue("projectPath"); 
  }

  static getGitpodClusterHost() {
    let context = getContext();
     let workspaceStorageManager = new LocalStorageService(context.workspaceState);
     return workspaceStorageManager.getValue(AppConstants.IS_GITPOD) ? process.env.GITPOD_WORKSPACE_CLUSTER_HOST! : "";
  }

  static getRevproWorkspaceId(context: vscode.ExtensionContext) {
    let workspaceStorageManager = new LocalStorageService(
      context.workspaceState
    );
    return Number(workspaceStorageManager.getValue("revproWorkspaceId"));
  }

  static getGitpodWorkpsaceContextUrl() {
    let context = getContext();
    let workspaceStorageManager = new LocalStorageService(
      context.workspaceState
    );
    return workspaceStorageManager.getValue(AppConstants.IS_GITPOD) ? process.env.GITPOD_WORKSPACE_CONTEXT_URL! : workspaceStorageManager.getValue("GITPOD_WORKSPACE_CONTEXT_URL");
  }

  static getGitUserName() {
    let context = getContext();
    let workspaceStorageManager = new LocalStorageService(
      context.workspaceState
    );
    if(workspaceStorageManager.getValue(AppConstants.IS_GITPOD)){
      return process.env.GITPOD_GIT_USER_NAME!;
     }
     let contextUrl = workspaceStorageManager.getValue("GITPOD_WORKSPACE_CONTEXT_URL");
     let userName = contextUrl.substring(19,contextUrl.lastIndexOf("/"))
     return userName;
  }

  static getGitRepoRoots() {
    let context = getContext();
    let workspaceStorageManager = new LocalStorageService(
      context.workspaceState
    );
    return workspaceStorageManager.getValue(AppConstants.IS_GITPOD) ? process.env.GITPOD_REPO_ROOTS! : workspaceStorageManager.getValue("projectPath");
  }
}
