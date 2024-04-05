export class TestCaseLogDTO {
  fileName!: string;
  testcaseMessage!: string;
  file!: number[];
  viaCommitted!: boolean;
  constructor(fileName: string, testcaseMessage: string, file: number[],viaCommitted : boolean) {
    this.fileName = fileName;
    this.testcaseMessage = testcaseMessage;
    this.file = file;
    this.viaCommitted = viaCommitted;
  }
}
