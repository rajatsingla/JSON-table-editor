function JSONTableController (view, model) {
  return this.init(view, model)
}

JSONTableController.prototype = {
  init: function (view, model) {
    this.view = view
    this.model = model
  },

  bindEvents: function () {
    var self = this
    this.bindEventOnCell('focus', function (e) {
      self.handleCellFocus(e)
    })
    this.bindEventOnCell('blur', function (e) {
      self.handleCellBlur(e)
    })
    this.bindEventOnFormatingOptions()
  },

  bindEventOnCell: function (type, handler) {
    JSONTable.delegate(this.view.table, this.view.cellTag, type, handler)
  },

  bindEventOnFormatingOptions: function () {
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
    }
  },

  handleCellFocus: function (event) {
    var self = this
    this.model.setCurrentCell(event.target.dataset)
    setTimeout(function () {
      self.view.updateFormatOptions(self.model.data[event.target.dataset.row][event.target.dataset.col].format)
    }, 50)
  },

  handleCellBlur: function (event) {
    var self = this
    this.model.updateContent(event)
    this.view.container.dispatchEvent(this.model.data_changed_event)
    setTimeout(function () {
      if (self.blur_created_by_button_click) {
        self.blur_created_by_button_click = false
      } else {
        self.view.updateFormatOptions()
      }
    }, 49)
  },

  handleBtnClick: function (event) {
    this.blur_created_by_button_click = true
    event.preventDefault()
    event.stopPropagation()
    var dataset = event.target.dataset
    var code = window.Number(dataset.code)
    if (code === 1) {
      this.model.addAColumn()
    } else if (code === 2) {
      this.model.removeAColumn()
    } else if (code === 3) {
      this.model.addARow()
    } else if (code === 4) {
      this.model.removeARow()
    } else if (code === 5) {
      this.model.updateFormatOfCurrentCell(dataset.formatkey, event)
    }

    this.view.container.dispatchEvent(this.model.data_changed_event)

    this.view.update(this.model)
  }
}
