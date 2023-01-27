import React, { useState } from 'react';
import styles from './Sidebar.module.css';


export default function Sidebar() {
    const [shown, setShown] = useState(true);

    // setInterval(setShown(shown => !shown), 1000)
    return (
        <div className={`${styles.sidebar}`}>
            <h1>Header1</h1>
            <h2>Header2</h2>
            <h3>Header3</h3>
        </div>
    )
}