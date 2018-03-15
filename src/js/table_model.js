function JSONTableModel (tableData) {
  return this.init(tableData)
}

JSONTableModel.prototype = {
  init: function (tableData) {
    this.tableData = tableData || { meta: {}, data: [] }
    this.meta = this.tableData.meta
    this.data = this.tableData.data
    this.meta.rows = null
    this.meta.columns = null
    this.currentCell = null
    this.data_changed_event = new window.Event('dataChanged')
  },

  isValidData: function () {
    var data = this.data
    return data && typeof data === 'object' &&
                data.constructor === Array &&
                data.length && data[0].length && data[0][0].hasOwnProperty('content')
  },

  setRowCol: function () {
    this.setRowColUtil(this.data.length, this.data[0].length)
  },

  setDefaultData: function (rows, columns) {
    this.setRowColUtil(rows, columns)
    this.updateDataAddRemoveExtraRowColumn()
  },

  setCurrentCell: function (cell) {
    this.currentCell = cell
  },

  updateContent: function (event) {
    var row = Number(event.target.dataset.row)
    var column = Number(event.target.dataset.col)
    if (this.data.length > row && this.data[0].length > column) {
      this.data[row][column].content = event.target.innerHTML
    }
  },

  updateContentOfCurrentCell: function () {
    var row = Number(this.currentCell.row)
    var column = Number(this.currentCell.col)
    var selector = "[data-row='" + String(row) + "'][data-col='" + String(column) + "']"
    var cell = JSONTable.qs(selector, this.container)
    if (cell && this.data.length > row && this.data[0].length > column) {
      this.data[row][column].content = cell.innerHTML
    }
  },

  addARow: function () {
    this.meta.rows += 1
    this.updateDataAddRemoveExtraRowColumn()
  },

  removeARow: function () {
    if (this.meta.rows > 1) {
      this.meta.rows -= 1
      this.updateDataAddRemoveExtraRowColumn()
    }
  },

  addAColumn: function () {
    this.meta.columns += 1
    this.updateDataAddRemoveExtraRowColumn()
  },

  removeAColumn: function () {
    if (this.meta.columns > 1) {
      this.meta.columns -= 1
      this.updateDataAddRemoveExtraRowColumn()
    }
  },

  updateFormatOfCurrentCell: function (formatkey, event) {
    var currentCell = this.currentCell
    if (currentCell && event.target.dataset.radioval) {
      this.data[currentCell.row][currentCell.col].format[formatkey] = event.target.dataset.radioval
    } else if (currentCell) {
      var format = this.data[currentCell.row][currentCell.col].format
      this.data[currentCell.row][currentCell.col].format[formatkey] = !format[formatkey]
    }
  },

  updateDataAddRemoveExtraRowColumn: function () {
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

  setRowColUtil: function (rows, columns) {
    this.meta.rows = Number(rows)
    this.meta.columns = Number(columns)
  },

  defaultCellData: function () {
    var data = {}
    data.content = ''
    data.format = {}
    return data
  }
}
