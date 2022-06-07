const { treeViewItemType, collapsibleStateEnums } = require('./utils/constant')
const vscode = require('vscode')
const is = require('@sindresorhus/is')
const { saveElement } = require('./utils/storage')
const i18n = require('./utils/i18n')

/**
 * Show input box
 * @param {String} defaultValue default value
 * @returns {String} input value
 */
async function showInputBox(defaultValue) {
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
      }
      // TODO check duplication of name
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
    !is.nullOrUndefined(element) ? element.name : ''
  )
  if (!is.undefined(groupName)) {
    // save the group
    // await saveElement(context, parentElement, {
    //   type: treeViewItemType.group,
    //   collapsibleState: collapsibleStateEnums.collapsed,
    //   children: [],
    //   ...element,
    //   name: groupName,
    // })
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
