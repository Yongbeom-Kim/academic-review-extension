import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import ParserDriver from '../website_driver/BaseParserDriver';
import DefaultParserDriver from '../website_driver/DefaultParserDriver';
import RafflesBulletinOfZoologyDriver from '../website_driver/RafflesBulletinOfZoologyDriver';
import { DataFrame } from '../model/DataFrame';


//@ts-ignore css modules have no types, unfortunately
import styles from './Sidebar.module.css';
import { DATA_ORDERING, METADATA } from '../libs/utils/academia_utils';
import { send_download_pdfs_message, send_parse_pdf_message } from '../libs/message_handler';
import { exportCSV } from '../libs/utils/dom_utils';


export default function Sidebar() {
    const [shown, setShown] = useState(false);
    const toggleShown = () => setShown(shown => !shown);

    // Handling Form Input
    // @ts-ignore
    const [siteLinkData, setSiteLinkData]: [DataFrame<string>, Dispatch<SetStateAction<DataFrame<string>>>] = useState(new DataFrame([], [[]]));
    // @ts-ignore
    const [checked, setChecked]: [boolean[], Dispatch<SetStateAction<boolean[]>>] = useState([])

    const onFormSubmit = async () => {
        let submitData: DataFrame<string> = DataFrame.Empty(siteLinkData.headers)

        submitData = siteLinkData.selectRows(checked);
        submitData.reorderColumns(DATA_ORDERING);
        exportCSV(submitData.toCsvString());

        // let csvContent = submitData.toCsvString();
        // window.open("data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));

        const download_link = submitData.getCol(METADATA.Link)
        const download_file_name = submitData.getCol(METADATA.CiteKey)
        for (let i = 0; i < download_link.length; i++) {
            if (typeof download_link[i] === 'undefined' || typeof download_file_name[i] === 'undefined') {
                download_link.splice(i, 1)
                download_file_name.splice(i, 1)
                i--
            }
        }
        // @ts-ignore we've filtered out the undefined's
        const {ids, paths} = await send_download_pdfs_message(download_link, download_file_name);
        console.log(paths);
        
        // add localpath to metadata
        submitData.transform([METADATA.CiteKey], METADATA.LocalPath, (key) => {
            if (typeof key === 'undefined')
                return key
            const local_path = paths.filter(path => path.includes(key))[0]
            paths.slice(paths.indexOf(local_path));
            return local_path;
        })
        
        console.log(submitData);

        let dataArray = submitData.toPlainObjectArray();
        for (let i = 0; i < dataArray.length; i ++) {
            const parsedPdfData = await send_parse_pdf_message(dataArray[i][METADATA.LocalPath])
            dataArray[i] = await {...dataArray[i], ...parsedPdfData}
        }

        submitData = DataFrame.FromPlainObjectArray(dataArray);
        exportCSV(submitData.toCsvString());
        // opens up a new extension tab to parse the pdf
        // we are forced to open an extension page due to CORS policies on website.
        // send_parse_pdf_message(submitData.getCol(METADATA.LocalPath)[0]).then(x => console.log({x}));
        // getPdfProxy(submitData.getCol(METADATA.LocalPath)[0]).then(console.log)

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