const is = require('@sindresorhus/is')

let nlsJSON

function _initNlsJson() {
  let locale
  if (!is.nullOrUndefined(process.env.VSCODE_NLS_CONFIG)) {
    try {
      locale = JSON.parse(process.env.VSCODE_NLS_CONFIG).locale
    } catch (e) {
      // TODO record error
    }
  }
  const nlsFilePath = `../../package.nls${
    is.nullOrUndefined(locale) || locale === 'en' ? '' : `.${locale}`
  }.json`
  nlsJSON = require(nlsFilePath)
}

function localize(str, defaultEmptyResult) {
  if (is.undefined(nlsJSON)) {
    _initNlsJson()
  }
  let result = nlsJSON[str]
  if (is.undefined(result)) {
    if (defaultEmptyResult) {
      result = ''
    } else {
      result = str
    }
  }
  return result
}

module.exports = {
  localize,
}
