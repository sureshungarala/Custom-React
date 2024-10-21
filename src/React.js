const Effects = [];
let EffectCount = 0;
const Nodes = [];
const components = new Map();
let currentComponent = null;
let Root = null;

// temp state
let currentStateIndex = 0;
let isMounting = true;

class Node {
  constructor(component, props = {}) {
    this.element = null;
    this.component = component;
    this.parent = null;
    this.props = props;
    this.children = [];
    this.states = [];
    this.effects = [];
    this.stateCount = 0;
    this.effectCount = 0;
  }
}

const React = {
  createRoot: (elem) => {
    Root = elem;
  },

  createElement: (type, props = {}, ...children) => {
    console.group(typeof type === 'function' ? type.name : type);
    // type can be either a string or a refer to functional / class / Fragment component
    // https://react.dev/reference/react/createElement#parameters
    // console.log('type in createElement', type, props, children);
    let comp;
    if (typeof type === 'function') {
      currentStateIndex = 0;
      // TODO: This could have issue with re-usability of components. Review this.
      if (components.has(type)) {
        isMounting = false;
        comp = components.get(type);
        currentComponent = comp;
      } else {
        isMounting = true;
        comp = new Node(type, props);
        currentComponent = comp;
        console.log('currentComponent ', currentComponent);
        components.set(type, comp);
      }
      const elem = type(props);
      elem.__component = comp; // attach the component to the element
      comp.element = elem; // attach the element to the component
      console.groupEnd();
      return elem;
    }

    if (!type) {
      const element = document.createDocumentFragment();
      children.forEach((child) => {
        element.appendChild(child);
      });
      return element;
    }

    const element = document.createElement(type);

    if (props) {
      Object.keys(props).forEach((key) => {
        if (key.startsWith('on')) {
          element.addEventListener(key.substring(2).toLowerCase(), props[key]);
        } else if (key === 'className') {
          element.className = props[key];
        } else {
          element[key] = props[key];
        }
      });
    }

    children.forEach((child) => {
      // console.log('child ', typeof child, child instanceof HTMLElement, child);
      if (child instanceof HTMLElement) {
        element.appendChild(child);
      } else {
        element.appendChild(document.createTextNode(child));
      }
    });
    console.groupEnd();
    return element;
  },

  useState: (value, lazyEval) => {
    console.log('useState ', this);

    let comp;
    let stateIndex = currentStateIndex;
    if (currentComponent) {
      comp = currentComponent;
      if (isMounting) {
        currentComponent.states.push(value);
        currentComponent.stateCount += 1;
      } else if (stateIndex > comp.states.length) {
        throw new Error('Invalid Hook. Found Hooks are used conditionally.');
      }
      currentStateIndex += 1;
    }

    console.log(
      'stateIndex ',
      stateIndex,
      currentComponent.states.length,
      comp
    );
    if (isMounting) {
      comp.states[stateIndex] = lazyEval ? lazyEval(value) : value;
    }

    let updateValue = (newVal) => {
      if (typeof newVal !== 'function') {
        const isSameValue = Object.is(comp.states[stateIndex], newVal);
        if (!isSameValue) {
          comp.states[stateIndex] = newVal;
          comp.element.replaceWith(
            React.createElement(comp.component, comp.props)
          );
        }
      } else {
        comp.states[stateIndex] = newVal(comp.states[stateIndex]);
        comp.element.replaceWith(
          React.createElement(comp.component, comp.props)
        );
      }
      console.log('new value ', comp, comp, comp.states[stateIndex], Nodes);
    };
    return [comp.states[stateIndex], updateValue];
  },

  useEffect: (cb, deps) => {
    EffectCount++;
    if (
      !Effects[EffectCount].some((dep, index) => !Object.is(dep, deps[index]))
    ) {
      cb();
    }
  },

  render(comp) {
    console.log('comp ', comp);
    Root.appendChild(comp);
  },
};

export default React;
