const vscode = require('vscode')
const i18n = require('./utils/i18n')
const is = require('@sindresorhus/is')
const { treeViewItemType } = require('./utils/constant')
const { removeElement } = require('./utils/storage')

module.exports = async (context, node) => {
  const messageStr = `${i18n.localize(
    'commandBookmark.inputBox.messageItem.message.remove'
  )}${i18n.localize(
    node.type === treeViewItemType.folder
      ? 'commandBookmark.inputBox.messageItem.message.folder'
      : 'commandBookmark.inputBox.messageItem.message.command'
  )}${i18n.localize('commandBookmark.punctuation.question')}`
  const messageResult = await vscode.window.showWarningMessage(
    messageStr,
    {
      modal: true,
    },
    {
      remove: true,
      title: i18n.localize('commandBookmark.inputBox.messageItem.title.remove'),
    }
  )
  if (!is.undefined(messageResult) && messageResult.remove) {
    await removeElement(context, node.id)
  }
}
