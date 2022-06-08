const vscode = require('vscode')
const {
  getChildren: getChildrenFromStorage,
  getParentByChildId,
} = require('./utils/storage')
const { treeViewItemType, collapsibleStateEnums } = require('./utils/constant')

class MainViewTreeDataProvider {
  constructor(context) {
    this.context = context
    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
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
    let resourceUri
    if (element.type === treeViewItemType.group) {
      if (element.collapsibleState === collapsibleStateEnums.expanded) {
        collapsibleState = vscode.TreeItemCollapsibleState.Expanded
      } else {
        collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
      }
      tooltip = element.name
      resourceUri = vscode.Uri.parse(`/${element.name}`)
    }
    if (element.type === treeViewItemType.command) {
      collapsibleState = vscode.TreeItemCollapsibleState.None
      tooltip = element.commandLine
      resourceUri = vscode.Uri.parse('.ps1') // TODO
    }

    const result = {
      label,
      collapsibleState,
      tooltip,
      resourceUri,
    }
    result.id = element.id
    result.contextValue = element.type
    return result
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }
}

module.exports = MainViewTreeDataProvider
