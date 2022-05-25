const render = (vdom, parent) => {
  const mount = parent ? el => parent.appendChild(el) : el => el;

  if (isTextVdom(vdom)) {
    // 处理文字、数字元素
    return mount(document.createTextNode(vdom));
  } else if (isElementVdom(vdom)) {
    //处理普通元素
    const dom = mount(document.createElement(vdom.type));

    for (const child of vdom.children) {
      render(child, dom);
    }

    for (const prop in vdom.props) {
      setAttribute(dom, prop, vdom.props[prop]);
    }

    return dom;
  } else {
    throw new Error(`Invalid VDOM: ${vdom}.`);
  }
};

const createElement = (type, props = {}, ...children) => {
  return {
    type,
    props,
    children
  };
}; // 判断元素类型


function isTextVdom(vdom) {
  return typeof vdom == 'string' || typeof vdom == 'number';
}

function isElementVdom(vdom) {
  return typeof vdom == 'object' && typeof vdom.type == 'string';
} //处理元素属性


function setAttribute(dom, key, value) {
  if (isEventListenerAttr(key, value)) {
    const eventType = key.slice(2).toLowerCase();
    dom.addEventListener(eventType, value);
  } else if (isStyleAttr(key, value)) {
    Object.assign(dom.style, value);
  } else if (isPlainAttr(key, value)) {
    dom.setAttribute(key, value);
  }
}

function isEventListenerAttr(key, value) {
  return typeof value == 'function' && key.startsWith('on');
}

function isStyleAttr(key, value) {
  return key == 'style' && typeof value == 'object';
}

function isPlainAttr(key, value) {
  return typeof value != 'object' && typeof value != 'function';
}