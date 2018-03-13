function JSONTable (selector, options, tableData) {
  return this.init(selector, tableData, options)
}

JSONTable.prototype = {
  init: function (selector, tableData, options) {
    if (!options || typeof options !== 'object') {
      options = {}
    }
    this.gridRows = options.gridRows || DEFAULTOPTIONS.gridRows
    this.gridColumns = options.gridColumns || DEFAULTOPTIONS.gridColumns
    this.formatOptions = options.formatOptions || DEFAULTOPTIONS.formatOptions
    this.metaFields = options.metaFields || DEFAULTOPTIONS.metaFields
    this.container = JSONTable.qs(selector)
    if (!this.container) {
      throw DEFAULTOPTIONS.selectorWrongMsg
    }
    this.model = new JSONTableModel(tableData)
    this.view = new JSONTableView(this.container, this.formatOptions, this.metaFields)
    this.controller = new JSONTableController(this.view, this.model)
    this.setupTable()
  },

  setupTable: function () {
    if (this.model.isValidData()) {
      this.model.setRowCol()
      this.initTable()
    } else {
      this.grid = new Grid(this.container,
        function (row, column) {
          this.model.setDefaultData(Number(row) + 1, Number(column) + 1)
          this.initTable()
        }.bind(this),
        this.gridRows,
        this.gridColumns
      )
    }
  },

  initTable: function () {
    this.view.insert(this.model)
    this.view.update(this.model)
    this.controller.bindEvents()
    this.keyboardHandler = new JSONTableKeyboardShortcuts(this.view, this.model)
  }
}
