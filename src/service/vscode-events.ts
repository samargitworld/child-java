import { MetricsDetails } from "./metrics-details";
import { AppConstants } from "../util/app-constants";
import * as vscode from "vscode";
import { SessionEventDTO } from "../dto/request/session-event-dto";
import { InternConstants } from "../util/intern-constants";
import { AppUtil } from "../util/app-util";
import { compareSourceTestFilesAndReplace} from "../extension";
const fs = require("fs");

let sessionEventArray: SessionEventDTO[] = [];
let eventNamesList: string[] = [];
var sessionIntervalTimer: NodeJS.Timer;
var commitIntervalTimer: NodeJS.Timer;
var testFileReplaceIntervalTimer: NodeJS.Timer;

export class VscodeEvents {
  public trackVscodeEvents(this: any) {
    let subscriptions: vscode.Disposable[] = [];

    /* To track debug session activities */
    vscode.debug.onDidStartDebugSession(
      () => {
        this.onEvent(AppConstants.ON_DEBUG_START);
      },
      this,
      subscriptions
    );
    vscode.debug.onDidTerminateDebugSession(
      () => {
        this.onEvent(AppConstants.ON_DEBUG_TERMINATE);
      },
      this,
      subscriptions
    );
    vscode.debug.onDidChangeBreakpoints(
      () => {
        this.onEvent(AppConstants.ON_CHANGE_BREAK_POINTS);
      },
      this,
      subscriptions
    );

    /* To track workspace session activities */
    vscode.workspace.onDidCreateFiles(
      () => {
        this.onEvent(AppConstants.ON_CREATE_FILE);
      },
      this,
      subscriptions
    );
    vscode.workspace.onDidDeleteFiles(
      () => {
        this.onEvent(AppConstants.ON_DELETE_FILE);
      },
      this,
      subscriptions
    );
    vscode.workspace.onDidRenameFiles(
      () => {
        this.onEvent(AppConstants.ON_RENAME_FILE);
      },
      this,
      subscriptions
    );
    vscode.workspace.onDidSaveTextDocument(
      () => {
        this.onEvent(AppConstants.ON_SAVE_FILE);
      },
      this,
      subscriptions
    );
    vscode.workspace.onDidChangeTextDocument(
      () => {
        this.onEvent(AppConstants.ON_CHANGE_FILE);
      },
      this,
      subscriptions
    );

    vscode.Disposable.from(...subscriptions);
  }
  public captureSessionEventsAtCertainInterval(context: vscode.ExtensionContext) {
    let metricsDetails = new MetricsDetails();
    sessionIntervalTimer = setInterval(() => {
      if (sessionEventArray.length) {
        /* To send active session events to revpro at certain interval */
        metricsDetails.sendSessionDetails(context, sessionEventArray);
        eventNamesList.splice(0, eventNamesList.length);
      }
    }, AppConstants.SESSION_PLUGIN_INTERVAL);
   
  }
  public captureCommitEventsAtCertainInterval(context: vscode.ExtensionContext) {
    let metricsDetails = new MetricsDetails();
    commitIntervalTimer = setInterval(() => {
      if (
        fs.existsSync(InternConstants.getGitRepoRoots() + AppConstants.COMMIT_LOG_FILE_PATH)){
        /* To send commit details to revpro at certain interval */
        metricsDetails.sendCommitDetails(context);
      }
    }, AppConstants.COMMIT_PLUGIN_INTERVAL);
  }

  public checkTestFilesManipulation(context: vscode.ExtensionContext) {
    testFileReplaceIntervalTimer = setInterval(() => {
      if (
        fs.existsSync(InternConstants.getGitRepoRoots() + AppConstants.TEST_FOLDER_PACKAGE)){
          /* To comapare the source test files and current test files in gitpod */
          compareSourceTestFilesAndReplace(context)
      }
    }, AppConstants.TEST_FILE_REPLACE_INTERVAL);
  }

  public onEvent(event: string) {
    let activeSessionEvent: SessionEventDTO = {
      sessionEvent: event,
      sessionActiveTime: AppUtil.getUTCDate(),
    };

    if (!eventNamesList.includes(activeSessionEvent.sessionEvent)) {
      sessionEventArray.push(activeSessionEvent);
      eventNamesList.push(activeSessionEvent.sessionEvent);
    }
  }

  clearInterval() {
    clearInterval(sessionIntervalTimer);
    clearInterval(commitIntervalTimer);
    clearInterval(testFileReplaceIntervalTimer);

  }
}
