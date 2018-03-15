
// helper functions
JSONTable.qs = function (selector, scope) {
  return (scope || document).querySelector(selector)
}

JSONTable.qsa = function (selector, scope) {
  return (scope || document).querySelectorAll(selector)
}

JSONTable.on = function (target, type, callback, useCapture) {
  target.addEventListener(type, callback, !!useCapture)
}

JSONTable.delegate = function (target, selector, type, handler) {
  function dispatchEvent (event) {
    var targetElement = event.target
    var potentialElements = JSONTable.qsa(selector, target)
    var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0

    if (hasMatch) {
      handler.call(targetElement, event)
    }
  }
  // https://developer.mozilla.org/en-US/docs/Web/Events/blur
  var useCapture = type === 'blur' || type === 'focus'
  JSONTable.on(target, type, dispatchEvent, useCapture)
}

// https://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity/3866442#3866442
JSONTable.setEndOfContenteditable = function (contentEditableElement) {
  var range, selection
  if (document.createRange) {
    range = document.createRange()
    range.selectNodeContents(contentEditableElement)
    range.collapse(false)
    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  } else if (document.selection) {
    range = document.body.createTextRange()
    range.moveToElementText(contentEditableElement)
    range.collapse(false)
    range.select()
  }
}

JSONTable.orEmpty = function (entity) {
  return entity || ''
}

JSONTable.cursorAtEndOrStart = function (el) {
  var atStart = false, atEnd = false
  var selRange, testRange
  if (window.getSelection) {
    var sel = window.getSelection()
    if (sel.rangeCount) {
      selRange = sel.getRangeAt(0)
      testRange = selRange.cloneRange()

      testRange.selectNodeContents(el)
      testRange.setEnd(selRange.startContainer, selRange.startOffset)
      atStart = (testRange.toString() === '')

      testRange.selectNodeContents(el)
      testRange.setStart(selRange.endContainer, selRange.endOffset)
      atEnd = (testRange.toString() === '')
    }
  }
  return { atStart: atStart, atEnd: atEnd }
}

// polyfill for Object.assign
if (typeof Object.assign !== 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, 'assign', {
    value: function assign (target, varArgs) { // .length of function is 2
      'use strict'
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object')
      }

      var to = Object(target)

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index]

        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey]
            }
          }
        }
      }
      return to
    },
    writable: true,
    configurable: true
  })
}
