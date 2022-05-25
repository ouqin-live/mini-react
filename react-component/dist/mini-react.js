const render = (vdom, parent) => {
  const mount = parent ? el => parent.appendChild(el) : el => el;

  if (isTextVdom(vdom)) {
    // 处理文字、数字元素
    return mount(document.createTextNode(vdom));
  } else if (isElementVdom(vdom)) {
    //处理普通元素
    const dom = mount(document.createElement(vdom.type));

    for (const child of [].concat(...vdom.children)) {
      render(child, dom);
    }

    for (const prop in vdom.props) {
      setAttribute(dom, prop, vdom.props[prop]);
    }

    return dom;
  } else if (isComponentVdom(vdom)) {
    //处理组件元素
    const props = Object.assign({}, vdom.props, {
      children: vdom.children
    });

    if (Component.isPrototypeOf(vdom.type)) {
      //如果是类组件
      const instance = new vdom.type(props);
      instance.componentWillMount();
      const componentVdom = instance.render();
      instance.dom = render(componentVdom, parent);
      instance.componentDidMount();
      return instance.dom;
    } else {
      // 如果是函数组件
      const componentVdom = vdom.type(props);
      return render(componentVdom, parent);
    }
  } else {
    throw new Error(`Invalid VDOM: ${vdom.toString()}.`);
  }
};

const createElement = (type, props = {}, ...children) => {
  return {
    type,
    props,
    children
  };
};

class Component {
  constructor(props) {
    this.props = props || {};
    this.state = null;
  }

  setState(nextState) {
    this.state = nextState;
  }

  componentWillMount() {
    return undefined;
  }

  componentDidMount() {
    return undefined;
  }

} // 判断元素类型


function isTextVdom(vdom) {
  return typeof vdom == 'string' || typeof vdom == 'number';
}

function isElementVdom(vdom) {
  return typeof vdom == 'object' && typeof vdom.type == 'string';
}

function isComponentVdom(vdom) {
  return typeof vdom.type == 'function';
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