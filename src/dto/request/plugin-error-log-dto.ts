import { AxiosError } from "axios";

export class PluginErrorLogDTO {
  revproWorkspaceId!: number;
  gitpodWorkspaceId!: string;
  errorLog!: AxiosError;
  action!: string;
  errorOccurred!: Date;

  constructor(
    revproWorkspaceId: number,
    workspaceId: string,
    errorLog: AxiosError,
    action: string,
    errorOccurred: Date
  ) {
    this.revproWorkspaceId = revproWorkspaceId;
    this.gitpodWorkspaceId = workspaceId;
    this.errorLog = errorLog;
    this.action = action;
    this.errorOccurred = errorOccurred;
  }
}
