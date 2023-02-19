import { cloneDeep } from "lodash";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { PDFDocumentProxy, PDFPageProxy, TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";
import { findPhraseinTwoPasses, findWordWithRadius } from "./utils/str_utils";

if (typeof process !== 'object' || process.env.JEST_WORKER_ID === undefined) { // process is not defined on the browser
    GlobalWorkerOptions.workerSrc = pdfjsWorker; // this throws an error in jest
}

/**
 * Get the PDFDocumentProxy for a given local pdf url
 * @param url that points to pdf
 * @returns a Promise<PDFDocumentProxy>
 */
export async function getPdfProxy(url: string): Promise<PDFDocumentProxy> {
    return getDocument(url).promise;
}

const ABSTRACT_HEADER_REGEX = /Abstract\./i
const KEYWORD_HEADER_REGEX = /Key\s*words\./i
const KEYWORD_END_REGEX = /RAFFLES|INTRODUCTION/i
export async function getAbstract(pdf: PDFDocumentProxy): Promise<string> {
    // abstract is in the 1st page
    const first_page = await pdf.getPage(1);
    const text = await getTextInPage(first_page);

    const abstract_start = text.search(ABSTRACT_HEADER_REGEX)
    const abstract_end = text.search(KEYWORD_HEADER_REGEX)

    return text.slice(abstract_start, abstract_end);
}

export async function getKeywords(pdf: PDFDocumentProxy): Promise<string> {
    // keyword is in the 1st page
    const first_page = await pdf.getPage(1);
    const text = await getTextInPage(first_page);

    const keyword_start = text.search(KEYWORD_HEADER_REGEX)

    const text_sliced_left = text.slice(keyword_start);
    const keyword_end = text_sliced_left.search(KEYWORD_END_REGEX)

    return text_sliced_left.slice(0, keyword_end);
}






/**
 * Get all the text in a given page.
 * There are no newlines in the returned text.
 * @param page PDFPageProxy to access
 * @returns all the text on the page.
 */
export async function getTextInPage(page: PDFPageProxy): Promise<string> {
    return getTextInPageByLine(page).then(s => s.replaceAll('\n', ' '));
}

/**
 * Get all the text in a given page, attempting to insert \n every line.
 * @param page PDFPageProxy to access
 * @returns all the text on the page.
 */
export async function getTextInPageByLine(page: PDFPageProxy): Promise<string> {
    let y_val = 0;
    let text = '';
    (await page.getTextContent()).items.forEach((item: TextItem | TextMarkedContent) => {
        if (!('str' in item)) // assert item is TextItem
            return;

        if (typeof item.str === 'undefined')
            return;

        if (item.transform[5] !== y_val) {
            text += '\n';
            y_val = item.transform[5];
        }
        text += item.str;
    })

    return text;
}

export async function getText(pdf: PDFDocumentProxy): Promise<string> {
    const pages = []
    for (let i = 1; i <= pdf.numPages; i++) {
        pages.push(await pdf.getPage(i))
    }
    const page_texts = await Promise.all(
        pages.map(page => getTextInPage(page)))
    return page_texts.join(' ');
}