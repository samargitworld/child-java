export class CloudLabCommitDTO {
  gitUserName!: string;
  repositoryUrl!: string;
  commitSha!: string | null;
  commitMessage!: string;
  filesChanged!: Number;
  insertions!: Number;
  deletions!: Number;
  lineCount!: Number;
  commitedTime!: Date;
}
