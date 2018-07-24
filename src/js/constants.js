var COLUMN_WIDTH = 16
var BORDER_WIDTH = 1
var DEFAULTOPTIONS = {
  formatOptions: [
    {
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
  ],
  defaultRows: 3,
  defaultColumns: 3,
  maxColumns: 1000,
  maxRows: 1000,
  selectorWrongMsg: 'Can\'t find html element with given selector.',
  formatOptionsId: 'jt-format-options',
  colBtnId: 'jt-col-btn',
  rowBtnId: 'jt-row-btn',
  expandOptionsId: 'jt-expand-options',
  toggleOptionsId: 'jt-options-toggle',
  tableMainClass: 'js-main-table'
}
