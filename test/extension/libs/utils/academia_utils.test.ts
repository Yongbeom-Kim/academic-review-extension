import { get_author_count, getAllCountriesFrom, getAllUniqueCountriesFrom} from "../../../../src/extension/libs/utils/academia_utils";

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

/**
 * Test for @method getAllCountriesFrom
 */
describe('test getAllCountriesFrom', () => {
    test('get a number of countries', () => {
        expect(getAllCountriesFrom('China absohe china china')).toEqual(['China','China','China'])
    })

    test('get countries from sample abstract', () => {
        const sample_abstract = "    Abstract. Hybridisation has played an important role in generating evolutionary novelty and diversification in plants and animals. During invasions, hybridisation may contribute to lineages with improved genotypes and greater invasive potential. Two morphologically cryptic species of invasive apple snails, Pomacea canaliculata and P. maculata , are known to hybridise in their native and invaded ranges. These two species are widespread in Peninsular Malaysia and occur in sympatry in several sites. We asked whether hybrid lineages of Pomacea existed in Peninsular Malaysia and whether genetic exchange was ongoing in nine populations. We generated mitochondrial and nuclear genealogies to assess patterns of interspecific genetic exchange and subsequently, hybrid diagnosis. First, we conducted a restriction enzyme analysis based-preliminary screening using the nuclear elongation factor 1-alpha (EF1α) amplicons of 90 Pomacea specimens from nine locations. Next, we reconstructed phylogenies of the nuclear EF1α and mitochondrial cytochrome c oxidase subunit I (COI) to validate the restriction analysis data. The molecular data provided evidence of interspecific hybridisation at a rate of 42.2% where (i) 18 heterozygous individuals possessed both EF1α sequences of P. canaliculata and P. maculata and (ii) 20 individuals exhibited EF1α-COI mito-nuclear incongruences. Our study provides the first molecular evidence of introgression and ongoing hybridisation in Peninsular Malaysia with potential implications for the acquisition of traits that enhance invasiveness in hybrid lineages."
        expect(getAllCountriesFrom(sample_abstract).includes('Malaysia')).toBeTruthy()
    })
})

/**
 * Test for @method getAllUnqiueCountriesFrom
 */
describe('test getAllUnqiueCountriesFrom', () => {
    test('get a number of countries', () => {
        expect(getAllUniqueCountriesFrom('China absohe china china')).toEqual(['China'])
    })

    test('get countries from sample abstract', () => {
        const sample_abstract = "    Abstract. Hybridisation has played an important role in generating evolutionary novelty and diversification in plants and animals. During invasions, hybridisation may contribute to lineages with improved genotypes and greater invasive potential. Two morphologically cryptic species of invasive apple snails, Pomacea canaliculata and P. maculata , are known to hybridise in their native and invaded ranges. These two species are widespread in Peninsular Malaysia and occur in sympatry in several sites. We asked whether hybrid lineages of Pomacea existed in Peninsular Malaysia and whether genetic exchange was ongoing in nine populations. We generated mitochondrial and nuclear genealogies to assess patterns of interspecific genetic exchange and subsequently, hybrid diagnosis. First, we conducted a restriction enzyme analysis based-preliminary screening using the nuclear elongation factor 1-alpha (EF1α) amplicons of 90 Pomacea specimens from nine locations. Next, we reconstructed phylogenies of the nuclear EF1α and mitochondrial cytochrome c oxidase subunit I (COI) to validate the restriction analysis data. The molecular data provided evidence of interspecific hybridisation at a rate of 42.2% where (i) 18 heterozygous individuals possessed both EF1α sequences of P. canaliculata and P. maculata and (ii) 20 individuals exhibited EF1α-COI mito-nuclear incongruences. Our study provides the first molecular evidence of introgression and ongoing hybridisation in Peninsular Malaysia with potential implications for the acquisition of traits that enhance invasiveness in hybrid lineages."
        expect(getAllUniqueCountriesFrom(sample_abstract)).toEqual(['Malaysia'])
    })
})