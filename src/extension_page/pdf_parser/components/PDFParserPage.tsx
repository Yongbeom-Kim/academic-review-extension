import { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";
import React, { useEffect, useState } from "react";
import Browser from "webextension-polyfill";
import { send_close_current_tab_message, send_message_to_tab } from "../../../extension/libs/message_handler";
import { getPdfProxy, ParsedPdf } from "../../../extension/libs/pdf_parser";
import { getAllCountriesFrom } from "../../../extension/libs/utils/academia_utils";
import { PARSED_PDF_RESPONSE_MSG, ParsePDFRequest, ParsePDFResponse, PARSE_PDF_REQUEST_MSG } from "../../../extension/libs/utils/messaging_types";
import { get_array_string_representation } from "../../../extension/libs/utils/str_utils";


export default function PDFParserPage() {

    const [pdfFilePath, setPdfFilePath] = useState('');
    const [sourceTabId, setSourceTabId] = useState(-1);


    const [abstract, setAbstract] = useState('');
    const [keyword, setKeyword] = useState('');
    const [pages, setPages] = useState(0);

    const [body, setBody] = useState('');
    const [year, setYear] = useState(-1);
    const [lkcExcerpts, setLkcExcerpts] = useState([''])
    const [authorCountries, setAuthorCountries] = useState('')

    // zrc_is_found radius 17
    // deposit_is_found radius 17
    // new record/ first record
    // redescription/redescribe
    // species/identification/taxonomic key
    //checklist, inventor(y/ies)

    useEffect(() => {
        Browser.runtime.onMessage.addListener((message: ParsePDFRequest) => {
            if (message.msg !== PARSE_PDF_REQUEST_MSG)
                return;

            // console.log("got message:")
            // console.log({ message })
            setPdfFilePath(message.filePath);
            setSourceTabId(message.from_tab_id ?? -1);

        });

    }, [])

    useEffect(() => {
        if (typeof pdfFilePath === undefined || pdfFilePath === '')
            return;
        getPdfInfo(pdfFilePath);
    }, [pdfFilePath])

    return (<>
        <iframe src={pdfFilePath} frameBorder="0" style={{ width: '100vw', height: '50vh' }}></iframe>
        <div className="identifier">
            <b>pdf file path: </b>{pdfFilePath} <br />
            <b>Abstract: </b>{abstract} <br />
            <b>Keywords: </b>{keyword}<br />
            <b>Pages: </b>{pages}<br />
            <b>Year: </b>{year}<br />
            <b>Author Countries: </b>{authorCountries}<br />
            <b>Body: </b>{body} <br />
            {/* <b>source tab id: </b>{sourceTabId} <br />
            <b>Are specimens deposited in LKCNHM/RMBR: </b>{`${lkcExcerpts.length > 0}: ${lkcExcerpts[0]}`}<br />
            */}
        </div>

    </>)

    async function getPdfInfo(filePath: string) {
        const pdf = await getPdfProxy(filePath);
        const parsedPdf = await ParsedPdf.getParagraphsByPage(pdf);

        console.log('text:');
        console.log(parsedPdf.paragraphs);

        const abstract = parsedPdf.getAbstract() ?? 'undefined';
        setAbstract(abstract)

        const keywords = parsedPdf.getKeyWords() ?? 'undefined';
        setKeyword(keywords)

        // const pages = parsedPdf.paragraphs.length;
        // setPages(pages)

        const body = parsedPdf.getBody() ?? 'undefined';
        setBody(body)

        const year = parsedPdf.getYear() ?? -1;
        setYear(year);

        const author_countries = parsedPdf.getAuthorCountries();
        setAuthorCountries(author_countries)

        const countries_focused = getAllCountriesFrom(parsedPdf.getAbstract() ?? "").join(', ');
        // const pages 
        // setLkcExcerpts(getDepositLKCExcerpts(body));
        // setAuthorCountries(getAuthorCountries(body));

        const return_message: ParsePDFResponse = {
            msg: PARSED_PDF_RESPONSE_MSG,
            filePath: pdfFilePath,
            year,
            author_countries,
            countries_focused,
        }
        send_message_to_tab(sourceTabId, return_message);
        // send_close_current_tab_message();


    }

}