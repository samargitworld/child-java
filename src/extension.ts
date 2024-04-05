// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as path from 'path';
import * as vscode from 'vscode';
import { commands, DebugConfiguration, Event, Extension, ExtensionContext, extensions, TestItem, TextDocument, TextDocumentChangeEvent, TextEditor, Uri, window, workspace, WorkspaceFoldersChangeEvent } from 'vscode';
import { addReplacementRule, dispose as disposeTelemetryWrapper, initializeFromJsonFile, instrumentOperation, instrumentOperationAsVsCodeCommand } from 'vscode-extension-telemetry-wrapper';
import { navigateToTestOrTarget } from './commands/navigation/navigationCommands';
import { generateTests } from './commands/generationCommands';
import { runTestsFromJavaProjectExplorer } from './commands/projectExplorerCommands';
import { refreshExplorer, runTestsFromTestExplorer } from './commands/testExplorerCommands';
import { openStackTrace } from './commands/testReportCommands';
import { enableTests } from './commands/testDependenciesCommands';
import { Context, ExtensionName, JavaTestRunnerCommands, VSCodeCommands } from './constants';
import { createTestController, testController, watchers } from './controller/testController';
import { updateItemForDocument, updateItemForDocumentWithDebounce } from './controller/utils';
import { IProgressProvider } from './debugger.api';
import { initExpService } from './experimentationService';
import { disposeCodeActionProvider, registerTestCodeActionProvider } from './provider/codeActionProvider';
import { testSourceProvider } from './provider/testSourceProvider';
import { registerAskForChoiceCommand, registerAdvanceAskForChoice, registerAskForInputCommand } from './commands/askForOptionCommands';
import { AxiosError } from "axios";
import { AxiosResponse } from "./dto/response/axios-response";
import { CloudLabTokenDTO } from "./dto/response/cloud-lab-token-dto";
import { HttpResponse } from "./dto/response/http-response";
import { HttpService } from "./service/http-service";
import { MetricsDetails } from "./service/metrics-details";
import { VscodeEvents } from "./service/vscode-events";
import { AppUtil } from "./util/app-util";
import { AppConstants } from "./util/app-constants";
import { InternConstants } from "./util/intern-constants";
import { RestConstants } from "./util/rest-constants";
import { LocalStorageService } from './util/local-storage';
import { AutoReaderModeRegister } from './feature-register/auto-reader-mode';
import { FileSystemRegister } from './feature-register/file-system';

const axios = require("axios");
const fs = require('fs');

export let extensionContext: ExtensionContext;
let componentsRegistered: boolean = false;
let metricsDetails = new MetricsDetails();
let vscodeEvents = new VscodeEvents();
export async function activate(context: ExtensionContext): Promise<void> {

    extensionContext = context;
    await readEnvVariablesFromFile();

let workspaceStorageManager = new LocalStorageService(
    context.workspaceState
  );

if(workspaceStorageManager.getValue(AppConstants.IS_GITPOD)){
    /* To backup source test files */
    doBackUpSourceTestFiles()
    /* To disable testcase manipulation - reader mode */
    doDisableTestCaseManipulation(extensionContext)
    /* test runner for java */
}


 doActivate(extensionContext);

 /* Unsecure call to revpro to fetch plugin access key which will be used as headers to save session and commit details to revpro */
  await axios
    .get(RestConstants.DECRYPT_CLOUDLAB_TOKEN, {
      params: { token: RestConstants.getAccessToken() },
    })
    .then(initiateWorkspaceTrackingResponse, (error: AxiosError) => {
      AppUtil.logError(
        extensionContext,
        error,
        AppConstants.ERROR_IN_FETCHING_ACCESS_KEY
      );
    });

    await initializeFromJsonFile(context.asAbsolutePath('./package.json'), { firstParty: true });
    addTelemetryDisallowedPattern();
    await initExpService(context);
    await instrumentOperation('activation', doActivate)(context);

    }

    export async function readEnvVariablesFromFile(){
    let context = extensionContext;
    const workspaceFolders = vscode.workspace.workspaceFolders;
    let projectPath = '';
    let workspaceStorageManager = new LocalStorageService(
        context.workspaceState
      );
    if(workspaceFolders !==undefined && workspaceFolders?.length>0){
        projectPath = workspaceFolders[0].uri.fsPath;
        projectPath = projectPath.replace(/\\/g, '/')
        workspaceStorageManager.setValue("projectPath",projectPath);
    }

    let filepath = projectPath+AppConstants.ENV_FILE;
    workspaceStorageManager.setValue(AppConstants.IS_GITPOD,true);
    if(fs.existsSync(filepath))
    {
        workspaceStorageManager.setValue(AppConstants.IS_GITPOD,false);
        let envFileContent =  fs.readFileSync(filepath,{ encoding: "utf8", flag: "r" });
        const jsonData = JSON.parse(envFileContent);
        console.log(jsonData)
        for (const key in jsonData) {
            if (jsonData.hasOwnProperty(key)) {
                const value = jsonData[key];
                workspaceStorageManager.setValue(key,value);
            }
        }
    }
}
export function getContext():vscode.ExtensionContext {  
    return extensionContext;
  }

