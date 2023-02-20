import { cloneDeep } from "lodash";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { PDFDocumentProxy, PDFPageProxy, TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";

if (typeof process !== 'object' || process.env.JEST_WORKER_ID === undefined) { // process is not defined on the browser
    GlobalWorkerOptions.workerSrc = pdfjsWorker; // this throws an error in jest
}

const EPSILON = 0.01;
const PARAGRAPH_Y_VAL_THRESHOLD = 12.5;

const ABSTRACT_HEADER_REGEX = /^Abstract/i;
const ABSTRACT_MIN_WORDS = 5;

const KEYWORD_HEADER_REGEX = /^Key\s*words?/i;
const KEYWORD_MIN_WORDS = 5;

const ACKNOWLEDGEMENTS_SECTION_HEADER_REGEX = /^ACKNOWLEDGEMENTS?/i;
const BIBLIOGRAPHY_SECTION_HEADER_REGEX = /^(?:LITERATURE CITED|CITATIONS?|REFERENCES?|BIBLIOGRAPHY)/i;

export class ParsedPdf {

    paragraphs: string[][];

    constructor(data: string[][]) {
        this.paragraphs = data;
    }

    /**
     * Get the contents of a page by page number
     * @param page_numbers an array of page numbers to get the content of (0-index)
     * @returns content of a page
     */
    getTextbyPages(page_numbers: number[]): string {
        return page_numbers.flatMap(num => this.paragraphs[num]).join('\n')
    }

    /**
     * Get contents of the entire pdf as a string.
     */
    getFullText(): string {
        return this.paragraphs.map(page => page.join('\n')).join('\n')
    }

    getAbstract(): string | undefined {
        return this.getSection([0], ABSTRACT_HEADER_REGEX, ABSTRACT_MIN_WORDS)
    }

    getKeyWords(): string | undefined {
        return this.getSection([0], KEYWORD_HEADER_REGEX, KEYWORD_MIN_WORDS)
    }

    getBody(): string | undefined {
        // body is typically everything except the last page.
        const page_number_array: number[] = []
        for (let i = 0; i < this.paragraphs.length; i++)
            page_number_array.push(i)

        const acknowlegement_section_header = this.getSection(page_number_array, ACKNOWLEDGEMENTS_SECTION_HEADER_REGEX, 0);
        const bibliography_section_header = this.getSection(page_number_array, BIBLIOGRAPHY_SECTION_HEADER_REGEX, 0);
        const full_text = this.getFullText()

        if (typeof acknowlegement_section_header !== 'undefined')
            return full_text.slice(0, full_text.lastIndexOf(acknowlegement_section_header));

        if (typeof bibliography_section_header !== 'undefined')
            return full_text.slice(0, full_text.lastIndexOf(bibliography_section_header));

        // if we cannot find acknowledgements or bibliography, just remove the last page
        page_number_array.pop();
        return this.getTextbyPages(page_number_array)
    }
    // getAuthorCountries
    // getBody

    /**
     * Get a section by the section header regex, as well as the minimum number of words in the section.
     * @param page_numbers page numbers to search
     * @param section_header_regex regex for section header
     * @param min_words_in_section minimum amount of words in section
     * @returns a string (or undefined if not found)
     */
    getSection(page_numbers: number[], section_header_regex: RegExp, min_words_in_section: number): string | undefined {
        const pages = page_numbers.flatMap(page_no => this.paragraphs[page_no]);

        for (let i = 0; i < pages.length; i++) {
            const paragraph = pages[i];
            if (section_header_regex.test(paragraph)) {
                if (paragraph.split(/\s+/).length < min_words_in_section) {
                    return paragraph + ' ' + this.paragraphs[i + 1]
                } else {
                    return paragraph
                }
            }
        }
        return undefined;
    }


    /**
     * Parse a pdf into paragraphs, and get an array of paragraphs.
     * @param pdf pdf file to parse
     * @returns an array of paragraph strings by page.
     */
    static async getParagraphsByPage(pdf: PDFDocumentProxy): Promise<ParsedPdf> {
        let text_items_by_page: { str: string, y_val: number, gap_with_after: number }[][] = []

        // load text items
        for (let i = 1; i <= pdf.numPages; i++) {
            text_items_by_page.push([]);
            const textItems = (await (await pdf.getPage(i)).getTextContent()).items;
            const styleItems = (await (await pdf.getPage(i)).getTextContent()).styles;

            textItems.forEach(item => {
                if ('str' in item && item.str.trim().length !== 0)
                    text_items_by_page.at(-1)!.push({
                        str: item.str,
                        y_val: item.transform[5],
                        gap_with_after: 0,
                    })
            })
        }

        // calculate gap between text items
        text_items_by_page.forEach(pageItems => {
            for (let i = 0; i < pageItems.length - 1; i++) {
                pageItems[i].gap_with_after = Math.abs(pageItems[i].y_val - pageItems[i + 1].y_val);
            }
        })
        // console.log(cloneDeep(text_items_by_page));

        text_items_by_page.forEach(pageItems => {
            for (let i = 0; i < pageItems.length - 1; i++) {
                if (pageItems[i].gap_with_after < PARAGRAPH_Y_VAL_THRESHOLD) {
                    pageItems[i].str += ' ' + pageItems[i + 1].str;
                    pageItems[i].y_val = pageItems[i + 1].y_val;
                    pageItems[i].gap_with_after = pageItems[i + 1].gap_with_after;
                    pageItems.splice(i + 1, 1);
                    i--;
                }
            }
        })
        // console.log(cloneDeep(text_items_by_page));

        const result = text_items_by_page.map(x => x.map(y => y.str))
        return new ParsedPdf(result);
    }
}

/**
 * Get the PDFDocumentProxy for a given local pdf url
 * @param url that points to pdf
 * @returns a Promise<PDFDocumentProxy>
 */
export async function getPdfProxy(url: string): Promise<PDFDocumentProxy> {
    return getDocument(url).promise;
}

// const KEYWORD_HEADER_REGEX = /Key\s*words\./i
const KEYWORD_END_REGEX = /RAFFLES|INTRODUCTION/i

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