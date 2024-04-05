import * as vscode from "vscode";
import { AppConstants } from "./app-constants";

/* Storage mechanism to store last commit sha to compare with new commit sha generated in a log file after each commit */
export class LocalStorageService {
  constructor(private storage: vscode.Memento) {}
  public getValue(key: string) {
    return this.storage.get(key, AppConstants.UNDEFINED);
  }
  public setValue(key: string, value: any) {
    this.storage.update(key, value);
  }
}
