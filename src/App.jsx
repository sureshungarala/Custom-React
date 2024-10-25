import React from './React';
import Proptypes from 'prop-types';
import Foo from './Foo';
import './App.css';

function App({ idd }) {
  const [count, setCount] = React.useState(0);
  const [newCount, setNewCount] = React.useState(0);
  // console.log('count ', count);
  return (
    <div className='sure' data-idd={idd} data-count={newCount}>
      {count + newCount}
      <h1>Vite + React - {count + newCount}</h1>
      {count - newCount}
      <Foo name={'Shrini'} />
      <Foo name={'Sarava'} />
      <div className='card' data-attr={count + newCount}>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={() => setNewCount((count) => count + 1)}>
          New count is {newCount}
        </button>
        <p>Edit {<code>src/App.jsx</code>} and save to test HMR</p>
      </div>
      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

App.propTypes = {
  idd: Proptypes.string,
};

export default App;
