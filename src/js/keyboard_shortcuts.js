function JSONTableKeyboardShortcuts (view, model) {
  return this.init(view, model)
}

JSONTableKeyboardShortcuts.prototype = {
  init: function (view, model) {
    this.view = view
    this.model = model
    this.bindArrowKeys()
  },

  bindArrowKeys: function () {
    var self = this
    this.view.container.addEventListener('keydown', function (event) {
      if (self.model.currentCell && event.target.tagName === 'TD') {
        if (event.keyCode === 37 && JSONTable.cursorAtEndOrStart(event.target).atStart) {
          self.moveArrowLeftRight(-1)
        } else if (event.keyCode === 38 && JSONTable.cursorAtEndOrStart(event.target).atStart) {
          self.moveArrowUpDown(-1)
        } else if (event.keyCode === 39 && JSONTable.cursorAtEndOrStart(event.target).atEnd) {
          self.moveArrowLeftRight(1)
        } else if (event.keyCode === 40 && JSONTable.cursorAtEndOrStart(event.target).atEnd) {
          self.moveArrowUpDown(1)
        }
      }
    })
  },

  moveArrowUpDown: function (direction) {
    var currentCell = Object.assign({}, this.model.currentCell)
    currentCell.row = (Number(currentCell.row) + direction + this.model.meta.rows) % this.model.meta.rows
    if ((currentCell.row === 0 && direction === 1) || (currentCell.row === this.model.meta.rows - 1 && direction === -1)) {
      currentCell.col = (Number(currentCell.col) + direction + this.model.meta.columns) % this.model.meta.columns
    }
    this.view.focusCurrentCell(currentCell)
  },

  moveArrowLeftRight: function (direction) {
    var currentCell = Object.assign({}, this.model.currentCell)
    currentCell.col = (Number(currentCell.col) + direction + this.model.meta.columns) % this.model.meta.columns
    if ((currentCell.col === 0 && direction === 1) || (currentCell.col === this.model.meta.columns - 1 && direction === -1)) {
      currentCell.row = (Number(currentCell.row) + direction + this.model.meta.rows) % this.model.meta.rows
    }
    this.view.focusCurrentCell(currentCell)
  }
}
