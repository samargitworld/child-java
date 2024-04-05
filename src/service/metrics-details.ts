import * as vscode from "vscode";
import * as path from 'path';
import { LocalStorageService } from "../util/local-storage";
import { AppConstants } from "../util/app-constants";
import { HttpService } from "./http-service";
import { AppUtil } from "../util/app-util";
import { SessionEventDTO } from "../dto/request/session-event-dto";
import { CloudLabCommitDTO } from "../dto/request/cloud-lab-commit-dto";
import { GitpodWorkspaceDTO } from "../dto/request/gitpod-workspace-dto";
import { InternConstants } from "../util/intern-constants";
import { AxiosResponse } from "../dto/response/axios-response";
import { HttpResponse } from "../dto/response/http-response";
import { InternSSHDetailDTO } from "../dto/response/intern-ssh-detail-dto";
import { AxiosError } from "axios";
import { RestConstants } from "../util/rest-constants";
import { TestCaseLogDTO } from "../dto/request/test-case-log-dto";
import { CloudLabRequestDTO } from "../dto/request/cloud-lab-request-dto";
import { VscodeEvents } from "./vscode-events";
import { getContext} from "../extension";
import { TestItem, TestRunRequest, Uri } from 'vscode';
import { loadChildren, runTests, testController } from '../controller/testController';
import { loadJavaProjects } from '../controller/utils';
import { IProgressReporter } from '../debugger.api';
import { progressProvider } from '../extension';
import { TestLevel } from '../types';
const axios = require("axios");
const fs = require("fs");
const os = require("os");
const userHomeDir = os.homedir();
let vscodeEvents = new VscodeEvents();
export class MetricsDetails {
  async writeSSHKeyPair(context: vscode.ExtensionContext) {
    if (
      !fs.existsSync(userHomeDir + AppConstants.PUBLIC_KEY_PATH) &&
      !fs.existsSync(userHomeDir + AppConstants.PRIVATE_KEY_PATH)
    ) {
      await axios
        .get(RestConstants.FETCH_SSH_DATA, {
          params: { internId: InternConstants.internId },
          headers: HttpService.getHeaders(),
        })
        .then(
          (response: AxiosResponse) => {
            this.writeSshKeyResponse(response, context);
          },
          (error: AxiosError) => {
            AppUtil.logError(
              context,
              error,
              AppConstants.ERROR_IN_FETCHING_SSH_KEYS
            );
          }
        );
    }
  }

  writeSshKeyResponse(
    response: AxiosResponse,
    context: vscode.ExtensionContext
  ) {
    let httpResponse: HttpResponse = response.data;
    let internSshDetailDto: InternSSHDetailDTO = httpResponse.data;
    fs.writeFile(
      userHomeDir + AppConstants.PUBLIC_KEY_PATH,
      internSshDetailDto.publicKey,
      function (error: AxiosError) {
        if (error) {
          AppUtil.logError(
            context,
            error,
            AppConstants.ERROR_IN_WRITING_PUBLIC_KEY
          );
        }
      }
    );
    fs.writeFile(
      userHomeDir + AppConstants.PRIVATE_KEY_PATH,
      internSshDetailDto.privateKey,
      function (error: AxiosError) {
        if (error) {
          AppUtil.logError(
            context,
            error,
            AppConstants.ERROR_IN_WRITING_PRIVATE_KEY
          );
        }
      }
    );
  }

