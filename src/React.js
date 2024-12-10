// TODO: Remove this when you need linting
/* eslint-disable */
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
    /** @type {ReactNode} */
    this.parent = null;
    /** @type {Function | String} */
    this.component = component;
    /** @type {Object} */
    this.props = props;
    /** @type {Array<ReactNode>} */
    this.children = [];
    /** @type {Array<any>} */
    this.states = [];
    this.effects = [];
    /** @type {String} */
    this.compkey = '';
    this.stateCount = 0;
    this.effectCount = 0;
    /** @type {Boolean} */
    this.isMounted = false;
  }
}

const React = {
  createRoot: (elem) => {
    Root = elem;
  },

  createElement: (type, props = {}, ...children) => {
    // type can be either a string or a refer to functional / class / Fragment component
    // https://react.dev/reference/react/createElement#parameters
    let compKey = typeof type === 'function' ? type.name : type;
    // console.log('compKey', compKey);
    if (isReconciling && typeof type === 'function') {
      const probCompKey = recParent.compKey
        ? `${recParent.compKey}_${recParentIndex}_${compKey}`
        : `${compKey}_${recParentIndex}`;
      const existingComp = recParent.children.find(
        (child) => child.compKey === probCompKey && child.component === type
      );
      if (existingComp) {
        console.log('comp found with the key');
        const comp = new ReactNode(type, props);
        comp.states = existingComp.states;
        comp.isMounted = existingComp.isMounted;
        curComp = comp;
        currentStateIndex = 0;
        const funcComp = type(props);
        Object.assign(comp, {
          element: funcComp.element,
          children: funcComp.children,
        });
        comp.compkey = probCompKey;
        return comp;
      }
    } else {
      console.log('no comp found with the key');
    }
    let comp = new ReactNode(type ?? null, props);
    if (typeof type === 'function') {
      curComp = comp;
      currentStateIndex = 0;
      const funcComp = type(props);
      Object.assign(comp, {
        element: funcComp.element,
        children: funcComp.children,
      });
      comp.compkey = compKey;
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
        } else if (key === 'className' || key === 'key' || key === 'ref') {
          element[key] = props[key];
        } else {
          element.setAttribute(key, props[key]);
        }
      });
    }

    children.forEach((child, index) => {
      if (child instanceof ReactNode) {
        child.compkey = child.compkey
          ? `${compKey}_${index}_${child.compkey}`
          : `${compKey}_${index}`;
        child.parent = comp;
        comp.children.push(child);
        element.appendChild(child.element);
      } else {
        const textElem = document.createTextNode(child);
        const textComp = new ReactNode();
        textComp.element = textElem;
        textComp.compkey = `${compKey}_${index}`;
        comp.children.push(textComp);
        element.appendChild(textElem);
      }
    });
    comp.compkey = compKey;
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
      recParent = comp;
      const updatedValue =
        typeof newVal !== 'function' ? newVal : newVal(comp.states[stateIndex]);
      if (!Object.is(comp.states[stateIndex], updateValue)) {
        comp.states[stateIndex] = updatedValue;
        const newNode = comp.component(comp.props);
        React.reconcile(newNode, comp);
        // comp.element.replaceWith(newNode.element);
        // comp.element = newNode.element;
      }
      isReconciling = false;
      recParent = null;
      curComp = null;
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
    isReconciling = true;
    recParent = oldNode;
    if (oldNode.element.tagName !== newNode.element.tagName) {
      Object.assign(oldNode, newNode, { parent: oldNode.parent });
    } else {
      if (oldNode.element instanceof Text) {
        if (oldNode.element !== newNode.element) {
          oldNode.element.replaceWith(newNode.element);
          oldNode.element = newNode.element;
        }
      } else {
        /* ----------- Start: Handle Attrbutes ------------- */
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
        /* ----------- End: Handle Attrbutes ------------- */

        /* ----------- Start: Handle Children ------------- */
        let newNodeChildren = newNode.children;
        let oldNodeChildren = oldNode.children;
        for (let i = 0; i < newNodeChildren.length; i++) {
          recParentIndex = i;
          let shouldRerender = false;
          const oldChild = oldNodeChildren[i];
          const newChild = newNodeChildren[i];
          if (oldChild && newChild.component === oldChild.component) {
            oldChild.props = newChild.props;
            shouldRerender = true;
          } else {
            oldChild.element.replaceChild(
              newChild.element,
              oldChild?.element || null
            );
            newChild.parent = oldChild;
            oldChild.children[i] = newChild;
          }
          // if (typeof newNodeChildren[i].component !== 'function') {
          //   shouldRerender = true;
          // } else {
          //   const oldNodeProps = oldNodeChildren[i].props || {};
          //   const newNodeProps = newNodeChildren[i].props || {};
          //   for (let key of Object.keys(newNodeProps)) {
          //     if (!Object.is(oldNodeProps[key], newNodeProps[key])) {
          //       oldNodeChildren[i].props = newNodeProps;
          //       shouldRerender = true;
          //       break;
          //     }
          //   }
          // }
          if (!shouldRerender) continue;
          React.reconcile(newChild, oldChild);
        }
        /* ----------- End: Handle Children ------------- */
      }
    }
    isReconciling = false;
    recParent = null;
    recParentIndex = -1;
  },

  render(comp) {
    console.log('root node ', comp);
    vRoot = comp;
    Root.appendChild(comp.element);
  },
};

export default React;
