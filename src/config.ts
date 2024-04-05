import * as vscode from 'vscode';
const packageJson = require("../package.json");

type ConfigDefinitionToConfig<
  T extends Record<string, any>,
  S extends string = '',
  C extends Record<string, any> = T['properties']
> = {
  [K in keyof C as K extends `${S}${infer P}`
    ? P
    : never]: C[K]['properties'] extends Record<string, any>
    ? ConfigDefinitionToConfig<C[K]>
    : C[K]['default']
}

type Config = ConfigDefinitionToConfig<
  typeof packageJson.contributes.configuration,
  'reader-mode.'
> & {
  schemeName: string
  toggleFileReaderModeCommandId: string
  toggleWorkspaceReaderModeCommandId: string
  hijackedLanguageIds: string[]
}

export const config = new Proxy<Config>({} as any, {
  get(target, key: keyof Config) {
    switch (key) {
      case 'schemeName':
        return packageJson.name
      default:
        console.log(target)
        return vscode.workspace.getConfiguration(packageJson.name).get(key)
    }
  },
})
