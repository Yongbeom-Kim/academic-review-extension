import { get_author_count } from "../../../../src/extension/libs/utils/academia_utils";

/**
 * Test for @method get_author_count
 */
describe('test get_author_count', () => {
    test('single author, comma-ed last name', () => {
        const authors = "EDWIN E. DUMALAGAN, JR."
        const expected_count = 1
        expect(get_author_count(authors)).toBe(expected_count);
    })
    
    test('single author', () => {
        const authors = "TIMOTHY JOSEPH R. QUIMPO"
        const expected_count = 1
        expect(get_author_count(authors)).toBe(expected_count);
    })
    
    test('two authors (delimiter AND)', () => {
        const authors = "TIMOTHY JOSEPH R. QUIMPO AND PATRICK C. CABAITAN"
        const expected_count = 2
        expect(get_author_count(authors)).toBe(expected_count);
    })
    test('two authors (delimiter &)', () => {
        const authors = "TIMOTHY JOSEPH R. QUIMPO & PATRICK C. CABAITAN"
        const expected_count = 2
        expect(get_author_count(authors)).toBe(expected_count);
    })
    
    test('two authors (delimiter AND), comma-ed last name', () => {
        const authors = "EDWIN E. DUMALAGAN, JR. AND PATRICK C. CABAITAN"
        const expected_count = 2
        expect(get_author_count(authors)).toBe(expected_count);
    })

    test('multiple authors, with comma-ed last name (delimiter AND)', () => {
        const authors = "TIMOTHY JOSEPH R. QUIMPO, PATRICK C. CABAITAN, RONALD DIONNIE D. OLAVIDES, EDWIN E. DUMALAGAN, JR., JEFFREY MUNAR AND FERNANDO P. SIRINGAN"
        const expected_count = 6
        expect(get_author_count(authors)).toBe(expected_count);
    })

    test('multiple authors, with comma-ed last name (delimiter &)', () => {
        const authors = "TIMOTHY JOSEPH R. QUIMPO, PATRICK C. CABAITAN, RONALD DIONNIE D. OLAVIDES, EDWIN E. DUMALAGAN, JR., JEFFREY MUNAR & FERNANDO P. SIRINGAN"
        const expected_count = 6
        expect(get_author_count(authors)).toBe(expected_count);
    })

})