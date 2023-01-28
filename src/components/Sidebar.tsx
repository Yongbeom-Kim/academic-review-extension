import React, { useEffect, useMemo, useRef, useState } from 'react';
import browser from 'webextension-polyfill';
// import { getMaxZIndex } from '../content_script/utils/find-highest-z-index';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const [shown, setShown] = useState(false);
    const toggleShown = () => setShown(shown => !shown);

    const [selected, setSelected] = useState([]);

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
                <UrlSelectForm formStateHook={[selected, setSelected]} visible={shown} />
                <ReviewButton />
            </div> : <div>false</div>}
        </>
    )
}

function UrlSelectForm({ formStateHook, visible }) {

    const [formState, setFormState] = formStateHook;

    const [siteLinks, setSiteLinks] = useState([{ href: "", text: "" }]);
    useEffect(() => {
        const urls = Array.from(document.querySelectorAll('a[href]'))
            .map(x => {
                return { href: x.getAttribute('href'), text: x.textContent }
            })
            .filter(x => x.text?.length ?? 0 > 0)
            .filter(x => (x.href?.startsWith("https://") || x.href?.startsWith("http://") || x.href?.startsWith("www.")))
            

        setSiteLinks(urls);
    }, [])

    useEffect(() => {
        console.log({ formState });
    }, [formState])

    useEffect(() => {
        console.log({ siteLinks });
    }, [siteLinks])



    return (
        <form id="url_select_form" action="" onSubmit={e => { e.preventDefault(); }} className={`${styles.form}`}>
            <fieldset>
                <legend>Select URLs</legend>
                <div>
                    {siteLinks.map(value => (
                        <>
                            <input type="checkbox" name="checkbox" id={value.text} value={value.href} />
                            <label htmlFor={value.text}>{value.text}</label>
                        </>
                    ))}
                </div>
            </fieldset>
            <div>
                <button type='button'>Add current page</button>
                <button type='button'>Add links in page</button>
            </div>
        </form>
    )
}

function ReviewButton() {
    return (
        <>
            <button className={`${styles.reviewButton}`}>Start Review</button>
        </>
    )
}