## JSON Editable Table
JSON table is a minimal, yet flexible HTML table editor, where you can attach formatting to each cell and it gives you JSON output.

## Demo
[https://rajatsingla.github.io/JSON-table/](https://rajatsingla.github.io/JSON-table/)

## Screenshot
![Screen Cast](https://media.giphy.com/media/fxq5c5vwZErxoESC7Q/giphy.gif)

## Features
It is **not** meant to be a viewer for large spreadsheet data.

It is intended to maintain HTML tables and save JSON data which you can use anywhere.

You can -
1. Attach meta information to a table like name, description, number of rows, index of header row etc.
2. Edit content of each cell.
3. Attach formatting to each cell like bold, right align, Italic etc.
4. Initialize with JSON table data.
5. Subscribe to content change callback.
6. Keyboard shortcuts up, down keys, tab, reverse tab, undo, redo.

**USE CASE-** Just to attach formatting information to each cell and content of each cell.
Then you can use this JSON data to show table anywhere be it web, andriod, ios, shell etc.

## Build status
[![Build Status](https://travis-ci.org/rajatsingla/JSON-table.svg?branch=master)](https://travis-ci.org/rajatsingla/JSON-table)

## Code style
Using Standard code style.

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Tech/framework used
Built With vanillaJS (ES5)

## Quick Start
#### Get the file
The easiest way to use JSONTable in your project is via the Bower package manager.
`bower install json-table`

Also, you can download it using npm.
`npm install json-table`

Otherwise, download the zip folder from [here](https://github.com/rajatsingla/JSON-table), extract it, and copy  dist/json-table.min.js into your project’s folder.

#### Link the javascript file
`<script type="text/javascript" src="bower_components/json-table/dist/json-table.min.js"></script>`        
    
`<link rel="stylesheet" href="bower_components/json-table/dist/json-table.min.css" />`               
Note: If you didn’t install using Bower, you need to adjust the path of the JS and CSS file to match your file structure.

#### Initialize the table
`table = new JSONTable(<selector for container>, <Options Object (optional)>, <JSON data (optional)>);`

Example:-
`<div id="foobar"></div>`                
`table = new JSONTable("#foobar")`

## Get Data
`table.model.table_data`

#### Attach a callback to data_change
```js
table.view.container.addEventListener('data_changed',function(){
  console.log('table.model.table_data')
})
```

## Options Object
Options Object can have following keys

* **gridRows**
For defining default rows in grid.             
Default value is 10

* **gridColumns**
For defining default columns in grid.            
Default value is 10

* **formatOptions**
For defining format buttons on editor, like bold, underline etc.           
More info on [formatOptions](https://github.com/rajatsingla/JSON-table#more-info-on-formatOptions)            
Default value is
```js
[
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
]
```

* **metaFields**
Meta Fields for each table like name, description etc.                
More info on [metaFields](https://github.com/rajatsingla/JSON-table#more-info-on-metafields)                   
Default value is
```js
[
  {
    type: 'string',
    name: 'name'
  },
  {
    type: 'string',
    name: 'description'
  }
]
```

## Examples of Options Object
`table = new JSONTable(<selector for container>, <Options Object (optional), <JSON data (optional)>);
`
```
table = new JSONTable("#foobar", {
    gridColumns: 10,
    gridRows: 10
  })
```

```js
table = new JSONTable("#foobar", {
    gridColumns: 10,
    gridRows: 10,
    formatOptions: [
      {
        type: 'button',
        name: 'bold',
        innerHTML: 'Bold'
      },
    ],
    metaFields: [
      {
        type: 'string',
        name: 'name'
      }
    ]
  })
```

## More info on formatOptions
`formatOptions` is an object which determines the buttons for formatting each cell.            
There can be two types of formatOptions
1. `button`
```js
{
  type: 'button',
  name: 'bold',
  innerHTML: 'Bold'
}
```
This will add a button named `bold` in format buttons.                
Button click will add `true` to active cell's format data under key `bold`.                           
You can add multiple button types and any name based on your format need, use your imagination.                   
Button click will also add a class named `jt-cell-bold` to active cell.                     
CSS for some of the classes is written, if you use some other name you may have to write css for that class.                     
innerHTML is for button's innerHTML.                    

2. `radio`
```js
{
  type: 'radio',
  name: 'align',
  options: ['left', 'center', 'right']
}
```
This will add three buttons `left`, `center`, `right` in format buttons.                             
These will behave like radio buttons and only one will be active at a time.                       
If `center` is active it will add `center` to active cell's format data under key 'align'.                     
You can add multiple radio types and any number of options based on your format need, use your imagination.                  
If `center` is active it will also add a class named `jt-cell-center` to active cell.                   
CSS for some of the classes is written, if you use some other options you may have to write css for that class.                          
[How to pass formatOptions](https://github.com/rajatsingla/JSON-table#examples-of-options-object)


## More info on metaFields
`metaFields` is an object which determines the meta fields, like name, description etc.                   
There can be three types of metaFields.
1. `string`
```js
{
  type: 'string',
  name: 'name'
}
```
This will add a input box with title `name` and its value will be added in table meta.                 
You can add multiple string type fields , use your imagination.

2. `integer`
```js
{
  type: 'integer',
  name: 'Header Row Index'
}
```
This will add a input box of integer type with title `Header Row Index` and its value will be added in table meta.             
You can add multiple integer type fields , use your imagination.

3. `select`
```js
{
  type: 'select',
  name: 'Is this Table Ok',
  options: ['yes', 'no', 'whatever']
}
```
This will add a select box with options and title `Is this Table Ok` and its value will be added in table meta.            
You can add multiple select boxes , use your imagination.          

[How to pass formatOptions](https://github.com/rajatsingla/JSON-table#examples-of-options-object)

## Contribute
* Fork this project.
* Make changes in src/.js or src/.css
* Run `gulp build`
* Generate a PR

## License
LICENSE (MIT)
