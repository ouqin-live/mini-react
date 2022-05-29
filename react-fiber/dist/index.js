const data = {
  item1: 'bb',
  item2: 'cc'
};
const jsx = createElement("ul", {
  className: "list"
}, createElement("li", {
  className: "item",
  style: {
    background: 'blue',
    color: 'pink'
  },
  onClick: () => alert(2)
}, "aa"), createElement("li", {
  className: "item"
}, data.item1, createElement("i", null, "xxx")), createElement("li", {
  className: "item"
}, data.item2));
console.log(JSON.stringify(jsx, null, 4));
minireact.render(jsx, document.getElementById("root"));