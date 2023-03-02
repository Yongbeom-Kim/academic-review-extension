import { cloneDeep } from "lodash";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { PDFDocumentProxy, PDFPageProxy, TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";
import { getAllCountriesFrom } from "./utils/academia_utils";
import { findPhraseinTwoPasses } from "./utils/str_utils";

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

const ACCEPTED_BY_HEADER_REGEX = /^Accepted\s*by\s?:?/i;

const INTRODUCTION_HEADER_REGEX = /^INTRODUCTION/i;
const METHODOLOGY_HEADER_REGEX = /^(?:MATERIALS?\s+AND\s+METHODS?|METHODOLOGY)/i;
/**
 * Get the PDFDocumentProxy for a given local pdf url
 * @param url that points to pdf
 * @returns a Promise<PDFDocumentProxy>
 */
export async function getPdfProxy(url: string): Promise<PDFDocumentProxy> {
    return getDocument(url).promise;
}

/**
 * Class that represents a parsed PDFDocumentProxy object.
 */
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

    getYear(): number | undefined {
        const DATE_REGEX = /date/i
        const PUBLICATION_DATE_SIGNPOST_REGEX = /date\s?of\s?publication|publication\s?date/i
        const YEAR_REGEX = /\d{4}/;
        const text = this.getBody();
        const candidates = findPhraseinTwoPasses(DATE_REGEX, PUBLICATION_DATE_SIGNPOST_REGEX, text, 8);

        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i]
            if (YEAR_REGEX.test(candidate))
                return parseInt(candidate.match(YEAR_REGEX)![0]);
        }

        return undefined;
    }

    getBody(): string {
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

    getAuthorCountries(): string {
        const firstPage = this.paragraphs[0];
        const accepted_by_header = this.getSection([0], ACCEPTED_BY_HEADER_REGEX, 1);
        const keywords_header = this.getSection([0], KEYWORD_HEADER_REGEX, 1);
        const abstract_header = this.getSection([0], ABSTRACT_HEADER_REGEX, 1);
        const introduction_header = this.getSection([0], INTRODUCTION_HEADER_REGEX, 1);
        const methodology_header = this.getSection([0], METHODOLOGY_HEADER_REGEX, 1);

        if (typeof accepted_by_header === 'undefined')
            throw new Error("Cannot find Author Country");
        
        console.log({accepted_by_header})
        let start_index = firstPage.indexOf(accepted_by_header);
        let countries = []
        for (; start_index < firstPage.length; start_index++) {
            const paragraph = firstPage[start_index];
            if (
                paragraph === keywords_header ||
                paragraph === abstract_header ||
                paragraph === introduction_header ||
                paragraph === methodology_header
            )
                break;
                console.log(paragraph);
                console.log(getAllCountriesFrom(paragraph));
            countries.push(...getAllCountriesFrom(paragraph))
            // countries.push(getAllCountriesFrom(paragraph)[0])
        }
        console.log(countries)
        return countries.join(', ');
    }

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