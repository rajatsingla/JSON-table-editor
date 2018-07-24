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
