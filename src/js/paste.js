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
