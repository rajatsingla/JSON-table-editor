function JSONTableView (container, formatOptions, metaFields) {
  return this.init(container, formatOptions, metaFields)
}

JSONTableView.prototype = {
  init: function (container, formatOptions, metaFields) {
    this.table = document.createElement('table')
    this.table.setAttribute('class', DEFAULTOPTIONS.tableMainClass)
    this.cellTag = 'td'
    this.container = container
    this.formatOptions = formatOptions
    this.metaFields = metaFields
    this.metaFieldsId = DEFAULTOPTIONS.metaFieldsId
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
    container.insertAdjacentHTML('afterbegin', this.metaFieldsContainer())
    this.updateMetaFields(model)
    container.insertAdjacentHTML('beforeend', this.utilButtons())
  },

  update: function (model) {
    this.table.innerHTML = this.html(model.meta.rows, model.meta.columns, model.data)
    if (model.currentCell) {
      this.focusCurrentCell(model.currentCell)
    }
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

  updateMetaFields: function (model) {
    var html = '';
    for (var i = 0; i < this.metaFields.length; i++) {
      var field = this.metaFields[i]
      if (field.type === "string"){
        html += field.name + ":" + '<input type="text" name="' + field.name + '" data-metakey="' + field.name + '" value="' + JSONTable.orEmpty(model.meta[field.name]) + '"><br>'
      } else if (field.type === "integer") {
        html += field.name + ":" + '<input type="number" name="' + field.name + '" data-metakey="' + field.name + '" value="' + JSONTable.orEmpty(model.meta[field.name]) + '"><br>'
      } else if (field.type === "select") {
        html += field.name + ":" +'<select' + ' data-metakey="' + field.name + '">'
        for (var j = 0; j < field.options.length; j++) {
          html += '<option value="' + field.options[j] + '"'
          html += (model.meta[field.name] === field.options[j] ? ' selected' : '')
          html += '>' + field.options[j] + '</option>'
        }
        html += '</select><br>'
      }
    }
    var metaFieldsContainer = JSONTable.qs('#' + this.metaFieldsId, this.container)
    metaFieldsContainer.innerHTML = html
  },

  focusCurrentCell: function (currentCell) {
    var selector = "[data-row='" + String(currentCell.row) + "'][data-col='" + String(currentCell.col) + "']"
    var cell = JSONTable.qs(selector, this.container)
    if (cell) {
      cell.focus()
      setTimeout(function () { JSONTable.setEndOfContenteditable(cell) }, 0)
    }
  },

  metaFieldsContainer: function () {
    var html = '<div class="jt-meta-fields" id="' + this.metaFieldsId + '">'
    html += '</div>'
    return html
  },

  formatOptionsContainer: function () {
    var html = '<div class="jt-format-options" id="' + this.formatOptionsId + '">'
    html += '</div>'
    return html
  },

  utilButtons: function () {
    var html =
          '<div class="jt-row-btn" id="' + this.rowBtnId + '">' +
          '<button data-code="3" title="add a row">+</button>' +
          '<button data-code="4" title="remove a row">-</button>' +
          '</div>' +

          '<div class="jt-col-btn" id="' + this.colBtnId + '">' +
          '<button data-code="1" title="add a column">+</button>' +
          '<button data-code="2" title="remove a column">-</button>' +
          '</div>'

    return html
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
