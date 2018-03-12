function Grid (el, callback, rows, columns) {
  return this.init(el, callback, rows, columns)
}

Grid.prototype = {
  init: function (el, callback, rows, columns) {
    this.root = el
    this.callback = callback
    this.rows = rows
    this.columns = columns
    return this.render()
  },

  setCurrentCell: function (cell) {
    this.currentCell = cell
  },

  markCells: function () {
    [].forEach.call(this.cellsElements, function (el) {
      var cell = {
        column: parseInt(el.dataset.column, 10),
        row: parseInt(el.dataset.row, 10)
      }
      var active = this.currentCell &&
                           cell.row <= this.currentCell.row &&
                           cell.column <= this.currentCell.column

      if (active === true) {
        el.classList.add('active')
      } else {
        el.classList.remove('active')
      }
    }.bind(this))
  },

  generateCells: function () {
    var row = -1

    this.cells = []

    for (var i = 0; i < this.rows * this.columns; i++) {
      var column = i % this.columns

      if (column === 0) {
        row++
      }

      this.cells.push({
        column: column,
        row: row,
        active: false
      })
    }
  },

  html: function () {
    var width = this.columns * COLUMN_WIDTH + BORDER_WIDTH * 2
    var height = this.rows * COLUMN_WIDTH + BORDER_WIDTH * 2
    var html = '<div class="jt-grid clearfix" style="width:' + width + 'px;height:' + height + 'px;">'
    html += this.cellsHTML()
    html += '</div>'
    return html
  },

  cellsHTML: function () {
    var html = ''
    this.generateCells()
    this.cells.map(function (cell) {
      html += '<a href="#" class="jt-grid--cell' +
                      (cell.active === true ? ' active' : '') +
                      '" ' + 'data-row="' + cell.row +
                      '" data-column="' + cell.column + '">'
      html += '</a>'
    })
    return html
  },

  render: function () {
    this.root.innerHTML = this.html()
    this.cellsElements = this.root.querySelectorAll('a')
    this.bindEvents()
  },

  bindEvents: function () {
    [].forEach.call(this.cellsElements, function (el) {
      this.onMouseEnter(el)
      this.onClick(el)
    }.bind(this))
  },

  onMouseEnter: function (el) {
    var self = this
    var timer

    el.addEventListener('mouseenter', function () {
      clearTimeout(timer)

      var dataset = this.dataset

      timer = setTimeout(function () {
        self.currentCell = {
          column: parseInt(dataset.column, 10),
          row: parseInt(dataset.row, 10)
        }
        self.markCells()
      }, 50)
    })
  },

  onClick: function (el) {
    var self = this
    el.addEventListener('click', function (e) {
      e.preventDefault()
      self.callback(this.dataset.row, this.dataset.column)
    })
  }
}
