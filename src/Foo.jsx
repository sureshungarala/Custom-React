import React from './React';
import PropTypes from 'prop-types';

function Foo({ name }) {
  const [index, setIndex] = React.useState(0);
  return (
    <pre>
      <span>
        This is Foo Comp and {name} & {index}
      </span>
      <button onClick={() => setIndex((index) => index + 1)}>Increment</button>
    </pre>
  );
}
Foo.propTypes = {
  name: PropTypes.string.isRequired,
};

export default Foo;