export async function deactivate(): Promise<void> {
    /* To send the session end event to revpro */
    await metricsDetails.sendSessionStartOrEndEvent(
      extensionContext,
      AppConstants.SESSION_END
    );
    vscodeEvents.clearInterval();
    disposeCodeActionProvider();
    await disposeTelemetryWrapper();
    testController?.dispose();
    for (const disposable of watchers) {
        disposable.dispose();
    }
}
function doBackUpSourceTestFiles(){   
    if(fs.existsSync(InternConstants.getGitRepoRoots() + AppConstants.TEST_FOLDER_PACKAGE) && !fs.existsSync(AppConstants.WORKSPACE_BACKUP)){
        fs.mkdirSync(AppConstants.WORKSPACE_BACKUP)
        fs.readdir(InternConstants.getGitRepoRoots()+AppConstants.TEST_FOLDER_PACKAGE, (_err:any, testFiles:any) => {
        if(testFiles?.length){
        testFiles.forEach((file: string) => {
          if(fs.existsSync(InternConstants.getGitRepoRoots()+AppConstants.TEST_FOLDER_PACKAGE+"/"+file))
          {
          let testFile =  fs.readFileSync(
            InternConstants.getGitRepoRoots()+AppConstants.TEST_FOLDER_PACKAGE+"/"+file,
                  { encoding: "utf8", flag: "r" }
                );
            fs.writeFile(
            AppConstants.WORKSPACE_BACKUP+file,
            testFile,
             function (error: AxiosError) {
                if (error) {
                AppUtil.logError(
                    extensionContext,
                    error,
                    AppConstants.ERROR_IN_WRITING_BACKUP_TEST_FILES
                  );
              }
            }
          );
          }
        });
    }
      });
    } 
}
export function compareSourceTestFilesAndReplace(context :ExtensionContext){
    if(fs.existsSync(AppConstants.WORKSPACE_BACKUP)){
        fs.readdir(AppConstants.WORKSPACE_BACKUP, (_err:any, testFiles:any) => {
            if(testFiles?.length){
            testFiles.forEach((file: string) => {
              if(fs.existsSync(AppConstants.WORKSPACE_BACKUP+file)){
                let sourceTestFile =  fs.readFileSync(
                    AppConstants.WORKSPACE_BACKUP+file,
                          { encoding: "utf8", flag: "r" }
                    ); 
              if(fs.existsSync(InternConstants.getGitRepoRoots()+AppConstants.TEST_FOLDER_PACKAGE+"/"+file))
              {
                let currentTestFile =  fs.readFileSync(
                        InternConstants.getGitRepoRoots()+AppConstants.TEST_FOLDER_PACKAGE+"/"+file,
                              { encoding: "utf8", flag: "r" }
                            );
                if(currentTestFile !== sourceTestFile)
                {
                    /* To replace the modified file by associate */
                replaceSourceTestFile(sourceTestFile,context,file)
                }
              }
              else{
                /* To replace the deleted file by associate */
                replaceSourceTestFile(sourceTestFile,context,file)
                }
            }
        });
        }
          });
        }  

}
function replaceSourceTestFile(sourceTestFile:any,context:ExtensionContext,file:any){
    fs.writeFile(
        InternConstants.getGitRepoRoots()+AppConstants.TEST_FOLDER_PACKAGE+"/"+file,
        sourceTestFile,
         function (error: AxiosError) {
            if (error) {
            AppUtil.logError(
                context,
                error,
                AppConstants.ERROR_IN_REPLACING_SOURCE_TEST_FILES
              );
          }
        }
      );
      vscode.window.showInformationMessage(AppConstants.NOTIFY_ASSOCIATE_NOT_TO_MANIPULATE_TEST_FILES);

}
function doDisableTestCaseManipulation(context: ExtensionContext){
    const fileSystemRegister = new FileSystemRegister(context)
    const autoReaderModeRegister = new AutoReaderModeRegister(context)
    if(vscode.window.tabGroups.activeTabGroup.activeTab?.label.includes(AppConstants.TEST_JAVA)){
        vscode.window.tabGroups.close(vscode.window.tabGroups.activeTabGroup.activeTab)
    }
    fileSystemRegister.register()
    autoReaderModeRegister.register()
}
async function initiateWorkspaceTrackingResponse(response: AxiosResponse) {
  let httpResponse: HttpResponse = response.data;
  let cloudLabTokenDTO: CloudLabTokenDTO = httpResponse.data;
  if (cloudLabTokenDTO) {
    HttpService.accessKey = cloudLabTokenDTO.cloudLabUnsecureApiAccessKey;
    InternConstants.setInternId(cloudLabTokenDTO.internId);
  }
  
  if (HttpService.accessKey) {
    metricsDetails.saveWorkspaceDetails(extensionContext); 
  } else {
    vscode.window.showInformationMessage(AppConstants.CONTACT_REVATURE);
  }
}

