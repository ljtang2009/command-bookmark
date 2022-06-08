const vscode = require('vscode')
const is = require('@sindresorhus/is')
const i18n = require('./utils/i18n')

module.exports = command => {
  const commandLine = command.commandLine
  let terminal = vscode.window.activeTerminal
  if (
    is.nullOrUndefined(terminal) &&
    !is.nullOrUndefined(vscode.window.terminals) &&
    vscode.window.terminals.length > 0
  ) {
    terminal = vscode.window.terminals[0]
  }
  if (!is.nullOrUndefined(terminal)) {
    terminal.show(true)
    terminal.sendText(commandLine, true)
  } else {
    vscode.window.showErrorMessage(
      i18n.localize('commandShelf.errorMessage.noneActiveTerminals')
    )
  }
}
