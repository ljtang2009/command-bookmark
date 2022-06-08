const { extensionNameSpace } = require('./constant')
const is = require('@sindresorhus/is')
const { v4: uuidv4 } = require('uuid')

/**
 * Get tree node by id recursively
 * @param {Array} data
 * @param {String} id
 * @returns {Object} tree node
 */
function _findTreeNode(data, id) {
  let result
  if (!is.undefined(data)) {
    for (const item of data) {
      if (item.id === id) {
        result = item
        break
      } else {
        result = _findTreeNode(item.children, id)
        if (!is.undefined(result)) {
          break
        }
      }
    }
  }
  return result
}

/**
 * Get parent node by child'sid recursively
 * @param {Array} data
 * @param {String} id
 * @returns {Object} tree node
 */
function _findParentNodeByChildId(data, childId) {
  let result
  if (!is.undefined(data)) {
    for (const item of data) {
      if (!is.nullOrUndefined(item.children)) {
        let exist = false
        for (const child of item.children) {
          if (child.id === childId) {
            exist = true
            break
          }
        }
        if (exist) {
          result = item
          break
        }
      }
      if (is.undefined(result)) {
        result = _findParentNodeByChildId(item.children, childId)
        if (!is.undefined(result)) {
          break
        }
      }
    }
  }
  return result
}

/**
 * Get children elements.
 * @param {Object} context - Extension context.
 * @param {Object} parentElement - Parent element.
 * @param {String} type
 * @returns {Array} children
 */
function getChildren(context, parentElement, type) {
  let result = []
  const storage = context.globalState.get(extensionNameSpace)
  if (!is.undefined(storage)) {
    if (is.nullOrUndefined(parentElement)) {
      // Get 1st level children.
      result = storage
    } else {
      // Get tree node by id recursively
      const parentNode = _findTreeNode(storage, parentElement.id)
      if (!is.undefined(parentNode)) {
        result = parentNode.children
      }
    }
  }
  if (!is.undefined(result)) {
    if (!is.undefined(type)) {
      result = result.filter(item => item.type === type)
    }
  }
  return result
}

async function saveElement(context, parentElement, childElement) {
  let storage = context.globalState.get(extensionNameSpace)
  if (is.undefined(storage)) {
    storage = []
  }
  if (!is.undefined(childElement.id)) {
    // update
    const oldNode = _findTreeNode(storage, childElement.id)
    Object.keys(oldNode).forEach(key => {
      delete oldNode[key]
    })
    Object.keys(childElement).forEach(key => {
      oldNode[key] = childElement[key]
    })
  } else {
    // insert
    let children = storage
    if (!is.nullOrUndefined(parentElement)) {
      const parentNode = _findTreeNode(storage, parentElement.id)
      if (!is.undefined(parentNode)) {
        children = parentNode.children
      }
    }
    childElement.id = uuidv4()
    children.push(childElement)
  }
  await context.globalState.update(extensionNameSpace, storage)
}

async function removeElement(context, elementId) {
  let storage = context.globalState.get(extensionNameSpace)
  if (is.undefined(storage)) {
    storage = []
  }
  const parentNode = _findParentNodeByChildId(storage, elementId)
  if (is.undefined(parentNode)) {
    // The element is at 1st level.
    for (let i = storage.length - 1; i >= 0; i--) {
      if (storage[i].id === elementId) {
        storage.splice(i, 1)
        break
      }
    }
  } else {
    for (let i = parentNode.children.length - 1; i >= 0; i--) {
      if (parentNode.children[i].id === elementId) {
        parentNode.children.splice(i, 1)
        break
      }
    }
  }
  await context.globalState.update(extensionNameSpace, storage)
}

function getNodeById(context, elementId) {
  let result = {}
  let storage = context.globalState.get(extensionNameSpace)
  if (is.undefined(storage)) {
    storage = []
  }
  result = _findTreeNode(storage, elementId)
  return result
}

function getParentByChildId(context, childId) {
  let result = null
  let storage = context.globalState.get(extensionNameSpace)
  if (is.undefined(storage)) {
    storage = []
  }
  result = _findParentNodeByChildId(storage, childId)
  return result
}

module.exports = {
  getChildren,
  saveElement,
  removeElement,
  getNodeById,
  getParentByChildId,
}
