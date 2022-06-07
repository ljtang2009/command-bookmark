const { saveElement, getNodeById } = require('./utils/storage')

module.exports = async (context, elementId, newCollapsibleState) => {
  const element = getNodeById(context, elementId)
  await saveElement(context, null, {
    ...element,
    collapsibleState: newCollapsibleState,
  })
}