async function doActivate(_operationId: string, context: ExtensionContext): Promise<void> {
    const javaLanguageSupport: Extension<any> | undefined = extensions.getExtension(ExtensionName.JAVA_LANGUAGE_SUPPORT);
    if (javaLanguageSupport?.isActive) {
        const extensionApi: any = javaLanguageSupport.exports;
        if (!extensionApi) {
            return;
        }

        if (extensionApi.serverMode === LanguageServerMode.LightWeight) {
            if (extensionApi.onDidServerModeChange) {
                const onDidServerModeChange: Event<string> = extensionApi.onDidServerModeChange;
                context.subscriptions.push(onDidServerModeChange(async (mode: string) => {
                    if (mode === LanguageServerMode.Standard) {
                        testSourceProvider.clear();
                        registerComponents(context);
                    }
                }));
            }
        } else {
            await extensionApi.serverReady();
            registerComponents(context);
        }

        if (extensionApi.onDidClasspathUpdate) {
            const onDidClasspathUpdate: Event<Uri> = extensionApi.onDidClasspathUpdate;
            context.subscriptions.push(onDidClasspathUpdate(async () => {
                // workaround: wait more time to make sure Language Server has updated all caches
                setTimeout(() => {
                    testSourceProvider.clear();
                    refreshExplorer();
                }, 1000 /* ms */);
            }));
        }

        if (extensionApi.onDidProjectsImport) {
            const onDidProjectsImport: Event<Uri[]> = extensionApi.onDidProjectsImport;
            context.subscriptions.push(onDidProjectsImport(async () => {
                testSourceProvider.clear();
                refreshExplorer();
            }));
        }
    }

    const javaDebugger: Extension<any> | undefined = extensions.getExtension(ExtensionName.JAVA_DEBUGGER);
    if (javaDebugger?.isActive) {
        progressProvider = javaDebugger.exports?.progressProvider;
    }
}

