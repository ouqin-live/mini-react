function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    }
  };
  nextFiberReconcileWork = wipRoot;
}

function createElement(type, props, ...children) {
  return {
    type,
    props: { ...props,
      children: children.map(child => typeof child === "object" ? child : createTextElement(child))
    }
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  };
}

let nextFiberReconcileWork = null; //下一个调度的fiber点

let wipRoot = null; //wip根结点
// schdule 空闲调度

function workLoop(deadline) {
  let shouldYield = false;

  while (nextFiberReconcileWork && !shouldYield) {
    nextFiberReconcileWork = performNextWork(nextFiberReconcileWork); //让出调度

    shouldYield = deadline.timeRemaining() < 1;
  } // vdom 转 fiber 完毕，开始commit


  if (!nextFiberReconcileWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop); // Fiber = {
//     // 元素类型
//     type: any,  
//     // ...
//     // ⚛️ 链表结构
//     // 指向父节点，或者render该节点的组件
//     return: Fiber | null,
//     // 指向第一个子节点
//     child: Fiber | null,
//     // 指向下一个兄弟节点
//     sibling: Fiber | null,
//   }

function performNextWork(fiber) {
  reconcile(fiber); // 深度优先搜索

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.return;
  }
} // vdom -> fiber


function reconcile(fiber) {
  if (!fiber.dom) {
    //提前创建对应的 dom 节点
    fiber.dom = createDom(fiber);
  }

  reconcileChildren(fiber, fiber.props.children);
}

function createDom(fiber) {
  const dom = fiber.type == "TEXT_ELEMENT" ? document.createTextNode('') : document.createElement(fiber.type);

  for (const prop in fiber.props) {
    setAttribute(dom, prop, fiber.props[prop]);
  }

  return dom;
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

const setAttribute = (dom, key, value) => {
  if (key === 'children') {
    return;
  }

  if (key === 'nodeValue') {
    dom.textContent = value;
  } else if (isEventListenerAttr(key, value)) {
    const eventType = key.slice(2).toLowerCase();
    dom.addEventListener(eventType, value);
  } else if (isStyleAttr(key, value)) {
    Object.assign(dom.style, value);
  } else if (isPlainAttr(key, value)) {
    dom.setAttribute(key, value);
  }
};

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];
    let newFiber = {
      type: element.type,
      props: element.props,
      dom: null,
      return: wipFiber,
      effectTag: "PLACEMENT" //目前只做渲染，暂时不做 diff 和删除修改

    };

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
} // 提交 commit


function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.return;

  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.return;
  }

  const domParent = domParentFiber.dom; // 目前只有新增

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

const minireact = {
  createElement,
  render
};