  async sendSessionStartOrEndEvent(
    context: vscode.ExtensionContext,
    eventName: string
  ) {
    let workspaceStorageManager = new LocalStorageService(
      context.workspaceState
    );
    /* To send the session start or end event to revpro */
    let sessionStartOrEndEvent: SessionEventDTO[] = [];
    sessionStartOrEndEvent.push(
      new SessionEventDTO(eventName, AppUtil.getUTCDate())
    );
    let cloudLabRequestDTO = new CloudLabRequestDTO();
    cloudLabRequestDTO.revproWorkspaceId =
      InternConstants.getRevproWorkspaceId(context);
    cloudLabRequestDTO.gitpodWorkspaceId = InternConstants.getGitpodWorkspaceId();
    cloudLabRequestDTO.projectCode = InternConstants.getProjectCode();
    if(workspaceStorageManager.getValue("SESSION_DATA_ID") !== AppConstants.UNDEFINED){
      cloudLabRequestDTO.cloudLabSessionDataId = Number(workspaceStorageManager.getValue("SESSION_DATA_ID"));
     }
     cloudLabRequestDTO.cloudLabSessionDetailsDTO = sessionStartOrEndEvent;

    await axios
      .post(RestConstants.SAVE_SESSION_DETAILS, cloudLabRequestDTO, {
        headers: HttpService.getHeaders(),
      })
      .then(
        (sessionDataResponse: AxiosResponse) => {
          let httpResponse: HttpResponse = sessionDataResponse.data;
          if(workspaceStorageManager.getValue("SESSION_DATA_ID") === AppConstants.UNDEFINED || workspaceStorageManager.getValue("SESSION_DATA_ID") !== httpResponse.data){
            workspaceStorageManager.setValue("SESSION_DATA_ID",httpResponse.data);
          }
        },
        (error: AxiosError) => {
          AppUtil.logError(
            context,
            error,
            AppConstants.ERROR_IN_SENDING_START_OR_END_EVENT
          );
        }
      );
  }

  public async saveWorkspaceDetails(context: vscode.ExtensionContext) {
    let workspaceStorageManager = new LocalStorageService(
      context.workspaceState
    ); 
    if (
      workspaceStorageManager.getValue("revproWorkspaceId") ===
      AppConstants.UNDEFINED || workspaceStorageManager.getValue("gitpodWorkspaceId") !== InternConstants.getGitpodWorkspaceId()
      || workspaceStorageManager.getValue("gitpodClusterHost") === AppConstants.UNDEFINED
    ) {
      /* To save the workspace details to revpro */
      let gitpodWorkspace = new GitpodWorkspaceDTO(        
        InternConstants.getProjectCode(),
        InternConstants.getTraineeCodingLabId(),
        InternConstants.getGitpodClusterHost(),
        InternConstants.getGitpodWorkspaceId(),
      );
      workspaceStorageManager.setValue("gitpodWorkspaceId",InternConstants.getGitpodWorkspaceId());
      workspaceStorageManager.setValue("gitpodClusterHost", InternConstants.getGitpodClusterHost())
      await axios
        .put(RestConstants.SAVE_WORKSPACE_DETAILS, gitpodWorkspace, {
          headers: HttpService.getHeaders(),
        })
        .then(
          (workspaceSaveResponse: AxiosResponse) => {
            let httpResponse: HttpResponse = workspaceSaveResponse.data;
            workspaceStorageManager.setValue(
              "revproWorkspaceId",
              httpResponse.data
            );
            this.initiateMetricsFunctions(context);
          },
          (error: AxiosError) => {
            AppUtil.logError(
              context,
              error,
              AppConstants.ERROR_IN_SAVING_WORKSPACE
            );
          }
        );
    } else if (workspaceStorageManager.getValue("revproWorkspaceId")) {
      this.initiateMetricsFunctions(context);
    }
  }

