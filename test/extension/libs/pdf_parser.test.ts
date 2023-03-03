import { ParsedPdf, getPdfProxy } from "../../../src/extension/libs/pdf_parser";

const TEST_PDF = 'test/pdf_resources/vol_69/adrianMolecularEvidenceHybridisationInvasive69.pdf'

describe('unit testing pdf parser', () => {
    test('can load pdf without error', async () => {
        const pdfProxy = await getPdfProxy(TEST_PDF);
        expect(pdfProxy).not.toEqual(undefined);
    })
})