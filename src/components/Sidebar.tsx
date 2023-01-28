import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getMaxZIndex } from '../content_script/utils/find-highest-z-index';
import styles from './Sidebar.module.css';
import browser from "webextension-polyfill";

export default function Sidebar() {
    const [shown, setShown] = useState(true);

    // TODO: Calculate max z value and be greater than that
    // const [maxZIndex, setMaxZIndex] = useState(0);
    // useEffect(() => {
    //     setMaxZIndex(useMemo(() => getMaxZIndex(), []))
    // }, []);

    useEffect(() => {
        setShown(true);
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
            </div> : <div>false</div>}
        </>
    )
}