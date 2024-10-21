import React from "./React";
import Foo from "./Foo";
import './App.css'

function App() {

  const [count, setCount] = React.useState(0)
  const [newCount, setNewCount] = React.useState(0)
  console.log('count ', count);
  return (
    <div className="sure">
      <h1>Vite + React</h1>
      <Foo name={'Suresh'} />
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={() => setNewCount((count) => count + 1)}>
          New count is {newCount}
        </button>
        <p>
          Edit {<code>src/App.jsx</code>} and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
