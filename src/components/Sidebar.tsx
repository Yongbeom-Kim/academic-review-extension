import React, { useEffect, useMemo, useRef, useState } from 'react';
import browser from 'webextension-polyfill';
// import { getMaxZIndex } from '../content_script/utils/find-highest-z-index';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const [shown, setShown] = useState(false);
    const toggleShown = () => setShown(shown => !shown);

    // TODO: Calculate max z value and be greater than that
    // const [maxZIndex, setMaxZIndex] = useState(0);
    // useEffect(() => {
    //     setMaxZIndex(useMemo(() => getMaxZIndex(), []))
    // }, []);

    useEffect(() => {
        browser.runtime.onMessage.addListener(message => {
            if (message.message = 'browser_action') {
                toggleShown()
            }
        })
    }, []);




    return (
        <>
            {shown ? <div className={`${styles.sidebar}`}>
                <button onClick={e => toggleShown()} className={`${styles.hideButton}`} >
                    Hide</button>
                <UrlButtons />
            </div> : <div>false</div>}
        </>
    )
}

function UrlButtons() {
    return (
        <>
            <button className={`${styles.urlButton1}`}>Add current page</button>
            <button className={`${styles.urlButton2}`}>Find links in page</button>
        </>
    )
}