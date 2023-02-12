import { ParsedUrl } from "../model/ParsedUrlObject";
import ParserDriver from "./BaseParserDriver";
import { DataFrame } from "../model/DataFrame";

// Array.from(document.querySelectorAll('div.publication-layout')).map(e => e.innerText.split(/\s*\n\s*/))

const DOWNLOAD_PDF_HYPERLINK_TEXT = 'Download PDF'

const PLAIN_PAGES_REGEX = new RegExp("\\d+(?:-|–)\\d+" + "|" + "\\d+")
const PAGES_WITH_PP_REGEX = new RegExp("Pp(?:\\.|:)\\s(\\d+(?:-|–)\\d+)" + "|" + "P(?:\\.|:)\\s(\\d+)")
const EXCERPT_WITH_PAGES_REGEX = new RegExp("([^\\.]+)(?:\\. )?" + `(${PAGES_WITH_PP_REGEX.source})`)

const IS_PAGES = (s: string) => PLAIN_PAGES_REGEX.test(s) || PAGES_WITH_PP_REGEX.test(s);
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
    return !IS_VOLUME_NUMBER(s) && !(/[a-z]/.test(s))
}
const IS_LINK = (s: string) => s.startsWith("https://")
const IS_TITLE = (s: string) => !(IS_PAGES(s) || IS_PUBLICATION_TYPE(s) || IS_AUTHOR(s) || IS_LINK(s))
const IS_VOLUME_NUMBER = (s: string) => !s.startsWith("Pp.") && /\d+(?:\(\d+\))?/.test(s)

const DATA_CATEGORIES = ['volume_no', 'authors', 'title', 'publication_type', 'page_no', 'link'];

const DATA_CATEGORY_PREDICATES = {
    'volume_no': IS_VOLUME_NUMBER,
    'authors': IS_AUTHOR,
    'title': IS_TITLE,
    'publication_type': IS_PUBLICATION_TYPE,
    'page_no': IS_PAGES,
    'link': IS_LINK
}

// TODO: abstract into a utils module and add tests
const get_author_count = (s: string) => {
    const authors = s.trim().split(/\s*(and|&|i)\s*/)
    let author_count = 0;

    authors.forEach(author => {
        if (!(/\s/).test(author)) // only one word is not an author (e.g. Frank, Tom & Billy Bob is only 2)
            return
        
        author_count ++;
    })

    return author_count;
}

export default class RafflesBulletinOfZoologyDriver implements ParserDriver {
    // Example: https://lkcnhm.nus.edu.sg/publications/raffles-bulletin-of-zoology/volumes/volume-63/
    static URL_REGEX = new RegExp("lkcnhm\.nus\.edu\.sg\/publications\/raffles-bulletin-of-zoology\/volumes\/");

    get_links(document: Document): ParsedUrl[] {
        const volume_no = document.URL.split("/").filter(s => s !== '').at(-1)?.slice(7) ?? ""
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
        });

        const df =
            DataFrame.AutoHeaders(DATA_CATEGORIES, texts, DATA_CATEGORY_PREDICATES)
        df.transform('page_no', 'page_no', str => { // Get rid of Pp. and P. in pages
            if (PAGES_WITH_PP_REGEX.test(str))
                return str.match(PAGES_WITH_PP_REGEX)![1]
            else
                return str
        })
        df.transform('authors', 'author_count', s => get_author_count(s).toString())

        return df.toPlainObjectArray().map(ParsedUrl.from)

    }


    is_url(url: string): boolean {
        return RafflesBulletinOfZoologyDriver.URL_REGEX.test(url);
    }
}