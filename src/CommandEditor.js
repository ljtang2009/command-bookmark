const vscode = require('vscode')
const i18n = require('./utils/i18n')
const is = require('@sindresorhus/is')
const { saveElement } = require('./utils/storage')
const { treeViewItemType, extensionNameSpace } = require('./utils/constant')

const EditorType = {
  commandLine: Symbol(),
  commandName: Symbol(),
}

class CommandEditor {
  constructor(context, parentElement, element) {
    this.context = context
    this.parentElement = parentElement
    this.element = element
    this.title = i18n.localize(
      is.nullOrUndefined(element)
        ? `${extensionNameSpace}.inputBox.title.addCommand`
        : `${extensionNameSpace}.inputBox.title.editCommand`
    )
    this.currentStep = 1
    this.totalSteps = 2
    this.commandLine = ''
    this.commandName = ''
    this.currentInputBox = null
  }

  async save() {
    return await this.showCommandLineInputBox()
  }

  showCommandLineInputBox() {
    return new Promise(resolve => {
      /* #region init properties */
      const placeholder = i18n.localize(
        `${extensionNameSpace}.inputBox.placeHolder.inputCommandLine`
      )
      this.currentInputBox = vscode.window.createInputBox()
      this.currentInputBox.ignoreFocusOut = true
      this.currentInputBox.placeholder = placeholder
      this.currentInputBox.title = `${this.title} - ${placeholder}`
      if (is.emptyStringOrWhitespace(this.commandLine)) {
        this.currentInputBox.value = is.nullOrUndefined(this.element)
          ? ''
          : this.element.commandLine
      } else {
        this.currentInputBox.value = this.commandLine
      }
      this.currentInputBox.step = this.currentStep
      this.currentInputBox.totalSteps = this.totalSteps
      this.currentInputBox.editorType = EditorType.commandLine
      /* #endregion */
      this.currentInputBox.onDidHide(() => {
        this.currentInputBox.dispose()
        if (this.currentInputBox.editorType === EditorType.commandLine) {
          resolve()
        }
      })
      this.currentInputBox.onDidAccept(async () => {
        if (is.emptyStringOrWhitespace(this.currentInputBox.value)) {
          this.currentInputBox.validationMessage = i18n.localize(
            `${extensionNameSpace}.inputBox.validationMessage.inputCommandLine.required`
          )
        } else {
          this.commandLine = this.currentInputBox.value.trim()
          this.currentInputBox.editorType = EditorType.commandName // When execute dispose(), onDidHide() would be fired immediately
          this.currentInputBox.dispose()
          this.currentStep++
          resolve(await this.showCommandNameInputBox())
        }
      })
      this.currentInputBox.show()
    })
  }

  showCommandNameInputBox() {
    return new Promise(resolve => {
      /* #region init properties */
      const placeholder = i18n.localize(
        `${extensionNameSpace}.inputBox.placeHolder.inputCommandName`
      )
      this.currentInputBox = vscode.window.createInputBox()
      this.currentInputBox.ignoreFocusOut = true
      this.currentInputBox.placeholder = placeholder
      this.currentInputBox.title = `${this.title} - ${placeholder}`
      this.currentInputBox.prompt = i18n.localize(
        `${extensionNameSpace}.inputBox.prompt.inputCommandName`
      )
      this.currentInputBox.value = is.nullOrUndefined(this.element)
        ? this.commandLine.substring(0, 20)
        : this.element.name
      this.currentInputBox.step = this.currentStep
      this.currentInputBox.totalSteps = this.totalSteps
      this.currentInputBox.buttons = [vscode.QuickInputButtons.Back]
      this.currentInputBox.editorType = EditorType.commandName
      /* #endregion */
      this.currentInputBox.onDidHide(() => {
        this.currentInputBox.dispose()
        if (this.currentInputBox.editorType === EditorType.commandName) {
          resolve()
        }
      })
      this.currentInputBox.onDidTriggerButton(async button => {
        if (button === vscode.QuickInputButtons.Back) {
          this.currentInputBox.dispose()
          this.commandName = ''
          this.currentStep--
          resolve(await this.showCommandLineInputBox())
        }
      })
      this.currentInputBox.onDidAccept(async () => {
        if (is.emptyStringOrWhitespace(this.currentInputBox.value)) {
          this.currentInputBox.validationMessage = i18n.localize(
            `${extensionNameSpace}.inputBox.validationMessage.inputCommandName.required`
          )
        } else {
          this.currentInputBox.validationMessage = ''
          this.commandName = this.currentInputBox.value.trim()
          const newElement = await this.saveData()
          resolve(newElement)
          this.currentInputBox.editorType = null // When execute dispose(), onDidHide() would be fired immediately
          this.currentInputBox.dispose()
        }
      })
      this.currentInputBox.show()
    })
  }

  async saveData() {
    const newElement = {
      type: treeViewItemType.command,
      children: [],
      ...this.element,
      commandLine: this.commandLine,
      name: this.commandName,
    }
    await saveElement(this.context, this.parentElement, newElement)
    return newElement
  }
}

module.exports = CommandEditor
