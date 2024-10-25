import React from "./React";
import PropTypes from 'prop-types';

function Button({label, onClick}){
 return <button onClick={onClick}>{label}</button>
}

Button.propTypes = {
 label: PropTypes.string,
 onClick: PropTypes.func
}

export default Button