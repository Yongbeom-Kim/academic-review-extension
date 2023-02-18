import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import ParserDriver from '../website_driver/BaseParserDriver';
import DefaultParserDriver from '../website_driver/DefaultParserDriver';
import RafflesBulletinOfZoologyDriver from '../website_driver/RafflesBulletinOfZoologyDriver';
import { DataFrame } from '../model/DataFrame';



//@ts-ignore css modules have no types, unfortunately
import styles from './Sidebar.module.css';
import { DATA_ORDERING, METADATA } from '../libs/utils/academia_utils';
import { download_pdf } from '../libs/utils/dom_utils';



export default function Sidebar() {
    const [shown, setShown] = useState(false);
    const toggleShown = () => setShown(shown => !shown);

    // Handling Form Input
    // @ts-ignore
    const [siteLinkData, setSiteLinkData]: [DataFrame<string>, Dispatch<SetStateAction<DataFrame<string>>>] = useState(new DataFrame([], [[]]));
    // @ts-ignore
    const [checked, setChecked]: [boolean[], Dispatch<SetStateAction<boolean[]>>] = useState([])

    const onFormSubmit = () => {
        let submitData: DataFrame<string> = DataFrame.Empty(siteLinkData.headers)
        submitData = siteLinkData.selectRows(checked);
        submitData.reorderColumns(DATA_ORDERING);
        let csvContent = submitData.toCsvString();

        window.open("data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
        
        const link_to_open = submitData.getCol(METADATA.Link)[1];
        download_pdf(link_to_open, "1.pdf");
        // Open extension window and 
        // browser.runtime.sendMessage({message: PARSE_PDF_MESSAGE_NAME, url: submitData.getCol(METADATA.Link)[1]})

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

    const [siteLinkData, setSiteLinkData]: [DataFrame<string>, Dispatch<SetStateAction<DataFrame<string>>>] = siteLinkDataHook
    const [checked, setChecked]: [boolean[], Dispatch<SetStateAction<boolean[]>>] = checkedStateHook

    const [allChecked, setAllChecked] = useState(false)


    useEffect(() => setAllChecked(checked.reduce((a, b) => a && b, true)), [checked])

    useEffect(() => {
        const parserList: ParserDriver[] = [new RafflesBulletinOfZoologyDriver(), new DefaultParserDriver()]

        let parsedUrl: DataFrame<string>
        for (let i = 0; i < parserList.length; i++) {
            const parser = parserList[i];
            if (parser.is_url(document.URL)) {
                parsedUrl = parserList[i].get_links(document);
                break;
            }
        }


        setSiteLinkData(parsedUrl!);
        setChecked(Array(parsedUrl!.rows).fill(false))
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
                    {siteLinkData.toPlainObjectArray().map((value, i) => (
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
            <button type="submit">Start Review</button>
        </form>
    )
}