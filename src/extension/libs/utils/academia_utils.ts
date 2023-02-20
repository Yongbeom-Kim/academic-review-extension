import { countries } from 'countries-list';
import { min } from 'lodash';
import { findPhraseinTwoPasses, findWordWithRadius, toTitleCase } from './str_utils';
/**
 * Given a string of authors, fetch the author count
 * @param authors string of authors
 * @returns the number of authors inside the string.
 */
export const get_author_count = (authors: string) => {
    let author_count = 0;
    authors.trim().split(/\s*(and|&|,)\s*/i).forEach(author => {
        if (!(/\s/).test(author)) // only one word is not an author (e.g. Frank, Tom & Billy Bob is only 2)
            return

        author_count++;
    })

    return author_count;
}

// These aren't really function words, but close enough
const FUNCTION_WORDS = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us']
/**
 * Emulate bibTex's citekey generation. Not guaranteed to be unique, but it is unique enough
 * @param title title of paper
 * @param authors authors of paper
 * @param year year of paper
 * @returns a 'unique' citekey for the paper.
 */
export const get_cite_key = (title: string | undefined, authors: string | undefined, year: string | undefined) => {
    title = title ?? '';
    authors = authors ?? '';
    year = year ?? '';
    let cite_key = "";
    cite_key += (authors.split(/\s+/)[0]).toLowerCase()

    // at most 4 non-fn words from title
    const TITLE_LIMIT = 4;
    let i = 0;
    title.split(/\s+/).forEach(word => {
        if (FUNCTION_WORDS.includes(word.toLowerCase()))
            return;
        if (i < TITLE_LIMIT) {
            cite_key += toTitleCase(word)
            i++;
        }
    })

    // add year
    if (year != '')
        cite_key += `(${year})`

    return cite_key.replaceAll(/\W/g, '');
}

export const METADATA = {
    VolumeNumber: 'volume_no',
    Year: 'year',
    Authors: 'authors',
    AuthorCount: 'author_count',
    Title: 'title',
    PageNumber: 'page_no',
    PublicationType: 'publication_type',
    Keywords: 'keywords',
    Countries: 'countries',
    Link: 'link',
    Display: 'display_string',
    CiteKey: 'cite_key',
    LocalPath: 'local_path'
}

export const DATA_ORDERING = [
    METADATA.CiteKey,
    METADATA.VolumeNumber,
    METADATA.Year,
    METADATA.Authors,
    METADATA.AuthorCount,
    METADATA.Title,
    METADATA.PageNumber,
    METADATA.PublicationType,
    METADATA.Keywords,
    METADATA.Countries,
    METADATA.Link,
    METADATA.Display
];


/**
 * Get the body of a paper.
 * Returns everything from start, to everything before acknowledgements/citations.
 * If acknowledgements are not found, we try to find 
 * @param paper
 */
export function getBody(paper: string): string {
    const last_sections = ['ACKNOWLEDGEMENTS', 'LITERATURE CITED', 'CITATIONS']
    const end = min(last_sections.map(section => paper.lastIndexOf(section)).filter(index => index !== -1))
    return paper.slice(0, end);
}


const DATE_REGEX = /date/i
const PUBLICATION_DATE_SIGNPOST_REGEX = /date\s*of\s*publication|publication\s*date/i
const YEAR_REGEX = /\d{4}/;
/**
 * Get the body of a paper.
 * We attempt to do this with the TEXT CONTENTS of the pdf, not its metadata
 * We find things in this manner because it is more flexible but still somewhat robust.
 * @param pdf pdf to parse
 * @returns a number.
 */
export function getYear(paper: string): (number | undefined) {
    const candidates = findPhraseinTwoPasses(DATE_REGEX, PUBLICATION_DATE_SIGNPOST_REGEX, paper, 8);
    for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i]
        if (YEAR_REGEX.test(candidate))
            return parseInt(candidate.match(YEAR_REGEX)![0]);
    }
}

const LKC_DEPOSIT_TEST_REGEX = /LKCNHM|RMBR|ZRC/i
export function getDepositLKCExcerpts(paper: string): string[] {
    return findWordWithRadius(LKC_DEPOSIT_TEST_REGEX, paper, 8);
}


const INTRODUCTION_SECTION_HEAD_REGEX = /INTRODUCTION/;
const AUTHOR_INFO_REGEX = /accepted by:/i;
export function getAuthorCountries(paper: string) {

    const intro_index = paper.search(INTRODUCTION_SECTION_HEAD_REGEX)
    const author_info_index = paper.search(AUTHOR_INFO_REGEX)
    console.log(paper.slice(author_info_index, intro_index))

    return getAllCountriesFrom(paper.slice(author_info_index, intro_index));
}




//@ts-ignore
const COUNTRY_NAMES = Object.keys(countries).map(code => countries[code].name);
const COUNTRY_NAMES_LOWERCASE = COUNTRY_NAMES.map(x => x.toLowerCase())

/**
 * Method to extract all countries (in order) from a text.
 * @param text text to extract country from
 * @returns the countries extracted.
 */
export function getAllCountriesFrom(text: string): string[] {
    const countries_scraped: string[] = [];
    text.split(/\s+/).forEach(word => {
        if (COUNTRY_NAMES_LOWERCASE.includes(word.toLowerCase())) {
            const index = COUNTRY_NAMES_LOWERCASE.indexOf(word.toLowerCase());
            countries_scraped.push(COUNTRY_NAMES[index]);
        }
    })

    return countries_scraped;
}