function registerComponents(context: ExtensionContext): void {
    if (componentsRegistered) {
        return;
    }
    componentsRegistered = true;
    registerAskForChoiceCommand(context);
    registerAdvanceAskForChoice(context);
    registerAskForInputCommand(context);

    context.subscriptions.push(
        instrumentOperationAsVsCodeCommand(JavaTestRunnerCommands.JAVA_TEST_OPEN_STACKTRACE, openStackTrace),
        instrumentOperationAsVsCodeCommand(JavaTestRunnerCommands.RUN_TEST_FROM_EDITOR, async () => await commands.executeCommand(VSCodeCommands.RUN_TESTS_IN_CURRENT_FILE)),
        instrumentOperationAsVsCodeCommand(JavaTestRunnerCommands.DEBUG_TEST_FROM_EDITOR, async () => await commands.executeCommand(VSCodeCommands.DEBUG_TESTS_IN_CURRENT_FILE)),
        instrumentOperationAsVsCodeCommand(JavaTestRunnerCommands.JAVA_TEST_GENERATE_TESTS, ((uri: Uri, startPosition: number) => generateTests(uri, startPosition))),
        instrumentOperationAsVsCodeCommand(JavaTestRunnerCommands.RUN_FROM_TEST_EXPLORER, async (node: TestItem, launchConfiguration: DebugConfiguration) => await runTestsFromTestExplorer(node, launchConfiguration, false)),
        instrumentOperationAsVsCodeCommand(JavaTestRunnerCommands.DEBUG_FROM_TEST_EXPLORER, async (node: TestItem, launchConfiguration: DebugConfiguration) => await runTestsFromTestExplorer(node, launchConfiguration, false)),
        instrumentOperationAsVsCodeCommand(JavaTestRunnerCommands.RUN_TEST_FROM_JAVA_PROJECT_EXPLORER, async (node: any) => await runTestsFromJavaProjectExplorer(node, false /* isDebug */)),
        instrumentOperationAsVsCodeCommand(JavaTestRunnerCommands.DEBUG_TEST_FROM_JAVA_PROJECT_EXPLORER, async (node: any) => await runTestsFromJavaProjectExplorer(node, true /* isDebug */)),
        instrumentOperationAsVsCodeCommand(JavaTestRunnerCommands.GO_TO_TEST, async () => await navigateToTestOrTarget(true)),
        instrumentOperationAsVsCodeCommand(JavaTestRunnerCommands.GO_TO_TEST_SUBJECT, async () => await navigateToTestOrTarget(false)),
        instrumentOperationAsVsCodeCommand(JavaTestRunnerCommands.ENABLE_TESTS, async () => await enableTests()),
        window.onDidChangeActiveTextEditor(async (e: TextEditor | undefined) => {
            if (await isTestJavaFile(e?.document)) {
                await updateItemForDocumentWithDebounce(e!.document.uri);
            }
        }),
        workspace.onDidChangeTextDocument(async (e: TextDocumentChangeEvent) => {
            if (await isTestJavaFile(e.document)) {
                await updateItemForDocumentWithDebounce(e.document.uri);
            }
        }),
        workspace.onDidChangeWorkspaceFolders(async (e: WorkspaceFoldersChangeEvent) => {
            for (const deletedFolder of e.removed) {
                testSourceProvider.delete(deletedFolder.uri);
            }
            // workaround to wait for Java Language Server to accept the workspace folder change event,
            // otherwise we cannot find the projects in the new workspace folder.
            // TODO: this event should be notified by onDidProjectsImport, we need to fix upstream
            setTimeout(() => {
                createTestController();
            }, 1000);
        }),
    );

    registerTestCodeActionProvider();
    createTestController();
    showTestItemsInCurrentFile();
    commands.executeCommand('setContext', Context.ACTIVATION_CONTEXT_KEY, true);
}

async function isTestJavaFile(document: TextDocument | undefined): Promise<boolean> {
    if (!document?.uri || !isJavaFile(document)) {
        return false;
    }

    if (!await testSourceProvider.isOnTestSourcePath(document.uri)) {
        return false;
    }

    return true;
}

export async function showTestItemsInCurrentFile(): Promise<void> {
    if (await isTestJavaFile(window.activeTextEditor?.document)) {
        // we didn't call the debounced version to avoid first call takes a long time and expand too much
        // for the debounce window. (cpu resources are limited during activation)
        await updateItemForDocument(window.activeTextEditor!.document.uri);
    }
}

const enum LanguageServerMode {
    LightWeight = 'LightWeight',
    Standard = 'Standard',
    Hybrid = 'Hybrid',
}

export let progressProvider: IProgressProvider | undefined;

function isJavaFile(document: TextDocument): boolean {
    return path.extname(document.fileName) === '.java';
}

function addTelemetryDisallowedPattern(): void {
    addReplacementRule(/path must include project and resource name: \/.*/gi, 'Path must include project and resource name: /<REDACT>');
}
