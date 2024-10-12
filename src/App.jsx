/** @jsx React.createElement */
import React from "./React";
import Foo from "./Foo";
import './App.css'

function App() {
  const [count, setCount] = React.useState(0)

  return (
    <>
      <h1>Vite + React</h1>
      <Foo name={'Suresh'}/>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit {<code>src/App.jsx</code>} and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App