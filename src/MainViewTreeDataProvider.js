const vscode = require('vscode')
const {
  getChildren: getChildrenFromStorage,
  getParentByChildId,
  reparentNodes,
} = require('./utils/storage')
const { treeViewItemType, collapsibleStateEnums } = require('./utils/constant')
const is = require('@sindresorhus/is')
const path = require('path')
class MainViewTreeDataProvider {
  constructor(context) {
    this.context = context
    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
    this.dropMimeTypes = ['application/vnd.code.tree.commandBookmark']
    this.dragMimeTypes = ['text/uri-list']
  }

  getChildren(element) {
    return getChildrenFromStorage(this.context, element)
  }

  getParent(element) {
    return getParentByChildId(this.context, element.id)
  }

  getTreeItem(element) {
    let collapsibleState
    const label = element.name
    let tooltip = ''
    let iconPath
    if (element.type === treeViewItemType.folder) {
      if (element.collapsibleState === collapsibleStateEnums.expanded) {
        collapsibleState = vscode.TreeItemCollapsibleState.Expanded
      } else {
        collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
      }
      tooltip = element.name
      iconPath = {
        light: path.resolve(
          __dirname,
          `../resources/icon/light/${
            element.collapsibleState === collapsibleStateEnums.expanded
              ? 'openFolder'
              : 'folder'
          }.svg`
        ),
        dark: path.resolve(
          __dirname,
          `../resources/icon/dark/${
            element.collapsibleState === collapsibleStateEnums.expanded
              ? 'openFolder'
              : 'folder'
          }.svg`
        ),
      }
    }
    if (element.type === treeViewItemType.command) {
      collapsibleState = vscode.TreeItemCollapsibleState.None
      tooltip = element.commandLine
      iconPath = {
        light: path.resolve(__dirname, '../resources/icon/light/file.svg'),
        dark: path.resolve(__dirname, '../resources/icon/dark/file.svg'),
      }
    }

    const result = {
      label,
      collapsibleState,
      tooltip,
      iconPath,
    }
    result.id = element.id
    result.contextValue = element.type
    return result
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }

  handleDrag(source, treeDataTransfer) {
    treeDataTransfer.set(
      'application/vnd.code.tree.commandBookmark',
      new vscode.DataTransferItem(source)
    )
  }

  async handleDrop(target, sources) {
    const transferItem = sources.get(
      'application/vnd.code.tree.commandBookmark'
    )
    if (is.nullOrUndefined(transferItem)) {
      return
    }
    const errorMessage = await reparentNodes(
      this.context,
      target,
      transferItem.value
    )
    if (!is.nullOrUndefined(errorMessage)) {
      vscode.window.showErrorMessage(errorMessage)
    } else {
      this.refresh()
    }
  }
}

module.exports = MainViewTreeDataProvider
