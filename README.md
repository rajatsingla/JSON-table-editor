# JSON Editable Table

### INIT
`table = new JsonTable(<selector for container>, <JSON data (optional)>, <Object of options (optional)>);`

---

### GET DATA
`table.model.data`

---

### OPTIONS IN OPTIONS OBJECT
```js
options = {
  'gridRows': 10,
  'gridColumns': 10,
  'formatButtons': ['bold', 'italic', 'largeFont']
}
```
formatButtons list can consist of any string w/o spaces, use your imagination.

---

### JSON DATA FORMAT
```js
[
  [
    {
      "content": "Hello",
      "format": {
          "italic": false,
          "bold": true,
           ...  
        }
    },

    {
      "<another cell data>"
    },
  ],


  ["<another list of columns in a row>"],
  ...
]
```

### TODOS
* Update readme
* Convert this into npm package
* Fix CSS
* Fix bugs
* Add additional features, if any

