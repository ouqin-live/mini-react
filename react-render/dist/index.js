const jsx = createElement("ul", {
  className: "list"
}, createElement("li", {
  className: "item",
  style: {
    background: 'blue',
    color: 'pink'
  },
  onClick: () => alert(2)
}, "aaa"), createElement("li", {
  className: "item"
}, "bbbb"), createElement("li", {
  className: "item"
}, "cccc"));
render(jsx, document.getElementById('root'));