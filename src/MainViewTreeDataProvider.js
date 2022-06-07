const vscode = require('vscode')
const {
  getChildren: getChildrenFromStorage,
  getParentByChildId,
} = require('./utils/storage')
const { treeViewItemType, collapsibleStateEnums } = require('./utils/constant')
const is = require('@sindresorhus/is')

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
    let collapsibleState = vscode.TreeItemCollapsibleState.None
    if (element.type === treeViewItemType.group) {
      if (element.collapsibleState === collapsibleStateEnums.expanded) {
        collapsibleState = vscode.TreeItemCollapsibleState.Expanded
      } else {
        collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
      }
    }
    const result = {
      label: element.name,
      collapsibleState: collapsibleState,
      tooltip: element.name,
      resourceUri: vscode.Uri.parse(`/${element.name}`),
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
