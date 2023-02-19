import React, { useEffect, useState } from "react";
import { PDF_URL_QUERY_KEY } from "../../../extension/libs/utils/config_utils";

export default function Page() {

    const [pdfLink, setPdfLink] = useState('');

    useEffect(() => {
        // browser.runtime.onMessage.addListener((message) => {
        //     console.log(message);
        // })
        // browser.runtime.onMessageExternal.addListener((message) => {
        //     console.log(message);
        // })

        // We can assert since we are creating this page
        setPdfLink(new URLSearchParams(location.search).get(PDF_URL_QUERY_KEY)!);
        
        // const pdf = new PDFObject

    }, [])

    return (<>
        {/* <h1>Hello World!</h1> */}
        <iframe src={pdfLink} frameBorder="0" style={{width: '100vw', height: '100vh'}}></iframe>
    </> )
}    