import ParserDriver from "./BaseParserDriver";
import { DataFrame } from "../model/DataFrame";
import { get_author_count, get_cite_key, METADATA } from "../libs/utils/academia_utils";
import { cloneDeep } from "lodash";

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

const DATA_CATEGORIES = [METADATA.VolumeNumber, METADATA.Authors, METADATA.Title, METADATA.PublicationType, METADATA.PageNumber, METADATA.Link];

const DATA_CATEGORY_PREDICATES: Record<string, (s: string) => boolean> = {}
DATA_CATEGORY_PREDICATES[METADATA.VolumeNumber] = IS_VOLUME_NUMBER;
DATA_CATEGORY_PREDICATES[METADATA.Authors] = IS_AUTHOR;
DATA_CATEGORY_PREDICATES[METADATA.Title] = IS_TITLE;
DATA_CATEGORY_PREDICATES[METADATA.PublicationType] = IS_PUBLICATION_TYPE;
DATA_CATEGORY_PREDICATES[METADATA.PageNumber] = IS_PAGES;
DATA_CATEGORY_PREDICATES[METADATA.Link] = IS_LINK;



export default class RafflesBulletinOfZoologyDriver implements ParserDriver {
    // Example: https://lkcnhm.nus.edu.sg/publications/raffles-bulletin-of-zoology/volumes/volume-63/
    static URL_REGEX = new RegExp("lkcnhm\.nus\.edu\.sg\/publications\/raffles-bulletin-of-zoology\/volumes\/");

    get_links(document: Document): DataFrame<string> {
        const volume_no = document.URL.split("/").filter(s => s !== '').at(-1)?.slice(7) ?? ""
        const elements = Array.from(document.querySelectorAll('div.publication-layout'));
        const texts = elements.map((e, i) => {
            //@ts-ignore e.innrText exists, unlike what TS thinks
            let text_array: string[] = e.innerText.split(/\s*\n\s*/)
                .map((s: string) => s.trim())
                .filter((s: string) => s !== DOWNLOAD_PDF_HYPERLINK_TEXT);

            text_array = cloneDeep(text_array);
            // So, the typical layout is:
            // Author
            // Title
            // Excerpt
            // IF there is something missing, it is probably the author.
            // So, we add back the empty author.
            if (text_array.length == 2)
                text_array.unshift('');

            // sometimes, text_array[2] is excerpt + pages
            if (EXCERPT_WITH_PAGES_REGEX.test(text_array[2])) {
                const matches = text_array[2].match(EXCERPT_WITH_PAGES_REGEX)!
                text_array[2] = matches[2];
                text_array.push(matches[1]);
            }

            const link = e.querySelector('a[href]')?.getAttribute('href') ?? ""
            
            // Adding to the start of the array guarantees uniformity in these rows that are 'guaranteed'.
            text_array.unshift(volume_no)
            text_array.unshift(link)

            return cloneDeep(text_array);
        });

        const df =
            DataFrame.AutoHeaders(DATA_CATEGORIES, texts, DATA_CATEGORY_PREDICATES)
        df.transform([METADATA.PageNumber], METADATA.PageNumber, str => { // Get rid of Pp. and P. in pages
            if (typeof(str) === 'undefined')
                return str
            if (PAGES_WITH_PP_REGEX.test(str))
                return str.match(PAGES_WITH_PP_REGEX)![1]
            else
                return str
        })

        df.transform([METADATA.Title], METADATA.Display, x => x);
        df.transform([METADATA.Authors], METADATA.AuthorCount, s => get_author_count(s ?? '').toString())
        df.transform([METADATA.Title, METADATA.Authors, METADATA.VolumeNumber], METADATA.CiteKey, get_cite_key)
        
        return df;

    }


    is_url(url: string): boolean {
        return RafflesBulletinOfZoologyDriver.URL_REGEX.test(url);
    }
}