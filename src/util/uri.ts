import * as vscode from 'vscode';
import { config } from '../config'

const delimiter = `%__${config['schemeName']}__%`

export function isUriMatchAutoReaderMode(uri: vscode.Uri) {
  const isOutOfWorkspaceFolder = !vscode.workspace.workspaceFolders?.some((folder) =>
      uri.path.startsWith(folder.uri.path)
    )
  return isOutOfWorkspaceFolder 
}

export function toOriginalUri(uri: vscode.Uri) {
  if (uri.scheme !== config['schemeName']) {
    return uri
  }

  const [scheme, fragment] = uri.fragment.split(delimiter)

  const originalUri = uri.with({
    scheme,
    fragment,
  })

  return originalUri
}

export function toReaderModeUri(uri: vscode.Uri) {
  if (uri.scheme === config['schemeName']) {
    return uri
  }

  const readerModeUri = uri.with({
    scheme: config['schemeName'],
    fragment: `${uri.scheme}${delimiter}${uri.fragment}`,
  })

  return readerModeUri
}
