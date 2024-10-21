import React from "./React";

function Foo({name}) {
 const [index, setIndex] = React.useState(0);
 return (
  <pre>
   <span>This is Foo Comp and {name} & {index}</span>
   <button onClick={() => setIndex(index => index+1)}>Increment</button>
  </pre>
  );
}

export default Foo;