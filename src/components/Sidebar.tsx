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

    const [selected, setSelected] = useState([]);

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

function UrlSelectForm() {

    // @ts-ignore
    const [siteLinks, setSiteLinks]: [ParsedUrl[], Dispatch<SetStateAction<ParsedUrl[]>>] = useState([]);

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
        setSiteLinks(parsedUrl);
    }, [])



    return (
        <form id="url_select_form" action="" onSubmit={e => { e.preventDefault(); }} className={`${styles.form}`}>
            <fieldset>
                <legend>Select URLs</legend>
                <div>
                    {siteLinks.map(value => (
                        <>
                            <input type="checkbox" name="checkbox" id={value.display_string} value={value.link} />
                            <label htmlFor={value.display_string}>{value.display_string}</label>
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