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
