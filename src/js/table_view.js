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
