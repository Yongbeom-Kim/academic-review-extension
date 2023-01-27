import React, { useEffect, useState } from 'react';
import styles from './Sidebar.module.css';


export default function Sidebar() {
    const [shown, setShown] = useState(true);

    useEffect(() => {
        setShown(true)
        console.log("shown is" + shown ? "true" : "false");
    }, []);

    return (
        <>
            {shown ? <div className={`${styles.sidebar}`}>
                <button onClick={
                    e => {
                        setShown(false);
                        setTimeout(() => {
                            setShown(true);
                        }, 1000);
                    }} >
                    Hide</button>
                <h1>Header1</h1>
                <h2>Header2</h2>
                <h3>Header3</h3>
            </div> : <></>}
        </>
    )
}