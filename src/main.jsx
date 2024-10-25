/* eslint-disable react/no-deprecated */
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
/** @jsx React.createElement */
import React from './React.js'
import App from './App.jsx'
import './index.css'

const rootElem = document.getElementById('root');
React.createRoot(rootElem);
React.render(
  // <StrictMode>
    <App idd="main"/>
  // </StrictMode>,
)
