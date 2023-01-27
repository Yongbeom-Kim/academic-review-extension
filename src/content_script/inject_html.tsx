import React from 'react'
import ReactDOM from 'react-dom/client'
import Sidebar from '../components/Sidebar';

const root = document.createElement('div');
root.setAttribute('class', 'review-extension');
root.setAttribute('id', 'review-extension');
// root.style = `
// height: 100%;
// width: 100%;
// `
document.body.appendChild(root);

ReactDOM.createRoot(root).render(
    <>
        <Sidebar />
    </>
)
