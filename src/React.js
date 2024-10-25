/**
 * 1. Currently, works only for functional components
 * 2. Yet to handle Fragments
 */

let Root = null;
let vRoot = null;
let curComp = null;

//---- Start temp state -----
let currentStateIndex = 0;
let currentEffectIndex = 0;
// if component is in initial render state or update state
//---- End temp state -----

let curCompTree = [];
let isReconciling = false;
let recParent = null;
let recComp = null;
let recParentIndex = -1;

class ReactNode {
  constructor(component = null, props = {}) {
    /** @type {HTMLElement | null} */
    this.element = null;
    this.parent = null;
    this.component = component;
    this.props = props;
    this.children = [];
    this.states = [];
    this.effects = [];
    this.stateCount = 0;
    this.effectCount = 0;
    this.isMounted = false;
  }
}

const React = {
  createRoot: (elem) => {
    Root = elem;
  },

  createElement: (type, props = {}, ...children) => {
    // console.log(typeof type === 'function' ? type.name : type);
    // type can be either a string or a refer to functional / class / Fragment component
    // https://react.dev/reference/react/createElement#parameters
    let comp = new ReactNode(type ?? null, props);
    if (typeof type === 'function') {
      curComp = comp;
      currentStateIndex = 0;
      const funcComp = type(props);
      Object.assign(comp, {
        element: funcComp.element,
        children: funcComp.children,
      });
      // comp.__reactNode = comp; // attach the component to the element
      comp.isMounted = true;
      return comp;
    }

    const element = type
      ? document.createElement(type)
      : document.createDocumentFragment();

    if (type && props) {
      Object.keys(props).forEach((key) => {
        if (key.startsWith('on')) {
          element.addEventListener(key.substring(2).toLowerCase(), props[key]);
        } else if (key === 'className') {
          element.className = props[key];
        } else if (key === 'key' || key === 'ref') {
          element[key] = props[key];
        } else {
          element.setAttribute(key, props[key]);
        }
      });
    }

    children.forEach((child) => {
      if (child instanceof ReactNode) {
        child.parent = comp;
        comp.children.push(child);
        element.appendChild(child.element);
      } else {
        const textElem = document.createTextNode(child);
        const textComp = new ReactNode();
        textComp.element = textElem;
        comp.children.push(textComp);
        element.appendChild(textElem);
      }
    });
    comp.element = element;
    return comp;
  },

  useState: (value, lazyEval) => {
    let comp = curComp;
    let stateIndex = currentStateIndex;
    if (comp) {
      if (!comp.isMounted) {
        comp.states.push(value);
        comp.stateCount += 1;
      } else if (stateIndex > comp.states.length) {
        throw new Error('Invalid Hook. Found Hooks are used conditionally.');
      }
      currentStateIndex += 1;
    }

    if (!comp.isMounted) {
      comp.states[stateIndex] = lazyEval ? lazyEval(value) : value;
    }

    let updateValue = (newVal) => {
      curComp = comp;
      currentStateIndex = 0;
      isReconciling = true;
      const updatedValue =
        typeof newVal !== 'function' ? newVal : newVal(comp.states[stateIndex]);
      if (!Object.is(comp.states[stateIndex], updatedValue)) {
        comp.states[stateIndex] = updatedValue;
        const newNode = comp.component(comp.props);
        React.reconcile(newNode, comp);
        // comp.element.replaceWith(newNode.element);
        // comp.element = newNode.element;
      }
    };
    return [comp.states[stateIndex], updateValue];
  },

  // TODO: Implement useEffect
  useEffect: (cb, deps) => {
    curComp.effects.push(deps);
    currentEffectIndex += 1;
    if (
      !curComp.effects[currentEffectIndex].some(
        (dep, index) => !Object.is(dep, deps[index])
      )
    ) {
      cb();
    }
  },

  /**
   *
   * @param {ReactNode} oldNode
   * @param {ReactNode} newNode
   */
  reconcile(newNode, oldNode) {
    if (oldNode.element.tagName !== newNode.element.tagName) {
      Object.assign(oldNode, newNode, { parent: oldNode.parent });
    } else {
      if (oldNode.element instanceof Text) {
        if (oldNode.element !== newNode.element) {
          oldNode.element.replaceWith(newNode.element);
          oldNode.element = newNode.element;
        }
      } else {
        const oldAttribs = oldNode.element.attributes;
        const oldAttribKeys = [...oldNode.element.attributes].map(
          (attrib) => attrib.name
        );
        const newAttribs = newNode.element.attributes;
        const newAttribKeys = [...newNode.element.attributes].map(
          (attrib) => attrib.name
        );
        for (let attrib of newAttribKeys) {
          if (!Object.is(oldAttribs[attrib]?.value, newAttribs[attrib].value)) {
            oldNode.element.setAttribute(attrib, newAttribs[attrib].value);
          }
        }
        for (let attrib of oldAttribKeys) {
          if (!newAttribKeys.includes(attrib)) {
            oldNode.element.removeAttribute(attrib);
          }
        }

        let newNodeChildren = newNode.children;
        let oldNodeChildren = oldNode.children;
        for (let i = 0; i < newNodeChildren.length; i++) {
          let shouldRerender = false;
          if (typeof newNodeChildren[i].component === 'function') {
            const oldNodeProps = oldNodeChildren[i].props || {};
            const newNodeProps = newNodeChildren[i].props || {};
            for (let key of Object.keys(newNodeProps)) {
              if (!Object.is(oldNodeProps[key], newNodeProps[key])) {
                shouldRerender = true;
                break;
              }
            }
          } else {
            shouldRerender = true;
          }
          if (!shouldRerender) continue;
          React.reconcile(newNode.children[i], oldNode.children[i]);
        }
      }
    }
  },

  render(comp) {
    console.log('root node ', comp);
    vRoot = comp;
    Root.appendChild(comp.element);
  },
};

export default React;
