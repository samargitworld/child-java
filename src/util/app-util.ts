const axios = require("axios");
import { HttpService } from "../service/http-service";
import { AxiosError } from "axios";
import { PluginErrorLogDTO } from "../dto/request/plugin-error-log-dto";
import { InternConstants } from "./intern-constants";
import { RestConstants } from "./rest-constants";
import * as vscode from "vscode";
import { CloudLabExtensionDTO } from "../dto/request/cloud-lab-extension-dto";
import { getContext } from "../extension";
import { LocalStorageService } from "./local-storage";

export class AppUtil {
  public static async logError(
    context: vscode.ExtensionContext,
    error: AxiosError,
    action: string
  ) {
    let errorFromPlugin = new PluginErrorLogDTO(
      InternConstants.getRevproWorkspaceId(context),
      InternConstants.getGitpodWorkspaceId(),
      error,
      action,
      this.getUTCDate()
    );
    await axios.post(RestConstants.ERROR_FROM_PLUGIN, errorFromPlugin, {
      headers: HttpService.getHeaders(),
    });
  }
  public static getUTCDate() {
    return new Date(
      new Date().getTime() + new Date().getTimezoneOffset() * 60000
    );
  }

  public static generateTraceId() {
    const timestamp: string = Date.now().toString(16);
    const randomId: string = Math.random().toString(16).substring(2, 12); 
    return timestamp + randomId;
  }

  public static async sendExtensionLogToRevPro(data:any,revproWorkspaceId:Number,message:string){
    const context = getContext();
    let storageManager = new LocalStorageService(context.workspaceState);
    let cloudLabExtensionLogDTO = new CloudLabExtensionDTO();
       cloudLabExtensionLogDTO.data = data;
       cloudLabExtensionLogDTO.revproWorkspaceId=  revproWorkspaceId;
       cloudLabExtensionLogDTO.message = message;
       cloudLabExtensionLogDTO.type = "Java"
       cloudLabExtensionLogDTO.traceId = storageManager.getValue('traceId');
        await axios.post(RestConstants.PRODUCE_EXTENSION_LOG,cloudLabExtensionLogDTO,{
          headers: HttpService.getHeaders(),
        });
  }
}