  public async sendSessionDetails(
    context: vscode.ExtensionContext,
    sessionEventArray: SessionEventDTO[]
  ) {
    let workspaceStorageManager = new LocalStorageService(
      context.workspaceState
    );
    let cloudLabRequestDTO = new CloudLabRequestDTO();
    cloudLabRequestDTO.revproWorkspaceId =
      InternConstants.getRevproWorkspaceId(context);
    cloudLabRequestDTO.gitpodWorkspaceId = InternConstants.getGitpodWorkspaceId();
    cloudLabRequestDTO.projectCode = InternConstants.getProjectCode();
    if(workspaceStorageManager.getValue("SESSION_DATA_ID") !== AppConstants.UNDEFINED){
     cloudLabRequestDTO.cloudLabSessionDataId = Number(workspaceStorageManager.getValue("SESSION_DATA_ID"));
    }
    cloudLabRequestDTO.cloudLabSessionDetailsDTO = sessionEventArray;
    await axios
      .post(RestConstants.SAVE_SESSION_DETAILS, cloudLabRequestDTO, {
        headers: HttpService.getHeaders(),
      })
      .then(
        (sessionDataResponse: AxiosResponse) => {
          let httpResponse: HttpResponse = sessionDataResponse.data;
          if(workspaceStorageManager.getValue("SESSION_DATA_ID") === AppConstants.UNDEFINED || workspaceStorageManager.getValue("SESSION_DATA_ID") !== httpResponse.data){
            workspaceStorageManager.setValue("SESSION_DATA_ID",httpResponse.data);
          }
        },
        (error: AxiosError) => {
          AppUtil.logError(
            context,
            error,
            AppConstants.ERROR_IN_SENDING_CLOUDLAB_SESSIONS
          );
        }
      );
    sessionEventArray.splice(0, sessionEventArray.length);
  }

  public async sendCommitDetails(context: vscode.ExtensionContext) {
    let storageManager = new LocalStorageService(context.workspaceState);
    const commitLogFile = fs.readFileSync(
      InternConstants.getGitRepoRoots() + AppConstants.COMMIT_LOG_FILE_PATH,
      { encoding: "utf8", flag: "r" }
    );
    let commitFileData: string[] = commitLogFile?.split("\n");
    if (commitFileData?.length) {
      let cloudLabCommitData: CloudLabCommitDTO =
        this.setCloudLabCommitDetails(commitFileData);

      let cloudLabRequestDTO = new CloudLabRequestDTO();
      cloudLabRequestDTO.revproWorkspaceId =
        InternConstants.getRevproWorkspaceId(context);
      cloudLabRequestDTO.gitpodWorkspaceId = InternConstants.getGitpodWorkspaceId();
      cloudLabRequestDTO.projectCode = InternConstants.getProjectCode();
      cloudLabRequestDTO.cloudLabCommitDetailsDTO = cloudLabCommitData;
      let lastCommitSha = storageManager.getValue("lastCommitSha")
        ? storageManager.getValue("lastCommitSha")
        : AppConstants.UNDEFINED;
      if (
        cloudLabCommitData.commitSha !== null &&
        lastCommitSha !== cloudLabCommitData.commitSha
      ) {
        await axios
        .patch(RestConstants.UPDATE_COMMIT_STATUS, cloudLabRequestDTO, {
          headers: HttpService.getHeaders(),
        })
        .then(
          () => {},
          (error: AxiosError) => {
            AppUtil.logError(
              context,
              error,
              AppConstants.ERROR_IN_UPDATING_CLOUDLAB_COMMIT_STATUS
            );
          }
        );
        storageManager.setValue("lastCommitSha", cloudLabCommitData.commitSha);
        storageManager.setValue("traceId", AppUtil.generateTraceId());
        AppUtil.sendExtensionLogToRevPro(cloudLabRequestDTO,cloudLabRequestDTO.revproWorkspaceId,"Before TestCaseRun");
        await this.runTestCasesAfterCommit(cloudLabRequestDTO);
        AppUtil.sendExtensionLogToRevPro(cloudLabRequestDTO,cloudLabRequestDTO.revproWorkspaceId,"After TestCaseRun");

        await axios
          .post(RestConstants.SAVE_COMMIT_DETAILS, cloudLabRequestDTO, {
            headers: HttpService.getHeaders(),
          })
          .then(
            () => {},
            (error: AxiosError) => {
              AppUtil.logError(
                context,
                error,
                AppConstants.ERROR_IN_SENDING_CLOUDLAB_COMMITS
              );
            }
          );
      }
    }
  }

