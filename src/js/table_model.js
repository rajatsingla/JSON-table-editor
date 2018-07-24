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
