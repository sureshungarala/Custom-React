const States = [];
const Effects = [];
let StateCount = 0;
let EffectCount = 0;
const Nodes = [];
const components = [];
let Root = null;

class Node {
  constructor(component) {
    this.component = component;
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

  createElement: (type, props, ...children) => {
    // type can be either a string or a refer to functional / class / Fragment component
    // https://react.dev/reference/react/createElement#parameters
    console.log('type in createElement', type, props, children);
    if (typeof type === 'function') {
      return type(props);
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
      console.log('child ', typeof child, child instanceof HTMLElement, child);
      if (child instanceof HTMLElement) {
        element.appendChild(child);
      } else {
        element.appendChild(document.createTextNode(child));
      }
    });

    return element;
  },

  useState: (value, lazyEval) => {
    StateCount++;
    console.log('StateCount ', StateCount, States.length);
    if (StateCount - 1 > States.length)
      throw new Error('Invalid Hook. Found Hooks are used conditionally.');

    const currentStateIndex = StateCount - 1;
    States[currentStateIndex] = lazyEval ? lazyEval(value) : value;

    let updateValue = (newVal) => {
      if (typeof newVal !== 'function') {
        const isSameValue = Object.is(States[currentStateIndex], newVal);
        if (!isSameValue) {
          States[currentStateIndex] = newVal;
          React.render(components[components.length - 1].component);
        }
      } else {
        States[currentStateIndex] = newVal(States[currentStateIndex]);
        React.render(components[components.length - 1].component);
      }
      console.log('new value ', States[currentStateIndex], Nodes);
      // const lastComp = Nodes[Nodes.length - 1].component;
      // console.log("lastComp ", lastComp);
      // lastComp();
    };
    return [States[currentStateIndex], updateValue];
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
    // console.log('comp ', comp);
    components.push(new Node(comp));
    // const component = comp();
    Root.appendChild(comp);
  },
};

export default React;
