const { treeViewItemType, collapsibleStateEnums } = require('./utils/constant')
const vscode = require('vscode')
const is = require('@sindresorhus/is')
const { saveElement, getChildren } = require('./utils/storage')
const i18n = require('./utils/i18n')

/**
 * Show input box
 * @param {String} defaultValue default value
 * @returns {String} input value
 */
async function showInputBox(defaultValue) {
  const placeHolder = i18n.localize(
    'commandBookmark.inputBox.placeHolder.inputFolderName'
  )
  let result = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    prompt: placeHolder,
    value: defaultValue,
    title: i18n.localize('commandBookmark.inputBox.title.addFolder'),
    placeHolder: placeHolder,
    validateInput: text => {
      let validateResult
      if (is.undefined(text) || is.emptyStringOrWhitespace(text)) {
        validateResult = i18n.localize(
          'commandBookmark.inputBox.validateInput.requireFolderName'
        )
      }
      return validateResult
    },
  })
  if (!is.undefined(result)) {
    result = result.trim()
  }
  return result
}

module.exports = async (context, parentElement, element) => {
  let newElement
  const folderName = await showInputBox(
    !is.nullOrUndefined(element) ? element.name : ''
  )
  if (!is.undefined(folderName)) {
    newElement = {
      type: treeViewItemType.folder,
      collapsibleState: collapsibleStateEnums.collapsed,
      children: [],
      ...element,
      name: folderName,
    }
    await saveElement(context, parentElement, newElement)
  }
  return newElement
}
