export class GitpodWorkspaceDTO {
  workspaceId!: string;
  projectCode!: string;
  traineeLabId!: Number;
  clusterHost!: string

  constructor(projectCode: string, traineeLabId: Number, clusterHost: string,workspaceId:string) {
    this.workspaceId = workspaceId;
    this.projectCode = projectCode;
    this.traineeLabId = traineeLabId;
    this.clusterHost = clusterHost;
  }
}
