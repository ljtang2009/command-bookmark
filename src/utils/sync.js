const { getChildren, checkData } = require('./storage')
const vscode = require('vscode')
const is = require('@sindresorhus/is')
const fs = require('fs-extra')
const path = require('path')
const { extensionNameSpace } = require('./constant')
const i18n = require('./i18n')

async function exportData(context) {
  const uris = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
  })
  if (!is.nullOrUndefined(uris) && uris.length > 0) {
    const fsPath = path.resolve(uris[0].fsPath, `${extensionNameSpace}.json`)
    const data = getChildren(context)
    await fs.outputJson(fsPath, data)
    vscode.window.showInformationMessage(
      `${i18n.localize(
        'commandBookmark.export.informationMessage.success'
      )}${fsPath}`
    )
  }
}

async function saveData(context, data) {
  await context.globalState.update(extensionNameSpace, data)
  vscode.window.showInformationMessage(
    `${i18n.localize('commandBookmark.import.informationMessage.success')}`
  )
}

async function importData(context) {
  const uris = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    filters: {
      JSON: ['json'],
    },
  })
  if (!is.nullOrUndefined(uris) && uris.length > 0) {
    let data
    try {
      data = await fs.readJson(uris[0].fsPath)
    } catch (err) {
      vscode.window.showErrorMessage(err.message)
    }
    if (!is.nullOrUndefined(data)) {
      const errorMessage = checkData(data, true)
      if (!is.nullOrUndefined(errorMessage)) {
        vscode.window.showErrorMessage(errorMessage)
      } else {
        const oldData = getChildren(context)
        if (!is.nullOrUndefined(oldData) && oldData.length > 0) {
          const messageResult = await vscode.window.showWarningMessage(
            i18n.localize('commandBookmark.message.confirmImport'),
            {
              modal: true,
            },
            {
              confirm: true,
              title: i18n.localize('commandBookmark.message.button.yes'),
            },
            {
              isCloseAffordance: true,
              title: i18n.localize('commandBookmark.message.button.no'),
            }
          )
          if (!is.nullOrUndefined(messageResult) && messageResult.confirm) {
            await saveData(context, data)
          }
        } else {
          await saveData(context, data)
        }
      }
    }
  }
}

module.exports = {
  exportData,
  importData,
}
