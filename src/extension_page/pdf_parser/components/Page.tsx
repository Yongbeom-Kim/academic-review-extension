import React, { useEffect, useState } from "react";
import { PDF_ID_QUERY_KEY, PDF_URL_QUERY_KEY } from "../../../extension/libs/utils/config_utils";

export default function Page() {

    const [pdfLink, setPdfLink] = useState('');
    const [pdfId, setPdfId] = useState('');

    useEffect(() => {
        // browser.runtime.onMessage.addListener((message) => {
        //     console.log(message);
        // })
        // browser.runtime.onMessageExternal.addListener((message) => {
        //     console.log(message);
        // })

        // We can assert since we are creating this page
        const urlParams = new URLSearchParams(location.search)
        setPdfLink(urlParams.get(PDF_URL_QUERY_KEY)!);
        setPdfId(urlParams.get(PDF_ID_QUERY_KEY)!)
        
        // const pdf = new PDFObject

    }, [])

    return (<>
        <iframe src={pdfLink} frameBorder="0" style={{width: '100vw', height: '50vh'}}></iframe>
        <div className="identifier">
            {pdfId}
        </div>
        
    </> )
}    