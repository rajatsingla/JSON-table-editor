function JSONTableKeyboardShortcuts (view, model) {
  return this.init(view, model)
}

JSONTableKeyboardShortcuts.prototype = {
  init: function (view, model) {
    this.view = view
    this.model = model
    this.bindUpKey()
    this.bindDownKey()
  },

  bindUpKey: function () {
    var self = this
    this.view.container.addEventListener('keydown', function (event) {
      if (event.keyCode === 38 && self.model.currentCell) {
        self.moveArrowUpDown(-1)
      }
    })
  },

  bindDownKey: function () {
    var self = this
    this.view.container.addEventListener('keydown', function (event) {
      if (event.keyCode === 40 && self.model.currentCell) {
        self.moveArrowUpDown(1)
      }
    })
  },

  moveArrowUpDown: function (direction, keyCode) {
    var currentCell = Object.assign({}, this.model.currentCell)
    currentCell.row = (Number(currentCell.row) + direction + this.model.meta.rows) % this.model.meta.rows
    this.view.focusCurrentCell(currentCell)
  }
}
