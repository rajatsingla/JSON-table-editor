(function () {
    'use strict';

    function Grid(el, callback, rows, columns) {
        return this.init(el, callback, rows, columns);
    }

    var COLUMN_WIDTH = 16,
        BORDER_WIDTH = 1;

    Grid.prototype = {
        init: function (el, callback, rows, columns) {
            this._root = el;
            this._callback = callback;
            this.rows = rows;
            this.columns = columns;
            return this._render();
        },

        setCurrentCell: function (cell) {
            this._currentCell = cell;
        },

        markCells: function () {
            [].forEach.call(this._cellsElements, function (el) {
                var cell = {
                        column: parseInt(el.dataset.column, 10),
                        row: parseInt(el.dataset.row, 10)
                    },
                    active = this._currentCell &&
                             cell.row <= this._currentCell.row &&
                             cell.column <= this._currentCell.column;

                if (active === true) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            }.bind(this));
        },

        _generateCells: function () {
            var row = -1;

            this._cells = [];

            for (var i = 0; i < this.rows * this.columns; i++) {
                var column = i % this.columns;

                if (column === 0) {
                    row++;
                }

                this._cells.push({
                    column: column,
                    row: row,
                    active: false
                });
            }
        },

        _html: function () {
            var width = this.columns * COLUMN_WIDTH + BORDER_WIDTH * 2,
                height = this.rows * COLUMN_WIDTH + BORDER_WIDTH * 2,
                html = '<div class="jt-grid clearfix" style="width:' + width + 'px;height:' + height + 'px;">';
            html += this._cellsHTML();
            html += '</div>';
            return html;
        },

        _cellsHTML: function () {
            var html = '';
            this._generateCells();
            this._cells.map(function (cell) {
                html += '<a href="#" class="jt-grid--cell' +
                        (cell.active === true ? ' active' : '') +
                        '" ' + 'data-row="' + cell.row +
                        '" data-column="' + cell.column + '">';
                html += '</a>';
            });
            return html;
        },

        _render: function () {
            this._root.innerHTML = this._html();
            this._cellsElements = this._root.querySelectorAll('a');
            this._bindEvents();
        },

        _bindEvents: function () {
            [].forEach.call(this._cellsElements, function (el) {
                this._onMouseEnter(el);
                this._onClick(el);
            }.bind(this));
        },

        _onMouseEnter: function (el) {
            var self = this,
                timer;

            el.addEventListener('mouseenter', function () {
                clearTimeout(timer);

                var dataset = this.dataset;

                timer = setTimeout(function () {
                    self._currentCell = {
                        column: parseInt(dataset.column, 10),
                        row: parseInt(dataset.row, 10)
                    };
                    self.markCells();
                }, 50);
            });
        },

        _onClick: function (el) {
            var self = this;
            el.addEventListener('click', function (e) {
                e.preventDefault();
                self._callback(this.dataset.row, this.dataset.column);
            });
        }
    };

    function JSONTableView(container, formatButtons) {
        return this.init(container, formatButtons);
    }

    JSONTableView.prototype = {
        init: function (container, formatButtons) {
            this.table = document.createElement("table");
            this.table.setAttribute("class", "js-main-table");
            this.cellTag = "td";
            this.container = container;
            this.formatButtons = formatButtons;
            this.formatBtnId = "jt-format-btn";
            this.colBtnId = "jt-col-btn";
            this.rowBtnId = "jt-row-btn";
        },

        insert: function () {
            var container = this.container;
            if (container.firstChild) {
                container.replaceChild(this.table, container.childNodes[0]);
            } else {
                container.append(this.table);
            }
            container.insertAdjacentHTML('afterbegin', this._formatButtonsContainer());
            this.updateFormatButtons();
            container.insertAdjacentHTML('beforeend', this._utilButtons());
        },

        update: function (model) {
            this.table.innerHTML = this._html(model.rows, model.columns, model.data);
            if (model.currentCell) {
                this._focusCurrentCell(model.currentCell);
            }
            return true;
        },

        updateFormatButtons: function (currentCellFormat) {
            var btnContainer = JSONTable.qs("#" + this.formatBtnId, this.container),
                html = "";
            for (var i = 0; i < this.formatButtons.length; i++) {
                html += '<button data-code="5" data-formatkey="'
                + this.formatButtons[i]
                + '" class="'
                + (currentCellFormat && currentCellFormat[this.formatButtons[i]] ? ' active' : '')
                + '"'
                + (currentCellFormat ? ' ' : ' disabled')
                + '>'
                + this.formatButtons[i]
                + '</button>';
            }
            btnContainer.innerHTML = html;
        },

        _focusCurrentCell: function (currentCell) {
            var selector = "[data-row='" + String(currentCell.row) + "'][data-col='" + String(currentCell.col) + "']",
                cell = JSONTable.qs(selector, this.container);
            if (cell) {
                cell.focus();
            }
        },

        _formatButtonsContainer: function () {
            var html = '<div class="jt-format-btn" id="' + this.formatBtnId + '">';
            html += '</div>';
            return html;
        },

        _utilButtons: function () {
            var html
            = '<div class="jt-col-btn" id="' + this.colBtnId + '">'
            +      '<button data-code="1">add a column</button>'
            +      '<button data-code="2">remove a column</button>'
            + '</div>'

            + '<div class="jt-row-btn" id="' + this.rowBtnId + '">'
            +     '<button data-code="3">add a row</button>'
            +     '<button data-code="4">remove a row</button>'
            + '</div>';

            return html;
        },

        _html: function (rows, columns, data) {
            var html = "";
            for (var i = 0; i < rows; i++) {
                html += "<tr>";
                for (var j = 0; j < columns; j++) {
                    html += this._cell(i, j, data[i][j]);
                }
                html += "</tr>";
            }
            return html;
        },

        _cell: function (i, j, data) {
            var html = "";
            html += "<" + this.cellTag + " contenteditable";
            html += " data-row='" + i + "'";
            html += " data-col='" + j + "'";
            html += " class='" + this._cellClassList(data.format) + "'";
            html += ">" + data.content + "</" + this.cellTag + ">";
            return html;
        },

        _cellClassList: function (format) {
          var classList = "";
          if (format && typeof format === "object") {
              for (var property in format) {
                  if (format.hasOwnProperty(property) && format[property]) {
                      classList += "jt-cell-" + property.replace(/ /g, "-") + " ";
                  }
              }
          }
          return classList;
        }
    };

    function JSONTableModel(data) {
        return this.init(data);
    }

    JSONTableModel.prototype = {
        init: function (data) {
            this.data = data || [];
            this.rows = null;
            this.columns = null;
            this.currentCell = null;
        },

        isValidData: function () {
            var data = this.data;
            return data && typeof data === 'object' &&
                  data.constructor === Array &&
                  data.length && data[0].length && data[0][0].hasOwnProperty('content');
        },

        setRowCol: function () {
            this._setRowCol(this.data.length, this.data[0].length);
        },

        setDefaultData: function (rows, columns) {
            this._setRowCol(rows,columns);
            this._updateDataAddRemoveExtraRowColumn();
        },

        setCurrentCell: function (cell) {
            this.currentCell = cell;
        },

        updateContent: function (event) {
            var row = event.target.dataset.row;
            var column = event.target.dataset.col;
            this.data[row][column].content = event.target.innerHTML;
        },

        addARow: function () {
            this.rows += 1;
            this._updateDataAddRemoveExtraRowColumn();
        },

        removeARow: function () {
            if (this.rows > 1) {
                this.rows -= 1;
                this._updateDataAddRemoveExtraRowColumn();
            }
        },

        addAColumn: function () {
            this.columns += 1;
            this._updateDataAddRemoveExtraRowColumn();
        },

        removeAColumn: function () {
            if (this.columns > 1) {
                this.columns -= 1;
                this._updateDataAddRemoveExtraRowColumn();
            }
        },

        updateFormatOfCurrentCell: function (formatkey) {
            var currentCell = this.currentCell;
            if (currentCell) {
                var format = this.data[currentCell.row][currentCell.col].format;
                this.data[currentCell.row][currentCell.col].format[formatkey] = !format[formatkey];
            }
        },

        _updateDataAddRemoveExtraRowColumn: function () {
            while (this.data.length != this.rows) {
                if (this.data.length > this.rows) {
                    this.data.pop();
                } else if (this.data.length < this.rows) {
                    this.data.push([]);
                } else {
                    break;
                }
            }

            for (var i = 0; i < this.rows; i++) {
                while (this.data[i].length != this.columns) {
                    if (this.data[i].length > this.columns) {
                        this.data[i].pop();
                    } else if (this.data[i].length < this.columns) {
                        this.data[i].push(this._defaultCellData());
                    } else {
                        break;
                    }
                }
            }
        },

        _setRowCol: function (rows, columns) {
            rows = Number(rows);
            columns = Number(columns);
            this.rows = rows;
            this.columns = columns;
        },

        _defaultCellData: function () {
            var data = {};
            data.content = "";
            data.format = {};
            return data;
        }
    };

    function JSONTableController(view, model) {
        return this.init(view, model);
    }

    JSONTableController.prototype = {
        init: function (view, model) {
            this.view = view;
            this.model = model;
        },

        bindEvents: function () {
            var self = this;
            this._bindEventOnCell("focus", function(e) {
                self._handleCellFocus(e);
            });
            this._bindEventOnCell("blur", function(e) {
                self._handleCellBlur(e);
            });
            this._bindEventOnBtn();
        },

        _bindEventOnCell: function (type, handler) {
            JSONTable.delegate(this.view.table, this.view.cellTag, type, handler);
        },

        _bindEventOnBtn: function () {
            var self = this;
            var btnIds = [this.view.formatBtnId, this.view.rowBtnId, this.view.colBtnId];
            for (var i = 0; i < btnIds.length; i++) {
                JSONTable.delegate(
                    JSONTable.qs("#" + btnIds[i], this.view.container),
                    "button",
                    "click",
                    function(e){
                        self._handleBtnClick(e);
                    }
                );
            }
        },

        _handleCellFocus: function (event) {
            var self = this;
            this.model.setCurrentCell(event.target.dataset);
            setTimeout(function () {
                self.view.updateFormatButtons(self.model.data[event.target.dataset.row][event.target.dataset.col].format);
            },11);

        },

        _handleCellBlur: function (event) {
            var self = this;
            this.model.updateContent(event);
            setTimeout(function () {
                self.view.updateFormatButtons();
            },10);
        },

        _handleBtnClick: function (event) {
            event.preventDefault();
            event.stopPropagation();
            var dataset = event.target.dataset;
            if (dataset.code == 1) {
                this.model.addAColumn();
            } else if (dataset.code == 2) {
                this.model.removeAColumn();
            } else if (dataset.code == 3) {
                this.model.addARow();
            } else if (dataset.code == 4) {
                this.model.removeARow();
            } else if (dataset.code == 5) {
                this.model.updateFormatOfCurrentCell(dataset.formatkey);
            }

            this.view.update(this.model);
        }
    };

    function JSONTable(selector, data) {
        return this.init(selector, data);
    }

    JSONTable.prototype = {
        init: function (selector, data, options) {
            if (!options || typeof options !== 'object') {
                options = {};
            }
            this.gridRows = options.gridRows || 10;
            this.gridColumns = options.gridColumns || 10;
            this.formatButtons = options.formatButtons || ['bold', 'italic', 'large font'];
            this.container = JSONTable.qs(selector);
            this.model = new JSONTableModel(data);
            this.view = new JSONTableView(this.container, this.formatButtons);
            this.controller = new JSONTableController(this.view, this.model);
            this._setupTable();
        },

        _setupTable: function () {
            if (this.model.isValidData()) {
                this.model.setRowCol();
                this._initTable();
            } else {
                this.grid =
                    new Grid(this.container,
                        function (row, column) {
                            this.model.setDefaultData(Number(row) + 1, Number(column) + 1);
                            this._initTable();
                        }.bind(this),
                        this.gridRows,
                        this.gridColumns
                    );
            }
        },

        _initTable: function () {
            this.view.insert();
            this.view.update(this.model);
            this.controller.bindEvents();
        }
    };

    // helper functions
    JSONTable.qs = function (selector, scope) {
        return (scope || document).querySelector(selector);
    }

    JSONTable.qsa = function(selector, scope) {
        return (scope || document).querySelectorAll(selector);
    }

    JSONTable.on = function (target, type, callback, useCapture) {
        target.addEventListener(type, callback, !!useCapture);
    }

    JSONTable.delegate = function (target, selector, type, handler) {
        function dispatchEvent(event) {
            var targetElement = event.target;
            var potentialElements = JSONTable.qsa(selector, target);
            var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

            if (hasMatch) {
                handler.call(targetElement, event);
            }
        }
        // https://developer.mozilla.org/en-US/docs/Web/Events/blur
        var useCapture = type === 'blur' || type === 'focus';
        JSONTable.on(target, type, dispatchEvent, useCapture);
    }

    window.JSONTable = JSONTable;
})();
