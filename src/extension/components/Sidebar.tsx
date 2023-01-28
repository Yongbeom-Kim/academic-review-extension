import React, { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import browser from 'webextension-polyfill';
import ParserDriver, { ParsedUrl } from '../website_driver/BaseParserDriver';
import DefaultParserDriver from '../website_driver/DefaultParserDriver';
import RafflesBulletinOfZoologyDriver from '../website_driver/RafflesBulletinOfZoologyDriver';
// import { getMaxZIndex } from '../content_script/utils/find-highest-z-index';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const [shown, setShown] = useState(false);
    const toggleShown = () => setShown(shown => !shown);

    // Handling
    // @ts-ignore
    const [siteLinkData, setSiteLinkData]: [ParsedUrl[], Dispatch<SetStateAction<ParsedUrl[]>>] = useState([]);
    // @ts-ignore
    const [checked, setChecked]: [boolean[], Dispatch<SetStateAction<boolean[]>>] = useState([])

    const onFormSubmit = (e) => {
        const submitData = siteLinkData.filter((x, i) => checked[i]);
        console.log({'form_submit_data': submitData})
        browser.windows.create({
        })
    }


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
                <UrlSelectForm
                    siteLinkDataHook={[siteLinkData, setSiteLinkData]}
                    checkedStateHook={[checked, setChecked]}
                    onSubmit={onFormSubmit}
                />
            </div> : <div>false</div>}
        </>
    )
}



function UrlSelectForm({ siteLinkDataHook, checkedStateHook, onSubmit }) {

    const [siteLinkData, setSiteLinkData]: [ParsedUrl[], Dispatch<SetStateAction<ParsedUrl[]>>] = siteLinkDataHook
    const [checked, setChecked]: [boolean[], Dispatch<SetStateAction<boolean[]>>] = checkedStateHook

    const [allChecked, setAllChecked] = useState(false)


    useEffect(() => setAllChecked(checked.reduce((a, b) => a && b, true)), [checked])

    useEffect(() => {
        const parserList: ParserDriver[] = [new RafflesBulletinOfZoologyDriver(), new DefaultParserDriver()]

        let parsedUrl: ParsedUrl[] = []
        for (let i = 0; i < parserList.length; i++) {
            const parser = parserList[i];
            if (parser.is_url(document.URL)) {
                parsedUrl = parserList[i].get_links(document);
                break;
            }
        }
        setSiteLinkData(parsedUrl);
        setChecked(parsedUrl.map(() => false))
    }, [])

    function toggleSelectedAll() {
        const is_everything_checked = allChecked // to prevent needless updates from useEffect
        setChecked(checked => checked.map(() => !is_everything_checked))
    }

    return (
        <form id="url_select_form" action="" onSubmit={e => { e.preventDefault(); onSubmit(e) }} className={`${styles.form}`}>
            <fieldset>
                <legend>Select URLs</legend>
                <button type='button' onClick={toggleSelectedAll}>{allChecked ? "Deselect All" : "Select All"}</button>
                <div>
                    {siteLinkData.map((value, i) => (
                        <>
                            <input
                                checked={checked[i]}
                                onChange={e => { setChecked(checked => checked.map((x, j) => i == j ? e.target.checked : x)) }}
                                type="checkbox"
                                name="checkbox"
                                id={value.display_string}
                                value={value.link}
                                key={`${i}1`}
                            />
                            <label
                                htmlFor={value.display_string}
                                key={`${i}2`}
                            >
                                {value.display_string}
                            </label>
                        </>
                    ))}
                </div>
            </fieldset>
            <div>
                <button type='button'>Add current page</button>
                <button type='button'>Add links in page</button>
            </div>
            <button type="submit">Start Review</button>
        </form>
    )
}