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
  gridColumns: 10,
  gridRows: 10,
  selectorWrongMsg: 'Can\'t find html element with given selector.',
  metaFieldsId: 'jt-meta-fields',
  formatOptionsId: 'jt-format-options',
  colBtnId: 'jt-col-btn',
  rowBtnId: 'jt-row-btn',
  tableMainClass: 'js-main-table',
  metaFields: [
    {
      type: 'string',
      name: 'title'
    },
    {
      type: 'string',
      name: 'description'
    }
  ]
}
