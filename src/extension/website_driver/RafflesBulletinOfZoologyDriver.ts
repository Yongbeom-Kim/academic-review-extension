import { ParsedUrl } from "../model/ParsedUrlObject";
import ParserDriver from "./BaseParserDriver";
import { toTitleCase } from "../libs/utils/str_utils";
import { categorizeStringTable } from "../libs/utils/obj_utils";

// Array.from(document.querySelectorAll('div.publication-layout')).map(e => e.innerText.split(/\s*\n\s*/))

const DOWNLOAD_PDF_HYPERLINK_TEXT = 'Download PDF'

const PAGES_WITH_PP_REGEX = /Pp\. (\d+–\d+)/
const PLAIN_PAGES_REGEX = /\d+–\d+/
const EXCERPT_WITH_PAGES_REGEX = /([^\.]+)(?:\. )?(?:Pp\.|:) (\d+–\d+)/

const IS_PAGES = (s: string) => PLAIN_PAGES_REGEX.test(s);
const IS_PUBLICATION_TYPE = (s: string) => {
    return s.startsWith('Taxonomy') ||
    s.startsWith('Systematic') ||
    s.startsWith('Conservation') ||
    s.startsWith('Ecology') ||
    s.startsWith('Perspective') ||
    s.startsWith('Communication') ||
    s.startsWith('Review') ||
    s.startsWith('Erratum') ||
    s.startsWith('Corrigendum')
};
const IS_AUTHOR = (s: string) => { // Authors are all in uppercase
    return !(/[a-z]/.test(s))
}
const IS_LINK = (s: string) => s.startsWith("https://")
const IS_TITLE = (s: string) => !(IS_PAGES(s) || IS_PUBLICATION_TYPE(s) || IS_AUTHOR(s) || IS_LINK(s))
const IS_VOLUME_NUMBER = (s: string) => /\d+(?:\(\d+\))?/.test(s)


export default class RafflesBulletinOfZoologyDriver implements ParserDriver {
    // Example: https://lkcnhm.nus.edu.sg/publications/raffles-bulletin-of-zoology/volumes/volume-63/
    static URL_REGEX = new RegExp("lkcnhm\.nus\.edu\.sg\/publications\/raffles-bulletin-of-zoology\/volumes\/");

    get_links(document: Document): ParsedUrl[] {
        const volume_no = document.querySelector('.title-page')?.textContent?.split(' ')?.slice(-1)[0] ?? "";

        const elements = Array.from(document.querySelectorAll('div.publication-layout'));
        const texts = elements.map((e, i) => {
            const text_array: string[] = e.innerText.split(/\s*\n\s*/)
                .map(s => s.trim())
                .filter(s => s !== DOWNLOAD_PDF_HYPERLINK_TEXT);

            // sometimes, text_array[2] is excerpt + pages
            if (EXCERPT_WITH_PAGES_REGEX.test(text_array[2])) {
                const matches = text_array[2].match(EXCERPT_WITH_PAGES_REGEX)!
                text_array[2] = matches[1];
                text_array.push(matches[2]);
            }

            const link = e.querySelector('a[href]')?.getAttribute('href') ?? ""

            text_array.push(volume_no)
            text_array.push(link)
            
            return text_array;
        }).filter(e => e.length === 6); // TODO: get rid of this filter by allowing for different table and column lengths in categorizeStringTable.
        
        const column_headers = ['volume_no', 'authors', 'title', 'publication_type', 'page_no', 'link'];
        const column_header_predicates = [IS_VOLUME_NUMBER, IS_AUTHOR, IS_TITLE, IS_PUBLICATION_TYPE, IS_PAGES, IS_LINK]

        const categorized_texts = categorizeStringTable(texts, column_headers, column_header_predicates);

        console.log({categorized_texts})
        return categorized_texts.map(ParsedUrl.from);
    }


    is_url(url: string): boolean {
        return RafflesBulletinOfZoologyDriver.URL_REGEX.test(url);
    }
}