const MainViewTreeDataProvider = require('./MainViewTreeDataProvider')
const {
  extensionNameSpace,
  collapsibleStateEnums,
} = require('./utils/constant')
const vscode = require('vscode')
const saveGroup = require('./saveGroup')
const updateCollapsibleState = require('./updateCollapsibleState')
const removeNode = require('./removeNode')
const saveCommand = require('./saveCommand')
const { default: is } = require('@sindresorhus/is')

/**
 * this method is called when your extension is activated
 * @param {*} context
 */
async function activate(context) {
  if (process.env.CLEAR_STORAGE_COMMAND_SHELF) {
    await context.globalState.update(extensionNameSpace)
  }
  const mainViewTreeDataProvider = new MainViewTreeDataProvider(context)
  const view = vscode.window.createTreeView(extensionNameSpace, {
    treeDataProvider: mainViewTreeDataProvider,
    showCollapseAll: true,
    // dragAndDropController:// TODO 定义拖拽
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
    `${extensionNameSpace}.addGroup`,
    async parentNode => {
      const newElement = await saveGroup(context, parentNode)
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
    `${extensionNameSpace}.renameGroup`,
    async node => {
      await saveGroup(context, null, node)
      mainViewTreeDataProvider.refresh()

      // await saveGroup(context)
      //   mainViewTreeDataProvider.refresh()
      // const terminal = vscode.window.terminals[0]
      // terminal.show()
      // terminal.sendText('node -v')
    }
  )

  vscode.commands.registerCommand(
    `${extensionNameSpace}.remove`,
    async node => {
      await removeNode(context, node)
      mainViewTreeDataProvider.refresh()
    }
  )

  // saveCommand
  vscode.commands.registerCommand(
    `${extensionNameSpace}.addCommand`,
    async node => {
      await saveCommand(context, node)
      mainViewTreeDataProvider.refresh()
    }
  )
}

/**
 * this method is called when your extension is deactivated
 */
// function deactivate() {}

module.exports = {
  activate,
  // deactivate,
}
