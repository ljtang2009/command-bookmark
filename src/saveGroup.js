const { treeViewItemType, collapsibleStateEnums } = require('./utils/constant')
const vscode = require('vscode')
const is = require('@sindresorhus/is')
const { saveElement, getChildren } = require('./utils/storage')
const i18n = require('./utils/i18n')

/**
 * Show input box
 * @param {String} defaultValue default value
 * @param {Array} siblings siblings nodes
 * @returns {String} input value
 */
async function showInputBox(defaultValue, siblings) {
  const placeHolder = i18n.localize(
    'commandShelf.inputBox.placeHolder.inputGroupName'
  )
  let result = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    prompt: placeHolder,
    value: defaultValue,
    title: i18n.localize('commandShelf.inputBox.title.addGroup'),
    placeHolder: placeHolder,
    validateInput: text => {
      let validateResult
      if (is.undefined(text) || is.emptyStringOrWhitespace(text)) {
        validateResult = i18n.localize(
          'commandShelf.inputBox.validateInput.requireGroupName'
        )
      } else if (
        !is.nullOrUndefined(siblings) &&
        siblings.some(item => item.name === text.trim())
      ) {
        validateResult = i18n.localize(
          'commandShelf.inputBox.validateInput.sameNodeName'
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
  const groupName = await showInputBox(
    !is.nullOrUndefined(element) ? element.name : '',
    getChildren(context, parentElement)
  )
  if (!is.undefined(groupName)) {
    newElement = {
      type: treeViewItemType.group,
      collapsibleState: collapsibleStateEnums.collapsed,
      children: [],
      ...element,
      name: groupName,
    }
    await saveElement(context, parentElement, newElement)
  }
  return newElement
}