  setCloudLabCommitDetails(commitFileData: string[]): CloudLabCommitDTO {
    let cloudLabCommitDetails = new CloudLabCommitDTO();
    cloudLabCommitDetails.commitedTime = AppUtil.getUTCDate();
    cloudLabCommitDetails.gitUserName = InternConstants.getGitUserName();
    cloudLabCommitDetails.repositoryUrl =
      InternConstants.getGitpodWorkpsaceContextUrl();
    cloudLabCommitDetails.commitSha = commitFileData[0]?.includes(
      AppConstants.COMMIT_PATTERN
    )
      ? commitFileData[0]?.replace(AppConstants.COMMIT_PATTERN, "")
      : null;
    if (cloudLabCommitDetails.commitSha !== null) {
      cloudLabCommitDetails.commitMessage = commitFileData[4]?.trimStart();
      let commitFileActions = commitFileData[6]?.split(",");
      if (commitFileActions?.length) {
        cloudLabCommitDetails.filesChanged = Number(
          commitFileActions[0]?.includes(AppConstants.FILE)
            ? commitFileActions[0]
                ?.replace(AppConstants.FILE, "")
                .replace(AppConstants.FILE_CHANGED, "")
                .replace("s", "")
                .trimStart()
            : 0
        );

        cloudLabCommitDetails.insertions = Number(
          commitFileActions[1]?.includes(AppConstants.INSERTION)
            ? commitFileActions[1]
                ?.replace(AppConstants.INSERTION, "")
                .replace("s", "")
                .replace("(+)", "")
                .trimStart()
            : 0
        );
        cloudLabCommitDetails.deletions = Number(
          commitFileActions[2]?.includes(AppConstants.DELETION)
            ? commitFileActions[2]
                ?.replace(AppConstants.DELETION, "")
                .replace("s", "")
                .replace("(-)", "")
                .trimStart()
            : 0
        );
        cloudLabCommitDetails.lineCount =
          Number(cloudLabCommitDetails.insertions) -
          Number(cloudLabCommitDetails.deletions);
      }
    }
    return cloudLabCommitDetails;
  }
  fileToBytes = (fileText: string): number[] => {
    const buffer = Buffer.from(fileText, "utf8");
    const fileResult = Array(buffer.length);
    for (let i = 0; i < buffer.length; ++i) {
      fileResult[i] = buffer[i];
    }
    return fileResult;
  };

