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
  },

  insert: function (model) {
    var container = this.container
    if (container.firstChild) {
      container.replaceChild(this.table, container.childNodes[0])
    } else {
      container.append(this.table)
    }
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

  updateFormatOptions: function (currentCellFormat) {
    var optionsContainer = JSONTable.qs('#' + this.formatOptionsId, this.container)
    optionsContainer.innerHTML = this.formatButtons(currentCellFormat) + this.formatRadioButtons(currentCellFormat)
  },

  formatRadioButtons: function (currentCellFormat) {
    var html = ''
    var radioButtons = this.formatOptions.filter(function (a) { return a.type === 'radio' })
    for (var i = 0; i < radioButtons.length; i++) {
      html += '<span>'
      for (var j = 0; j < radioButtons[i].options.length; j++) {
        var option = radioButtons[i].options[j]
        html += '<button data-code="5" data-formatkey="' +
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
      html += '<button data-code="5" data-formatkey="' +
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
    currentCell = currentCell || {}
    var selector = "[data-row='" + String(currentCell.row) + "'][data-col='" + String(currentCell.col) + "']"
    var cell = JSONTable.qs(selector, this.container)
    if (cell) {
      cell.focus()
      setTimeout(function () { JSONTable.setEndOfContenteditable(cell) }, 0)
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
    var rowBtnContainer = JSONTable.qs('#' + this.rowBtnId, this.container)
    rowBtnContainer.innerHTML =
      (rows < maxRows ? '<button data-code="3" title="add a row">+</button>' : '') +
      (rows > 1 ? '<button data-code="4" title="remove a row">-</button>' : '')

    var columnBtnContainer = JSONTable.qs('#' + this.colBtnId, this.container)
    columnBtnContainer.innerHTML =
      (columns < maxColumns ? '<button data-code="1" title="add a column">+</button>' : '') +
      (columns > 1 ? '<button data-code="2" title="remove a column">-</button>' : '')
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
