import { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";
import React, { useEffect, useState } from "react";
import Browser from "webextension-polyfill";
import { send_message_to_tab } from "../../../extension/libs/message_handler";
import { getPdfProxy, getAbstract, getTextInPage, getKeywords, getBody, getYear } from "../../../extension/libs/pdf_parser";
import { PARSED_PDF_RESPONSE_MSG, ParsePDFRequest, ParsePDFResponse, PARSE_PDF_REQUEST_MSG } from "../../../extension/libs/utils/messaging_types";


export default function Page() {

    const [pdfFilePath, setPdfFilePath] = useState('');
    const [sourceTabId, setSourceTabId] = useState(-1);

    
    const [abstract, setAbstract] = useState('');
    const [keyword, setKeyword] = useState('');
    const [body, setBody] = useState('');
    const [year, setYear] = useState(-1);

    useEffect(() => {
        Browser.runtime.onMessage.addListener((message: ParsePDFRequest) => {
            if (message.msg !== PARSE_PDF_REQUEST_MSG)
                return;

            console.log("got message:")
            console.log({ message })
            setPdfFilePath(message.filePath);
            setSourceTabId(message.from_tab_id ?? -1);

        });

    }, [])

    useEffect(() => {

        console.log("Sending Message");
        const return_message: ParsePDFResponse = {
            msg: PARSED_PDF_RESPONSE_MSG,
            filePath: pdfFilePath,
            data: "hello"
        }
        console.log({ return_message })
        send_message_to_tab(sourceTabId, return_message);
    }, [sourceTabId])

    useEffect(() => {
        if (typeof pdfFilePath === undefined || pdfFilePath === '')
            return;
        getPdfInfo(pdfFilePath);
    }, [pdfFilePath])

    return (<>
        <iframe src={pdfFilePath} frameBorder="0" style={{ width: '100vw', height: '50vh' }}></iframe>
        <div className="identifier">
            <b>pdf file path: </b>{pdfFilePath} <br />
            <b>source tab id: </b>{sourceTabId} <br />
            <b>Abstract: </b>{abstract} <br />
            <b>Keywords: </b>{keyword}<br />
            <b>Year: </b>{year}<br />
            <b>Body: </b>{body}
        </div>

    </>)

    async function getPdfInfo(filePath: string) {
        const pdf = await getPdfProxy(filePath);
        // console.log("PDF:")
        // console.log(pdf)
        // console.log("First page:")
        // console.log(getTextInPage(await pdf.getPage(1)))
        // console.log("Abstract:")
        // console.log(getAbstract(pdf));
        getAbstract(pdf).then(setAbstract)
        getKeywords(pdf).then(setKeyword)
        getBody(pdf).then(setBody)
        getYear(pdf).then(setYear)
        // console.log(pageText)
    }
}