  constructTestCaseResult(cloudLabRequestDTO:CloudLabRequestDTO,testCaseRunMesssage:string, stackTrace:string){
    const fileInBytes: number[] = this.fileToBytes(stackTrace);
    let testCaseLog = new TestCaseLogDTO(
      AppConstants.TESTCASE_LOG_FILE_PATH,
      testCaseRunMesssage,
      fileInBytes,
      true
    );
    if(cloudLabRequestDTO!==null && cloudLabRequestDTO!==undefined){
      AppUtil.sendExtensionLogToRevPro(null,cloudLabRequestDTO.revproWorkspaceId,"Construct test case result in metricDetails");
    }
    cloudLabRequestDTO.cloudLabTestcasesDTO = testCaseLog;
  }
  async sendTestCaseResult(testCaseRunMesssage:string, stackTrace:string){
    const ext = getContext();
    const fileInBytes: number[] = this.fileToBytes(stackTrace);
    let testCaseLog = new TestCaseLogDTO(
      AppConstants.TESTCASE_LOG_FILE_PATH,
      testCaseRunMesssage,
      fileInBytes,
      false
    );
    let cloudLabRequestDTO = new CloudLabRequestDTO();
    cloudLabRequestDTO.revproWorkspaceId =
      InternConstants.getRevproWorkspaceId(ext);
    cloudLabRequestDTO.projectCode = InternConstants.getProjectCode();
    cloudLabRequestDTO.cloudLabTestcasesDTO = testCaseLog;
    await axios
        .post(RestConstants.SEND_TESTCASE_LOG, cloudLabRequestDTO, {
          headers: HttpService.getHeaders(),
        })
        .then(
          () => {},
          (error: AxiosError) => {
            AppUtil.logError(
              ext,
              error,
              AppConstants.ERROR_IN_SENDING_TEST_CASES_LOG
            );
          }
        );
  }
  initiateMetricsFunctions(vscodeContext: vscode.ExtensionContext) {
    let context = getContext();
    let workspaceStorageManager = new LocalStorageService(context.workspaceState);
    if(workspaceStorageManager.getValue(AppConstants.IS_GITPOD)){
      /* To retrieve SSH key from revpro to ease out the providing permissions process while commit the changes */
      this.writeSSHKeyPair(vscodeContext);
    }
    /* To send the session start event to revpro */
    this.sendSessionStartOrEndEvent(vscodeContext, AppConstants.SESSION_START);
    /* Record every Vscode events triggered by the user */
    vscodeEvents.trackVscodeEvents();
    /* To send active session events to revpro at certain interval */
    vscodeEvents.captureSessionEventsAtCertainInterval(vscodeContext);
    /* To send commit details and test cases result after commit to revpro at certain interval */
    vscodeEvents.captureCommitEventsAtCertainInterval(vscodeContext);
    
     if(workspaceStorageManager.getValue(AppConstants.IS_GITPOD)){
       /* To disable rename and delete test files */
       vscodeEvents.checkTestFilesManipulation(vscodeContext);
     }
   
  }
  async runTestCasesAfterCommit(cloudLabRequestDTO:CloudLabRequestDTO) : Promise<void>{
    const testLevel: TestLevel =  4;
    let isDebug: boolean = false;
    const isHierarchicalMode: boolean = false;
    const progressReporter: IProgressReporter | undefined = progressProvider?.createProgressReporter('Run Test');
    progressReporter?.report('Searching tests...');
    const tests: TestItem[] = [];
     if (testLevel === TestLevel.Package) {
        if (!testController?.items.size) {
            await loadJavaProjects();
        }
        if(fs.existsSync(InternConstants.getGitRepoRoots()?.concat(AppConstants.POM_FILE_PATH))){
            const pomFile = fs.readFileSync(
                 InternConstants.getGitRepoRoots()+ AppConstants.POM_FILE_PATH,
                { encoding: "utf8", flag: "r" }
              ); 
        let pomFileData : string[] = pomFile?.split(AppConstants.ARTIFACT); 
        const projectName: string =pomFileData[1].replace(">","").replace("</","");
        const projectItem: TestItem | undefined = testController!.items.get(projectName);
        if (!projectItem) {
            return;
        }
        await loadChildren(projectItem);
        let nodeFsPath: string = Uri.parse(InternConstants.getGitRepoRoots()+AppConstants.TEST_FOLDER_PACKAGE).fsPath;
        let context = getContext();
        let workspaceStorageManager = new LocalStorageService(context.workspaceState);
        if(!workspaceStorageManager.getValue(AppConstants.IS_GITPOD)){
          let path :string = InternConstants.getGitRepoRoots().concat(AppConstants.TEST_FOLDER_PACKAGE)
          if(os.type()!==undefined && os.type().startsWith("Win")){
            nodeFsPath = path.replaceAll("/","\\");
          }
        }
        projectItem.children.forEach((child: TestItem) => {
            const itemPath: string = child.uri?.fsPath || '';
            if (isHierarchicalMode || testLevel === TestLevel.Package) {
                /* if the selected node is a package root or the view is in hierarchical mode,
                 all the test items whose path start from the path of the selected node will be added */
                if (itemPath.startsWith(nodeFsPath)) {
                    tests.push(child);
                }
            } else {
                /* in flat mode, we require the paths exact match */
                if (path.relative(itemPath, nodeFsPath) === '') {
                    tests.push(child);
                }
            }
        });
    }
    }
    
    const request: TestRunRequest = new TestRunRequest(tests, undefined);
    if(cloudLabRequestDTO!==null && cloudLabRequestDTO!==undefined){
      AppUtil.sendExtensionLogToRevPro(null,cloudLabRequestDTO.revproWorkspaceId,"Run test from metric details");
      }
    await runTests(request, { progressReporter, isDebug },cloudLabRequestDTO);
    }
}
