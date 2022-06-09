const MainViewTreeDataProvider = require('./MainViewTreeDataProvider')
const {
  extensionNameSpace,
  collapsibleStateEnums,
} = require('./utils/constant')
const vscode = require('vscode')
const saveFolder = require('./saveFolder')
const updateCollapsibleState = require('./updateCollapsibleState')
const removeNode = require('./removeNode')
const CommandEditor = require('./CommandEditor')
const is = require('@sindresorhus/is')
const runCommand = require('./runCommand')
const { exportData, importData } = require('./utils/sync')

/**
 * this method is called when your extension is activated
 * @param {*} context
 */
async function activate(context) {
  if (process.env.CLEAR_STORAGE_COMMAND_BOOKMARK) {
    await context.globalState.update(extensionNameSpace)
  }
  const mainViewTreeDataProvider = new MainViewTreeDataProvider(context)
  const view = vscode.window.createTreeView(extensionNameSpace, {
    treeDataProvider: mainViewTreeDataProvider,
    showCollapseAll: true,
    canSelectMany: true,
    dragAndDropController: mainViewTreeDataProvider,
  })
  view.onDidCollapseElement(async e => {
    await updateCollapsibleState(
      context,
      e.element.id,
      collapsibleStateEnums.collapsed
    )
  })
  view.onDidExpandElement(async e => {
    await updateCollapsibleState(
      context,
      e.element.id,
      collapsibleStateEnums.expanded
    )
  })
  context.subscriptions.push(view)

  vscode.commands.registerCommand(
    `${extensionNameSpace}.addFolder`,
    async parentNode => {
      const newElement = await saveFolder(context, parentNode)
      if (!is.nullOrUndefined(newElement)) {
        mainViewTreeDataProvider.refresh()
        await view.reveal(newElement)
        mainViewTreeDataProvider.refresh()
      }
    }
  )

  vscode.commands.registerCommand(`${extensionNameSpace}.refresh`, () =>
    mainViewTreeDataProvider.refresh()
  )

  vscode.commands.registerCommand(
    `${extensionNameSpace}.renameFolder`,
    async node => {
      await saveFolder(context, null, node)
      mainViewTreeDataProvider.refresh()
    }
  )

  vscode.commands.registerCommand(
    `${extensionNameSpace}.remove`,
    async node => {
      await removeNode(context, node)
      mainViewTreeDataProvider.refresh()
    }
  )

  vscode.commands.registerCommand(
    `${extensionNameSpace}.addCommand`,
    async node => {
      const newCommand = await new CommandEditor(context, node).save()
      if (!is.nullOrUndefined(newCommand)) {
        mainViewTreeDataProvider.refresh()
        await view.reveal(newCommand)
        mainViewTreeDataProvider.refresh()
      }
    }
  )

  vscode.commands.registerCommand(
    `${extensionNameSpace}.editCommand`,
    async node => {
      const newCommand = await new CommandEditor(context, null, node).save()
      if (!is.nullOrUndefined(newCommand)) {
        mainViewTreeDataProvider.refresh()
        await view.reveal(newCommand)
        mainViewTreeDataProvider.refresh()
      }
    }
  )

  vscode.commands.registerCommand(`${extensionNameSpace}.runCommand`, node => {
    runCommand(node)
  })

  vscode.commands.registerCommand(`${extensionNameSpace}.export`, () => {
    exportData(context)
  })

  vscode.commands.registerCommand(`${extensionNameSpace}.import`, async () => {
    await importData(context)
    mainViewTreeDataProvider.refresh()
  })
}

/**
 * this method is called when your extension is deactivated
 */
// function deactivate() {}

module.exports = {
  activate,
  // deactivate,
}
