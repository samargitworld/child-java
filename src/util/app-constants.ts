/* eslint-disable @typescript-eslint/naming-convention */

export class AppConstants {
  public static CONTACT_REVATURE =
    "Contact revature team to activate the revature-labs!";
  public static UNDEFINED = "undefined";
  public static SESSION_PLUGIN_INTERVAL = 60000;
  public static COMMIT_PLUGIN_INTERVAL = 3000;
  public static TEST_FILE_REPLACE_INTERVAL = 5000;
  public static COMMIT_LOG_FILE_PATH = "/history_log.txt";
  public static TESTCASE_LOG_FILE_PATH = "testCases_log.txt";
  public static PRIVATE_KEY_PATH = "/.ssh/id_rsa";
  public static PUBLIC_KEY_PATH = "/.ssh/id_rsa.pub";
  public static ERROR_IN_SENDING_TEST_CASES_LOG =
    "Error in sending testcases log file from Plugin to Revpro";
  public static ERROR_IN_FETCHING_ACCESS_KEY =
    "Error in fetching plugin access key from Revpro";
  public static ERROR_IN_FETCHING_SSH_KEYS =
    "Error in fetching SSH keys from Revpro";
  public static ERROR_IN_WRITING_PUBLIC_KEY =
    "Error in writing the public key response in Gitpod";
  public static ERROR_IN_WRITING_PRIVATE_KEY =
    "Error in writing the private key response in Gitpod";
  public static ERROR_IN_SENDING_START_OR_END_EVENT =
    "Error in sending session start or end event from Gitpod";
  public static ERROR_IN_SAVING_WORKSPACE =
    "Error in saving workspace details in Revpro from Gitpod";
  public static ERROR_IN_SENDING_CLOUDLAB_SESSIONS =
    "Error in sending cloud lab active session events at certain interval from Gitpod";
  public static ERROR_IN_SENDING_CLOUDLAB_COMMITS =
    "Error in saving cloud lab commit details from Gitpod";
    public static ERROR_IN_REPLACING_SOURCE_TEST_FILES =
    "Error in replacing test files modified by associate";
  public static FILE_CHANGED = "changed";
  public static INSERTION = " insertion";
  public static DELETION = " deletion";
  public static COMMIT_PATTERN = "commit ";
  public static FILE = " file";
  public static SESSION_START = "Session Started";
  public static SESSION_END = "Session Ended";
  public static ON_DEBUG_START = "onDidStartDebugSession";
  public static ON_DEBUG_TERMINATE = "onDidTerminateDebugSession";
  public static ON_CHANGE_BREAK_POINTS = "onDidChangeBreakpoints";
  public static ON_CREATE_FILE = "onDidCreateFiles";
  public static ON_DELETE_FILE = "onDidDeleteFiles";
  public static ON_RENAME_FILE = "onDidRenameFiles";
  public static ON_CHANGE_FILE = "onDidChangeTextDocument";
  public static ON_SAVE_FILE = "onDidSaveTextDocument";
  public static TEST_RUN = "Tests run: ";
  public static PASSED = ", Passed: ";
  public static FAILED = ", Failed: ";
  public static ERRORED = ", Errored: ";
  public static SKIPPED = ", Skipped: ";
  public static FAILURES = " Failures: ";
  public static ERRORS = " Errors: ";
  public static TEST_ANNOTATION = "@Test";
  public static JAVA_EXT = ".java";
  public static TEST_FOLDER_PACKAGE = "/src/test/java";
  public static ON_RUNNING = "onRunning";
  public static ON_TERMINATE = "onTerminate";
  public static POM_FILE_PATH ="/pom.xml";
  public static ARTIFACT ="artifactId";
  public static PUBLIC_VOID = "public void"
  public static VOID = "void";
  public static PRIVATE = "private";
  public static TEST_JAVA = "Test.java";
  public static WORKSPACE_BACKUP = "/workspace/testFilesBackup/";
  public static ERROR_IN_WRITING_BACKUP_TEST_FILES =
  "Error in backup the test files in Gitpod";
  public static NOTIFY_ASSOCIATE_NOT_TO_MANIPULATE_TEST_FILES =
  "You cannot delete or replace the test files";
  public static ERROR_IN_UPDATING_CLOUDLAB_COMMIT_STATUS =
  "Error in updating cloud lab commit status from gitpod";
  public static ENV_FILE = "/env.json";
  public static IS_GITPOD = "isGitpod";


}
