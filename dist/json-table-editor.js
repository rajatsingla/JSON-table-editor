/**
https://github.com/rajatsingla/JSON-table
@description
JSON table is a minimal, yet flexible HTML table editor, where you can attach formatting to each cell and it gives you JSON output.

@author		rajatsingla.in
@company	Scroll Media, India
@created	12-03-2018
*/

( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "JSONTableEditor requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

  'use strict'

var COLUMN_WIDTH = 16
var BORDER_WIDTH = 1
var DEFAULTOPTIONS = {
  formatOptions: [
    {
      type: 'button',
      name: 'bold',
      innerHTML: 'Bold'
    },
    {
      type: 'button',
      name: 'italic',
      innerHTML: 'Italic'
    },
    {
      type: 'radio',
      name: 'align',
      options: ['left', 'center', 'right']
    }
  ],
  defaultRows: 3,
  defaultColumns: 3,
  maxColumns: 1000,
  maxRows: 1000,
  selectorWrongMsg: 'Can\'t find html element with given selector.',
  formatOptionsId: 'jt-format-options',
  colBtnId: 'jt-col-btn',
  rowBtnId: 'jt-row-btn',
  expandOptionsId: 'jt-expand-options',
  toggleOptionsId: 'jt-options-toggle',
  tableMainClass: 'js-main-table'
}

function JSONTablePaste (formatOptions) {
  return this.init(formatOptions)
}

JSONTablePaste.prototype = {
  init: function (formatOptions) {
    this.formatOptions = formatOptions
  },

  getTableData: function (pastedHTML) {
    try {
      var element = document.createElement('div')
      element.innerHTML = pastedHTML
      var table = JSONTable.qs('table', element)
      if (!table) {
        return null
      }
      var data = []
      var trs = JSONTable.qsa('tr', table)
      for (var i = 0; i < trs.length; i++) {
        var cells = JSONTable.qsa('th,td', trs[i])
        if (cells.length) {
          var rowData = []
          for (var j = 0; j < cells.length; j++) {
            rowData.push(this.getCellData(cells[j]))
          }
          data.push(rowData)
        }
      }
      if (!data.length) {
        return null
      }
      return data
    } catch (ex) {
      return null
    }
  },

  getCellData: function (cellHTML) {
    var data = {}
    data.content = cellHTML.textContent
    data.format = {}
    if (this.hasOption('bold') && (cellHTML.style.fontWeight === 'bold' || cellHTML.style.fontWeight === 'bolder' || Number(cellHTML.style.fontWeight) > 599)) {
      data.format.bold = true
    }
    if (this.hasOption('italic') && cellHTML.style.fontStyle === 'italic') {
      data.format.italic = true
    }
    if (this.hasOption('underline') && cellHTML.style.textDecorationLine === 'underline') {
      data.format.underline = true
    }
    if (this.hasOption('align') && cellHTML.style.textAlign !== '') {
      data.format.align = cellHTML.style.textAlign
    }
    return data
  },

  hasOption: function (option) {
    return this.formatOptions.filter(function (e) {
      return e.name === option
    }).length
  }
}

function JSONTableKeyboardShortcuts (view, model) {
  return this.init(view, model)
}

JSONTableKeyboardShortcuts.prototype = {
  init: function (view, model) {
    this.view = view
    this.model = model
    this.bindArrowKeys()
  },

  bindArrowKeys: function () {
    var self = this
    this.view.container.addEventListener('keydown', function (event) {
      if (self.model.currentCell && event.target.tagName === 'TD') {
        if (event.keyCode === 37 && JSONTable.cursorAtEndOrStart(event.target).atStart) {
          self.moveArrowLeftRight(-1)
        } else if (event.keyCode === 38 && JSONTable.cursorAtEndOrStart(event.target).atStart) {
          self.moveArrowUpDown(-1)
        } else if (event.keyCode === 39 && JSONTable.cursorAtEndOrStart(event.target).atEnd) {
          self.moveArrowLeftRight(1)
        } else if (event.keyCode === 40 && JSONTable.cursorAtEndOrStart(event.target).atEnd) {
          self.moveArrowUpDown(1)
        }
      }
    })
  },

  moveArrowUpDown: function (direction) {
    var currentCell = Object.assign({}, this.model.currentCell)
    currentCell.row = (Number(currentCell.row) + direction + this.model.meta.rows) % this.model.meta.rows
    if ((currentCell.row === 0 && direction === 1) || (currentCell.row === this.model.meta.rows - 1 && direction === -1)) {
      currentCell.col = (Number(currentCell.col) + direction + this.model.meta.columns) % this.model.meta.columns
    }
    this.view.focusCurrentCell(currentCell)
  },

  moveArrowLeftRight: function (direction) {
    var currentCell = Object.assign({}, this.model.currentCell)
    currentCell.col = (Number(currentCell.col) + direction + this.model.meta.columns) % this.model.meta.columns
    if ((currentCell.col === 0 && direction === 1) || (currentCell.col === this.model.meta.columns - 1 && direction === -1)) {
      currentCell.row = (Number(currentCell.row) + direction + this.model.meta.rows) % this.model.meta.rows
    }
    this.view.focusCurrentCell(currentCell)
  }
}

function JSONTableView (container, formatOptions) {
  return this.init(container, formatOptions)
}

JSONTableView.prototype = {
  init: function (container, formatOptions) {
    this.table = document.createElement('table')
    this.table.setAttribute('class', DEFAULTOPTIONS.tableMainClass)
    this.cellTag = 'td'
    this.container = container
    this.formatOptions = formatOptions
    this.formatOptionsId = DEFAULTOPTIONS.formatOptionsId
    this.colBtnId = DEFAULTOPTIONS.colBtnId
    this.rowBtnId = DEFAULTOPTIONS.rowBtnId
    this.expandOptionsId = DEFAULTOPTIONS.expandOptionsId
    this.toggleOptionsId = DEFAULTOPTIONS.toggleOptionsId
  },

  insert: function (model) {
    var container = this.container
    container.innerHTML = ''
    container.append(this.table)
    container.insertAdjacentHTML('afterbegin', this.formatOptionsContainer())
    this.updateFormatOptions()
    container.insertAdjacentHTML('beforeend', this.utilButtonsContainer())
    this.updateUtilButtons(model.meta.rows, model.meta.columns, model.maxRows, model.maxColumns)
  },

  update: function (model) {
    this.table.innerHTML = this.html(model.meta.rows, model.meta.columns, model.data)
    if (model.currentCell) {
      this.focusCurrentCell(model.currentCell)
    }
    this.updateUtilButtons(model.meta.rows, model.meta.columns, model.maxRows, model.maxColumns)
    return true
  },

  getById: function (id) {
    return JSONTable.qs('#' + id, this.container)
  },

  updateFormatOptions: function (currentCellFormat) {
    var optionsContainer = this.getById(this.formatOptionsId)
    optionsContainer.innerHTML = this.formatButtons(currentCellFormat) + this.formatRadioButtons(currentCellFormat)
  },

  updateExpandIcons: function (cell) {
    this.hideExpandOptions()
    var tableStyle = JSONTable.getStyle(this.table)
    var td = this.getTD(cell)

    var marginBottom = parseFloat(tableStyle.marginBottom)
    var tableHeight = this.table.offsetHeight
    var tdTop = td.offsetTop
    var tdHeight = td.offsetHeight
    var rowBtn = this.getById(this.rowBtnId)
    rowBtn.style.top = String(-tableHeight - marginBottom + tdTop) + 'px'
    rowBtn.style.height = String(tdHeight) + 'px'
    rowBtn.style.display = 'inline'

    var tdLeft = td.offsetLeft
    var tdWidth = td.offsetWidth
    var colBtn = this.getById(this.colBtnId)
    colBtn.style.left = String(tdLeft + 1) + 'px'
    colBtn.style.width = String(tdWidth) + 'px'
    colBtn.style.display = 'inline'
  },

  toggleExpandOptions: function (category) {
    if (category === 'row') {
      var categoryId = this.rowBtnId
      var hideId = this.colBtnId
    } else {
      var categoryId = this.colBtnId
      var hideId = this.rowBtnId
    }

    var hideOptions = this.getById(hideId)
    var expandOptions = this.getById(categoryId)
    expandOptions.classList.toggle('expand-options')
    hideOptions.classList.remove('expand-options')
  },

  hideExpandOptions: function () {
    var btnIds = [this.rowBtnId, this.colBtnId]
    for (var i = 0; i < btnIds.length; i++) {
      var btnContainer = this.getById(btnIds[i])
      btnContainer.classList.remove('expand-options')
    }
  },

  getTD: function (cell) {
    if (!cell) { return }

    var row = Number(cell.row)
    var column = Number(cell.col)
    var selector = JSONTable.rcs(row, column)
    var td = JSONTable.qs(selector, this.container)
    return td
  },

  formatRadioButtons: function (currentCellFormat) {
    var html = ''
    var radioButtons = this.formatOptions.filter(function (a) { return a.type === 'radio' })
    for (var i = 0; i < radioButtons.length; i++) {
      html += '<span>'
      for (var j = 0; j < radioButtons[i].options.length; j++) {
        var option = radioButtons[i].options[j]
        html += '<button data-code="6" data-formatkey="' +
                  radioButtons[i].name +
                  '" data-radioval="' +
                  option +
                  '" title="' +
                  option + ' ' + radioButtons[i].name +
                  '" class="' +
                  (currentCellFormat && currentCellFormat[radioButtons[i].name] === option ? ' active' : '') +
                  '"' +
                  (currentCellFormat ? ' ' : ' disabled') +
                  '>' +
                  option +
                  '</button>'
      }
      html += '</span>'
    }
    return html
  },

  formatButtons: function (currentCellFormat) {
    var html = ''
    var formatButtons = this.formatOptions.filter(function (a) { return a.type === 'button' })
    for (var i = 0; i < formatButtons.length; i++) {
      html += '<button data-code="6" data-formatkey="' +
              formatButtons[i].name +
              '" class="' +
              (currentCellFormat && currentCellFormat[formatButtons[i].name] ? ' active' : '') +
              '"' +
              (currentCellFormat ? ' ' : ' disabled') +
              '>' +
              formatButtons[i].innerHTML +
              '</button>'
    }
    return html
  },

  focusCurrentCell: function (currentCell) {
    var td = this.getTD(currentCell)
    if (td) {
      td.focus()
      setTimeout(function () { JSONTable.setEndOfContenteditable(td) }, 0)
    }
  },

  formatOptionsContainer: function () {
    var html = '<div class="jt-format-options" id="' + this.formatOptionsId + '">'
    html += '</div>'
    return html
  },

  utilButtonsContainer: function () {
    var html =
          '<div class="jt-row-btn" id="' + this.rowBtnId + '">' +
          '</div>' +

          '<div class="jt-col-btn" id="' + this.colBtnId + '">' +
          '</div>'
    return html
  },

  updateUtilButtons: function (rows, columns, maxRows, maxColumns) {
    var rowBtnContainer = this.getById(this.rowBtnId)
    rowBtnContainer.innerHTML =
      '<span id="' + this.toggleOptionsId + '"><i class="jt-left-arrow"></i></span>' +
      '<div class="jt-expand-options" id="' + this.expandOptionsId + '">' +
      (rows < maxRows ? '<button data-code="3">Insert above</button>' : '') +
      (rows < maxRows ? '<button data-code="4">Insert below</button>' : '') +
      (rows > 1 ? '<button data-code="5" style="color:red;">Delete row</button>' : '') +
      '</div>'

    var columnBtnContainer = this.getById(this.colBtnId)
    columnBtnContainer.innerHTML =
      '<span id="' + this.toggleOptionsId + '"><i class="jt-up-arrow"></i></span>' +
      '<div class="jt-expand-options" id="' + this.expandOptionsId + '">' +
      (columns < maxColumns ? '<button data-code="0">Insert before</button>' : '') +
      (columns < maxColumns ? '<button data-code="1">Insert after</button>' : '') +
      (columns > 1 ? '<button data-code="2" style="color:red;">Delete column</button>' : '') +
      '</div>'
  },

  html: function (rows, columns, data) {
    var html = ''
    for (var i = 0; i < rows; i++) {
      html += '<tr>'
      for (var j = 0; j < columns; j++) {
        html += this.cell(i, j, data[i][j])
      }
      html += '</tr>'
    }
    return html
  },

  cell: function (i, j, data) {
    var html = ''
    html += '<' + this.cellTag + ' contenteditable'
    html += " data-row='" + i + "'"
    html += " data-col='" + j + "'"
    html += " class='" + this.cellClassList(data.format) + "'"
    html += '>' + data.content + '</' + this.cellTag + '>'
    return html
  },

  cellClassList: function (format) {
    var classList = ''
    if (format && typeof format === 'object') {
      for (var property in format) {
        if (format.hasOwnProperty(property) && format[property]) {
          if (format[property] !== 'true' && format[property] !== true) {
            // case of radio buttons
            classList += 'jt-cell-' + format[property].replace(/ /g, '-') + ' '
          } else {
            classList += 'jt-cell-' + property.replace(/ /g, '-') + ' '
          }
        }
      }
    }
    return classList
  }
}

function JSONTableModel (tableData, maxRows, maxColumns) {
  return this.init(tableData, maxRows, maxColumns)
}

JSONTableModel.prototype = {
  init: function (tableData, maxRows, maxColumns) {
    this.tableData = tableData || { meta: {}, data: [] }
    this.meta = this.tableData.meta
    this.data = this.tableData.data
    this.meta.rows = null
    this.meta.columns = null
    this.currentCell = null
    this.maxRows = maxRows
    this.maxColumns = maxColumns
    this.data_changed_event = new window.Event('dataChanged')
  },

  isValidData: function () {
    var data = this.data
    return data && typeof data === 'object' &&
                data.constructor === Array &&
                data.length && data[0].length &&
                data[0][0].hasOwnProperty('content')
  },

  setRowColUtil: function (rows, columns) {
    this.meta.rows = Number(rows)
    this.meta.columns = Number(columns)
  },

  setRowCol: function () {
    var rows = this.data.length
    var columns = this.data[0].length
    this.setRowColUtil(rows, columns)
  },

  setDefaultData: function (rows, columns) {
    this.setRowColUtil(rows, columns)
    this.addRemoveExtraRowColumn()
  },

  setCurrentCell: function (td) {
    this.currentCell = td.dataset
  },

  getFormat: function (td) {
    var row = Number(td.dataset.row)
    var col = Number(td.dataset.col)
    return this.data[row][col].format
  },

  saveContent: function (td) {
    if (!td) { return }

    var row = Number(td.dataset.row)
    var col = Number(td.dataset.col)
    if (this.data.length > row && this.data[0].length > col) {
      this.data[row][col].content = td.innerHTML
    }
  },

  saveFormat: function (formatButton) {
    if (!this.currentCell) { return }

    var row = this.currentCell.row
    var col = this.currentCell.col
    if (!(this.data.length > row && this.data[0].length > col)) { return }
    var format = this.data[row][col].format
    var key = formatButton.dataset.formatkey
    var val = formatButton.dataset.radioval
    if (!val) {
      val = !format[key]
    }
    format[key] = val
  },

  handlePaste: function (tableData, target) {
    var targetRow = Number(target.dataset.row)
    var dataRows = tableData.length
    var updatedRows = Math.min(Math.max(targetRow + dataRows, this.meta.rows), this.maxRows)
    var targetColumn = Number(target.dataset.col)
    var dataColumns = tableData[Math.floor(dataRows / 2)].length
    var updatedColumns = Math.min(Math.max(targetColumn + dataColumns, this.meta.columns), this.maxColumns)
    this.setDefaultData(updatedRows, updatedColumns)
    // for first row we add default columns,
    // because table header can be copied partially
    while (tableData[0].length < dataColumns) {
      tableData[0].unshift(this.defaultCellData())
    }

    for (var i = 0; i < Math.min(dataRows, this.meta.rows - targetRow); i++) {
      for (var j = 0; j < Math.min(tableData[i].length, this.meta.columns - targetColumn); j++) {
        this.data[targetRow + i][targetColumn + j] = tableData[i][j]
      }
    }
  },

  defaultCellData: function () {
    var data = {}
    data.content = ''
    data.format = {}
    return data
  },

  addRemoveExtraRowColumn: function () {
    var rows = window.Number(this.meta.rows)
    var columns = window.Number(this.meta.columns)
    while (this.data.length !== rows) {
      if (this.data.length > rows) {
        this.data.pop()
      } else if (this.data.length < rows) {
        this.data.push([])
      } else {
        break
      }
    }

    for (var i = 0; i < rows; i++) {
      while (this.data[i].length !== columns) {
        if (this.data[i].length > columns) {
          this.data[i].pop()
        } else if (this.data[i].length < columns) {
          this.data[i].push(this.defaultCellData())
        } else {
          break
        }
      }
    }
  },

  insertaRow: function (position) {
    var row = Number(this.currentCell.row)
    if (this.meta.rows < this.maxRows) {
      this.meta.rows += 1
      this.data.splice(row + position, 0, new Array())
      if (position === 0) {
        this.currentCell.row = row + 1
      }
      this.addRemoveExtraRowColumn()
    }
  },

  removeRow: function () {
    var row = Number(this.currentCell.row)
    if (this.meta.rows > 1) {
      this.meta.rows -= 1
      this.data.splice(row, 1)
      this.addRemoveExtraRowColumn()
    }
  },

  insertColumn: function (position) {
    var rows = Number(this.meta.rows)
    var col = Number(this.currentCell.col)
    if (this.meta.columns < this.maxColumns) {
      this.meta.columns += 1
      for (var i = 0; i < rows; i++) {
        this.data[i].splice(col + position, 0, this.defaultCellData())
      }
      if (position === 0) {
        this.currentCell.col = col + 1
      }
      this.addRemoveExtraRowColumn()
    }
  },

  removeColumn: function () {
    var rows = Number(this.meta.rows)
    var col = Number(this.currentCell.col)
    if (this.meta.columns > 1) {
      this.meta.columns -= 1
      for (var i = 0; i < rows; i++) {
        this.data[i].splice(col, 1)
      }
      this.addRemoveExtraRowColumn()
    }
  }
}

function JSONTableController (view, model) {
  return this.init(view, model)
}

JSONTableController.prototype = {
  init: function (view, model) {
    this.view = view
    this.model = model
    this.paste = new JSONTablePaste(view.formatOptions)
  },

  dispatchDataEvent: function () {
    this.view.container.dispatchEvent(this.model.data_changed_event)
  },

  handleCellFocus: function (event) {
    var self = this
    this.model.setCurrentCell(event.target)
    this.view.updateExpandIcons(this.model.currentCell)
    setTimeout(function () {
      self.view.updateFormatOptions(self.model.getFormat(event.target))
    }, 0)
  },

  handleCellBlur: function (event) {
    var self = this
    this.model.saveContent(event.target)
    this.dispatchDataEvent()
    setTimeout(function () {
      self.view.updateFormatOptions()
    }, 0)
  },

  afterEventActions: function () {
    this.dispatchDataEvent()
    this.view.update(this.model)
  },

  handleBtnClick: function (event) {
    var dataset = event.target.dataset
    var code = window.Number(dataset.code)
    if (code === 0) {
      this.model.insertColumn(0)
    } else if (code === 1) {
      this.model.insertColumn(1)
    } else if (code === 2) {
      this.model.removeColumn()
    } else if (code === 3) {
      this.model.insertaRow(0)
    } else if (code === 4) {
      this.model.insertaRow(1)
    } else if (code === 5) {
      this.model.removeRow()
    } else if (code === 6) {
      this.model.saveFormat(event.target)
      var td = this.view.getTD(this.model.currentCell)
      this.model.saveContent(td)
    }

    this.afterEventActions()
  },

  handlePaste: function (event) {
    var that = this
    var clipboardData = event.clipboardData || window.clipboardData
    var pastedHTML = clipboardData.getData('text/html')
    var tableData = that.paste.getTableData(pastedHTML)

    if (tableData) {
      event.stopPropagation()
      event.preventDefault()
      event.target.blur()
      that.model.handlePaste(tableData, event.target)
      that.afterEventActions()
    }
  },

  bindEventOnExpandIcons: function () {
    var that = this
    var rowBtnContainer = this.view.getById(this.view.rowBtnId)
    var colBtnContainer = this.view.getById(this.view.colBtnId)
    var toggleId = '#' + this.view.toggleOptionsId
    JSONTable.delegate(
      rowBtnContainer,
      toggleId + ',' + toggleId + ' i',
      'click',
      function () {
        that.view.toggleExpandOptions('row')
      }
    )

    JSONTable.delegate(
      colBtnContainer,
      toggleId + ',' + toggleId + ' i',
      'click',
      function () {
        that.view.toggleExpandOptions('col')
      }
    )

    JSONTable.on(JSONTable.qs('body'), 'mousedown', function (e) {
      if (!(rowBtnContainer.contains(e.target) || colBtnContainer.contains(e.target))) {
        that.view.hideExpandOptions()
      }
    })
  },

  bindPasteEvent: function () {
    this.view.container.addEventListener('paste', this.handlePaste.bind(this))
  },

  bindEventOnCell: function (type, handler) {
    JSONTable.delegate(this.view.table, this.view.cellTag, type, handler)
  },

  bindEventOnButtons: function () {
    var self = this
    var btnIds = [this.view.formatOptionsId, this.view.rowBtnId, this.view.colBtnId]
    for (var i = 0; i < btnIds.length; i++) {
      JSONTable.delegate(
        JSONTable.qs('#' + btnIds[i], this.view.container),
        'button',
        'click',
        function (e) {
          self.handleBtnClick(e)
        }
      )

      JSONTable.delegate(
        JSONTable.qs('#' + btnIds[i], this.view.container),
        'button',
        'mousedown',
        function (e) {
          e.preventDefault()
        }
      )
    }
  },

  bindEvents: function () {
    var self = this
    this.bindEventOnCell('focus', function (e) {
      self.handleCellFocus(e)
    })
    this.bindEventOnCell('blur', function (e) {
      self.handleCellBlur(e)
    })
    this.bindEventOnExpandIcons()
    this.bindEventOnButtons()
    this.bindPasteEvent()
  }
}

function JSONTable (selector, options, tableData) {
  return this.init(selector, tableData, options)
}

JSONTable.prototype = {
  init: function (selector, tableData, options) {
    if (!options || typeof options !== 'object') {
      options = {}
    }
    this.formatOptions = options.formatOptions || DEFAULTOPTIONS.formatOptions
    this.maxRows = options.maxRows || DEFAULTOPTIONS.maxRows
    this.maxColumns = options.maxColumns || DEFAULTOPTIONS.maxColumns
    this.defaultRows = options.defaultRows || DEFAULTOPTIONS.defaultRows
    this.defaultColumns = options.defaultColumns || DEFAULTOPTIONS.defaultColumns
    this.allowPaste = options.allowPaste
    this.container = JSONTable.qs(selector)
    if (!this.container) {
      throw DEFAULTOPTIONS.selectorWrongMsg
    }
    this.model = new JSONTableModel(tableData, this.maxRows, this.maxColumns)
    this.view = new JSONTableView(this.container, this.formatOptions)
    this.controller = new JSONTableController(this.view, this.model)
    this.setupTable()
  },

  setupTable: function () {
    if (this.model.isValidData()) {
      this.model.setRowCol()
      this.initTable()
    } else {
      this.model.setDefaultData(this.defaultRows, this.defaultColumns)
      this.initTable('focus')
    }
  },

  initTable: function (command) {
    this.view.insert(this.model)
    this.view.update(this.model)
    this.controller.bindEvents()
    this.controller.dispatchDataEvent()
    if (command === 'focus') {
      this.view.focusCurrentCell({row: 0, col: 0})
    }
    this.keyboardHandler = new JSONTableKeyboardShortcuts(this.view, this.model)
  }
}


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

JSONTable.rcs = function (row, column) {
  var selector = "[data-row='" + String(row) + "'][data-col='" + String(column) + "']"
  return selector
}

JSONTable.getStyle = function (element) {
  var style = element.currentStyle || window.getComputedStyle(element)
  return style
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
  var atStart = false
  var atEnd = false
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

window.JSONTableEditor = JSONTable

return JSONTable
})
