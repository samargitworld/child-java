import * as vscode from 'vscode';import { showReaderModeDocument } from '../action'
import { BaseRegister } from './base'
import { AppConstants } from '../util/app-constants';

// Bypass is designed to bypass files that match the rules when manually toggling.
export class AutoReaderModeRegister extends BaseRegister {
  protected doRegister() {
    this.context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (!editor) {
          return
        }

        const document = editor.document

        // Only switch to reader mode for `file` scheme.
        if (document.uri.scheme !== 'file') {
          return
        }

        if(document.uri.path.includes(AppConstants.TEST_FOLDER_PACKAGE)){
          showReaderModeDocument(document)
        }
      })
    )
  }
}
