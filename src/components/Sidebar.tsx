import React, { useEffect, useMemo, useRef, useState } from 'react';
import browser from 'webextension-polyfill';
// import { getMaxZIndex } from '../content_script/utils/find-highest-z-index';
import styles from './Sidebar.module.css';


export default function Sidebar() {
    const [shown, setShown] = useState(true);
    const toggleShown = () => setShown(shown => !shown);
    
    // TODO: Calculate max z value and be greater than that
    // const [maxZIndex, setMaxZIndex] = useState(0);
    // useEffect(() => {
    //     setMaxZIndex(useMemo(() => getMaxZIndex(), []))
    // }, []);

    useEffect(() => {
        setShown(true);
        browser.runtime.onMessage.addListener(message => {
            console.log("msg received");
            console.log({message});
            if (message.message = 'browser_action') {
                toggleShown()
            }
        })
    }, []);




    return (
        <>
            {shown ? <div className={`${styles.sidebar}`}>
                <button onClick={
                    e => {
                        toggleShown()
                        setTimeout(() => {
                            toggleShown();
                        }, 1000);
                    }} >
                    Hide</button>
                <h1>Header1</h1>
                <h2>Header2</h2>
                <h3>Header3</h3>
            </div> : <div>false</div>}
        </>
    )
}