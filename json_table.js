(function () {
    'use strict';

    function Grid(el, callback, rows, columns) {
        return this.init(el, callback, rows, columns);
    }

    var COLUMN_WIDTH = 16,
        BORDER_WIDTH = 1;

    Grid.prototype = {
        init: function (el, callback, rows, columns) {
            this.root = el;
            this.callback = callback;
            this.rows = rows;
            this.columns = columns;
            return this.render();
        },

        setCurrentCell: function (cell) {
            this.currentCell = cell;
        },

        markCells: function () {
            [].forEach.call(this.cellsElements, function (el) {
                var cell = {
                        column: parseInt(el.dataset.column, 10),
                        row: parseInt(el.dataset.row, 10)
                    },
                    active = this.currentCell &&
                             cell.row <= this.currentCell.row &&
                             cell.column <= this.currentCell.column;

                if (active === true) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            }.bind(this));
        },

        generateCells: function () {
            var row = -1;

            this.cells = [];

            for (var i = 0; i < this.rows * this.columns; i++) {
                var column = i % this.columns;

                if (column === 0) {
                    row++;
                }

                this.cells.push({
                    column: column,
                    row: row,
                    active: false
                });
            }
        },

        html: function () {
            var width = this.columns * COLUMN_WIDTH + BORDER_WIDTH * 2,
                height = this.rows * COLUMN_WIDTH + BORDER_WIDTH * 2,
                html = '<div class="jt-grid clearfix" style="width:' + width + 'px;height:' + height + 'px;">';
            html += this.cellsHTML();
            html += '</div>';
            return html;
        },

        cellsHTML: function () {
            var html = '';
            this.generateCells();
            this.cells.map(function (cell) {
                html += '<a href="#" class="jt-grid--cell' +
                        (cell.active === true ? ' active' : '') +
                        '" ' + 'data-row="' + cell.row +
                        '" data-column="' + cell.column + '">';
                html += '</a>';
            });
            return html;
        },

        render: function () {
            this.root.innerHTML = this.html();
            this.cellsElements = this.root.querySelectorAll('a');
            this.bindEvents();
        },

        bindEvents: function () {
            [].forEach.call(this.cellsElements, function (el) {
                this.onMouseEnter(el);
                this.onClick(el);
            }.bind(this));
        },

        onMouseEnter: function (el) {
            var self = this,
                timer;

            el.addEventListener('mouseenter', function () {
                clearTimeout(timer);

                var dataset = this.dataset;

                timer = setTimeout(function () {
                    self.currentCell = {
                        column: parseInt(dataset.column, 10),
                        row: parseInt(dataset.row, 10)
                    };
                    self.markCells();
                }, 50);
            });
        },

        onClick: function (el) {
            var self = this;
            el.addEventListener('click', function (e) {
                e.preventDefault();
                self.callback(this.dataset.row, this.dataset.column);
            });
        }
    };

    function JSONTableView(container, formatOptions) {
        return this.init(container, formatOptions);
    }

    JSONTableView.prototype = {
        init: function (container, formatOptions) {
            this.table = document.createElement("table");
            this.table.setAttribute("class", "js-main-table");
            this.cellTag = "td";
            this.container = container;
            this.formatOptions = formatOptions;
            this.formatOptionsId = "jt-format-options";
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
            container.insertAdjacentHTML('afterbegin', this.formatOptionsContainer());
            this.updateFormatOptions();
            container.insertAdjacentHTML('beforeend', this.utilButtons());
        },

        update: function (model) {
            this.table.innerHTML = this.html(model.meta.rows, model.meta.columns, model.data);
            if (model.currentCell) {
                this.focusCurrentCell(model.currentCell);
            }
            return true;
        },

        updateFormatOptions: function (currentCellFormat) {
            var optionsContainer = JSONTable.qs("#" + this.formatOptionsId, this.container);
            optionsContainer.innerHTML = this.formatButtons(currentCellFormat) + this.formatRadioButtons(currentCellFormat);
        },

        formatRadioButtons: function (currentCellFormat) {
            var html = "",
                radioButtons = this.formatOptions.filter(function(a){return a.type == "radio" });
            for (var i = 0; i < radioButtons.length; i++) {
                html += '<span>';
                for (var j = 0; j < radioButtons[i].options.length; j++) {
                    var option = radioButtons[i].options[j];
                    html += '<button data-code="5" data-formatkey="'
                    + radioButtons[i].name
                    + '" data-val="'
                    + option
                    + '" title="'
                    + option + ' ' + radioButtons[i].name
                    + '" class="'
                    + (currentCellFormat && currentCellFormat[radioButtons[i].name] === option ? ' active' : '')
                    + '"'
                    + (currentCellFormat ? ' ' : ' disabled')
                    + '>'
                    + option
                    + '</button>';
                }
                html += '</span>';
            }
            return html;
        },

        formatButtons: function (currentCellFormat) {
            var html = "",
                formatButtons = this.formatOptions.filter(function(a){return a.type == "button" });
            for (var i = 0; i < formatButtons.length; i++) {
                html += '<button data-code="5" data-formatkey="'
                + formatButtons[i].name
                + '" class="'
                + (currentCellFormat && currentCellFormat[formatButtons[i].name] ? ' active' : '')
                + '"'
                + (currentCellFormat ? ' ' : ' disabled')
                + '>'
                + formatButtons[i].innerHTML
                + '</button>';
            }
            return html;
        },

        focusCurrentCell: function (currentCell) {
            var selector = "[data-row='" + String(currentCell.row) + "'][data-col='" + String(currentCell.col) + "']",
                cell = JSONTable.qs(selector, this.container);
            if (cell) {
                cell.focus();
                setTimeout(function(){JSONTable.setEndOfContenteditable(cell)},0);
            }
        },

        formatOptionsContainer: function () {
            var html = '<div class="jt-format-options" id="' + this.formatOptionsId + '">';
            html += '</div>';
            return html;
        },

        utilButtons: function () {
            var html
            = '<div class="jt-row-btn" id="' + this.rowBtnId + '">'
            +     '<button data-code="3" title="add a row">+</button>'
            +     '<button data-code="4" title="remove a row">-</button>'
            + '</div>'

            + '<div class="jt-col-btn" id="' + this.colBtnId + '">'
            +      '<button data-code="1" title="add a column">+</button>'
            +      '<button data-code="2" title="remove a column">-</button>'
            + '</div>';

            return html;
        },

        html: function (rows, columns, data) {
            var html = "";
            for (var i = 0; i < rows; i++) {
                html += "<tr>";
                for (var j = 0; j < columns; j++) {
                    html += this.cell(i, j, data[i][j]);
                }
                html += "</tr>";
            }
            return html;
        },

        cell: function (i, j, data) {
            var html = "";
            html += "<" + this.cellTag + " contenteditable";
            html += " data-row='" + i + "'";
            html += " data-col='" + j + "'";
            html += " class='" + this.cellClassList(data.format) + "'";
            html += ">" + data.content + "</" + this.cellTag + ">";
            return html;
        },

        cellClassList: function (format) {
          var classList = "";
          if (format && typeof format === "object") {
              for (var property in format) {
                  if (format.hasOwnProperty(property) && format[property]) {
                      if (format[property] !== "true" && format[property] !== true){
                          //case of radio buttons
                          classList += "jt-cell-" + format[property].replace(/ /g, "-") + " ";
                      } else {
                          classList += "jt-cell-" + property.replace(/ /g, "-") + " ";
                      }
                  }
              }
          }
          return classList;
        }
    };

    function JSONTableModel(table_data) {
        return this.init(table_data);
    }

    JSONTableModel.prototype = {
        init: function (table_data) {
            this.table_data = table_data || { meta: {}, data: [] };
            this.meta = this.table_data.meta;
            this.data = this.table_data.data;
            this.meta.rows = null;
            this.meta.columns = null;
            this.currentCell = null;
            this.data_changed_event = new Event('data_changed');
        },

        isValidData: function () {
            var data = this.data;
            return data && typeof data === 'object' &&
                  data.constructor === Array &&
                  data.length && data[0].length && data[0][0].hasOwnProperty('content');
        },

        setRowCol: function () {
            this.setRowCol(this.data.length, this.data[0].length);
        },

        setDefaultData: function (rows, columns) {
            this.setRowCol(rows,columns);
            this.updateDataAddRemoveExtraRowColumn();
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
            this.meta.rows += 1;
            this.updateDataAddRemoveExtraRowColumn();
        },

        removeARow: function () {
            if (this.meta.rows > 1) {
                this.meta.rows -= 1;
                this.updateDataAddRemoveExtraRowColumn();
            }
        },

        addAColumn: function () {
            this.meta.columns += 1;
            this.updateDataAddRemoveExtraRowColumn();
        },

        removeAColumn: function () {
            if (this.meta.columns > 1) {
                this.meta.columns -= 1;
                this.updateDataAddRemoveExtraRowColumn();
            }
        },

        updateFormatOfCurrentCell: function (formatkey, event) {
            var currentCell = this.currentCell;
            if (currentCell && event.target.dataset.val) {
                this.data[currentCell.row][currentCell.col].format[formatkey] = event.target.dataset.val;
            } else if (currentCell) {
                var format = this.data[currentCell.row][currentCell.col].format;
                this.data[currentCell.row][currentCell.col].format[formatkey] = !format[formatkey];
            }
        },

        updateDataAddRemoveExtraRowColumn: function () {
            var rows = this.meta.rows,
                columns = this.meta.columns;
            while (this.data.length != rows) {
                if (this.data.length > rows) {
                    this.data.pop();
                } else if (this.data.length < rows) {
                    this.data.push([]);
                } else {
                    break;
                }
            }

            for (var i = 0; i < rows; i++) {
                while (this.data[i].length != columns) {
                    if (this.data[i].length > columns) {
                        this.data[i].pop();
                    } else if (this.data[i].length < columns) {
                        this.data[i].push(this.defaultCellData());
                    } else {
                        break;
                    }
                }
            }
        },

        setRowCol: function (rows, columns) {
            rows = Number(rows);
            columns = Number(columns);
            this.meta.rows = rows;
            this.meta.columns = columns;
        },

        defaultCellData: function () {
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
            this.bindEventOnCell("focus", function(e) {
                self.handleCellFocus(e);
            });
            this.bindEventOnCell("blur", function(e) {
                self.handleCellBlur(e);
            });
            this.bindEventOnFormatingOptions();
        },

        bindEventOnCell: function (type, handler) {
            JSONTable.delegate(this.view.table, this.view.cellTag, type, handler);
        },

        bindEventOnFormatingOptions: function () {
            var self = this;
            var btnIds = [this.view.formatOptionsId, this.view.rowBtnId, this.view.colBtnId];
            for (var i = 0; i < btnIds.length; i++) {
                JSONTable.delegate(
                    JSONTable.qs("#" + btnIds[i], this.view.container),
                    "button",
                    "click",
                    function(e){
                        self.handleBtnClick(e);
                    }
                );
            }
        },

        handleCellFocus: function (event) {
            var self = this;
            this.model.setCurrentCell(event.target.dataset);
            setTimeout(function () {
                self.view.updateFormatOptions(self.model.data[event.target.dataset.row][event.target.dataset.col].format);
            },11);

        },

        handleCellBlur: function (event) {
            var self = this;
            this.model.updateContent(event);
            this.view.container.dispatchEvent(this.model.data_changed_event);
            setTimeout(function () {
                if (self.blur_created_by_button_click) {
                    self.blur_created_by_button_click = false;
                } else {
                    self.view.updateFormatOptions();
                }
            },9);
        },

        handleBtnClick: function (event) {
            this.blur_created_by_button_click = true;
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
                this.model.updateFormatOfCurrentCell(dataset.formatkey, event);
            }

            this.view.container.dispatchEvent(this.model.data_changed_event);

            this.view.update(this.model);
        }
    };

    function JSONTable(selector, table_data) {
        return this.init(selector, table_data);
    }

    JSONTable.prototype = {
        init: function (selector, table_data, options) {
            if (!options || typeof options !== 'object') {
                options = {};
            }
            this.gridRows = options.gridRows || 10;
            this.gridColumns = options.gridColumns || 10;
            this.formatOptions = options.formatOptions || [{
                  type: 'button',
                  name: 'bold',
                  innerHTML: 'Bold'
                },
                {
                  type: 'button',
                  name: 'italic',
                  innerHTML: 'Italic'
                },
                {
                  type: 'radio',
                  name: 'align',
                  options: ['left', 'center', 'right']
                }
              ];
            this.container = JSONTable.qs(selector);
            this.model = new JSONTableModel(table_data);
            this.view = new JSONTableView(this.container, this.formatOptions);
            this.controller = new JSONTableController(this.view, this.model);
            this.setupTable();
        },

        setupTable: function () {
            if (this.model.isValidData()) {
                this.model.setRowCol();
                this.initTable();
            } else {
                this.grid =
                    new Grid(this.container,
                        function (row, column) {
                            this.model.setDefaultData(Number(row) + 1, Number(column) + 1);
                            this.initTable();
                        }.bind(this),
                        this.gridRows,
                        this.gridColumns
                    );
            }
        },

        initTable: function () {
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

    // https://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity/3866442#3866442
    JSONTable.setEndOfContenteditable = function (contentEditableElement) {
        var range,selection;
        if(document.createRange)
        {
            range = document.createRange();
            range.selectNodeContents(contentEditableElement);
            range.collapse(false);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
        else if(document.selection)
        {
            range = document.body.createTextRange();
            range.moveToElementText(contentEditableElement);
            range.collapse(false);
            range.select();
        }
    }

    window.JSONTable = JSONTable;
})();
