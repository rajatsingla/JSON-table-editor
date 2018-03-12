
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
