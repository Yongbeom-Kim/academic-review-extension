import { ParsedPdf, getPdfProxy } from "../../../../src/extension/libs/pdf_parser";
import { getAllCountriesFrom, getAllUniqueCountriesFrom } from "../../../../src/extension/libs/utils/academia_utils";

const PDF_1 = 'test/pdf_resources/vol_69/adrianMolecularEvidenceHybridisationInvasive69.pdf'
const PDF_2 = 'test/pdf_resources/vol_69/ekgachaiHyriopsisPanhaiSpeciesFreshwater69.pdf'

let pdfs: ParsedPdf[] = [];
jest.setTimeout(10000)
beforeAll(() => {
    for (let i = 0; i < 2; i ++)
        pdfs.push(new ParsedPdf([['empty']]));
    
    return Promise.all([
        getPdfProxy(PDF_1).then((pdfProxy) => ParsedPdf.getParagraphsByPage(pdfProxy)).then(parsedPdfObj => pdfs[0] = parsedPdfObj),
        getPdfProxy(PDF_2).then((pdfProxy) => ParsedPdf.getParagraphsByPage(pdfProxy)).then(parsedPdfObj => pdfs[1] = parsedPdfObj),
    ])
})

describe('Get info from pdf 1', () => {
    let pdfObj: ParsedPdf;

    beforeAll(() => {
        pdfObj = pdfs[0];
    })

    test('get abstract', () => {
        const abstract = pdfObj.getAbstract()
        expect(abstract).not.toEqual(undefined)
        expect(abstract).not.toEqual('')
        expect(abstract?.startsWith('Abstract') || abstract?.startsWith('Hybridisation')).toBeTruthy();
        expect(abstract?.endsWith('lineages') || abstract?.endsWith('lineages.')).toBeTruthy();
    })

    test('get abstract countries', () => {
        const countries = getAllUniqueCountriesFrom(pdfObj.getAbstract() ?? "");
        expect(countries).toEqual(['Malaysia']);
    })

    test('get author countries', () => {
        const authorCountries = pdfObj.getAuthorCountries();
        expect(authorCountries.includes('Malaysia')).toBeTruthy();
    })

    test('get keywords', () => {
        const keywords = pdfObj.getKeyWords();
        expect(keywords?.startsWith('Key words.') || keywords?.startsWith('apple snails')).toBeTruthy();
        expect(keywords?.endsWith('phylogeny')).toBeTruthy();
    })

})



describe('Get info from pdf 2', () => {
    let pdfObj: ParsedPdf;

    beforeAll(() => {
        pdfObj = pdfs[1];
    })

    test('get abstract', () => {
        const abstract = pdfObj.getAbstract()
        expect(abstract).not.toEqual(undefined)
        expect(abstract).not.toEqual('')
        expect(abstract?.startsWith('Abstract') || abstract?.startsWith('A freshwater')).toBeTruthy();
        expect(abstract?.endsWith('scars') || abstract?.endsWith('scars.')).toBeTruthy();
    })

    test('get abstract countries', () => {
        const countries = getAllUniqueCountriesFrom(pdfObj.getAbstract() ?? "");
        expect(countries).toEqual(['Thailand']);
    })

    test('get author countries', () => {
        const authorCountries = pdfObj.getAuthorCountries();
        expect(authorCountries.includes('Thailand')).toBeTruthy();
        expect(authorCountries.includes('Portugal')).toBeTruthy();
        expect(authorCountries.includes('Cambodia')).toBeTruthy();
    })

    test('get keywords', () => {
        const keywords = pdfObj.getKeyWords();
        expect(keywords?.startsWith('Key words.') || keywords?.startsWith('Chao Phraya Basin')).toBeTruthy();
        expect(keywords?.endsWith('taxonomy')).toBeTruthy();
    })

})