import { DataFrame } from "../../../src/extension/model/DataFrame";

/**
 * Test @method CreateUnevenDF
 */
describe('test DataFrame.CreateUnevenDF method', () => {
    test('normal table', () => {
        const headers = ['a', 'b', 'c']
        const data = [[1, 2, 3], [1, 2, 3], [1, 2, 3]]
        const expected = new DataFrame(headers, data)
        expect(DataFrame.Uneven(headers, data)).toEqual(expected)
    })

    test('jagged table with missing values', () => {
        const headers = ['a', 'b', 'c']
        const data = [[1, 2, 3], [1], [1, 2]]
        const expected_data = [[1, 2, 3], [1, DataFrame.EMPTY_CELL, DataFrame.EMPTY_CELL], [1, 2, DataFrame.EMPTY_CELL]]
        const expected = new DataFrame(headers, expected_data)
        expect(DataFrame.Uneven(headers, data)).toEqual(expected)
    })

    test('too few headers throw an error', () => {
        const headers = ['a', 'b', 'c']
        const data = [[1, 2, 3], [1], [1, 2, 3, 4]]
        expect(() => DataFrame.Uneven(headers, data)).toThrow()
    })
})

/**
 * Test @method FromPlainObject
 */
describe('test DataFrame.FromPlainObject method', () => {
    test('objects with common keys', () => {
        const input = [{ 'a': 1, 'b': 2, 'c': 3 }, { 'a': 4, 'b': 5, 'c': 6 }]
        const expectedOutput = new DataFrame(['a', 'b', 'c'], [[1, 2, 3], [4, 5, 6]])
        expect(DataFrame.FromPlainObjectArray(input)).toEqual(expectedOutput);
    })

    test('objects with distinct keys', () => {
        const input = [{ 'a': 1, 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5, 'f': 6 }]
        const expectedOutput = new DataFrame(
            ['a', 'b', 'c', 'd', 'e', 'f'],
            [
                [1, 2, 3, DataFrame.EMPTY_CELL, DataFrame.EMPTY_CELL, DataFrame.EMPTY_CELL],
                [DataFrame.EMPTY_CELL, DataFrame.EMPTY_CELL, DataFrame.EMPTY_CELL, 4, 5, 6]
            ]
        )
        //@ts-ignore
        expect(DataFrame.FromPlainObjectArray(input)).toEqual(expectedOutput);
    })
})

/**
 * test @method toCsvString
 */
describe('test df.toCsvString', () => {
    test('basic 1x2 csv file', () => {
        const input = new DataFrame(['a', 'b'], [[1, 2], [1, 2]])
        const expectedOutput = '"a","b"\n"1","2"\n"1","2"'
        expect(input.toCsvString()).toBe(expectedOutput)
    })

    test('test empty cell', () => {
        const input = new DataFrame(['a', 'b'], [[DataFrame.EMPTY_CELL, 2], [1, DataFrame.EMPTY_CELL]])
        const expectedOutput = `"a","b"\n${DataFrame.EMPTY_CSV_CELL},"2"\n"1",${DataFrame.EMPTY_CSV_CELL}`
        expect(input.toCsvString()).toBe(expectedOutput)
    })

    test('test quotes (")', () => {
        const input = new DataFrame(['"a"', '"b"'], [['"1"', '"2"']])
        const expectedOutput = '"""a""","""b"""\n"""1""","""2"""'
        expect(input.toCsvString()).toBe(expectedOutput)
    })
})

/**
 * Test for @method toPlainObjectArray
 */
describe('testing df.toPlainObjectArray method', () => {
    test('parse data with only one row', () => {
        const cols = ['1', '2', '3']
        const data = [['a', 'b', 'c']]
        const expected = [{ '1': 'a', '2': 'b', '3': 'c' }]
        expect(new DataFrame(cols, data).toPlainObjectArray()).toEqual(expected);
    })

    test('parse data with only multiple rows', () => {
        const cols = ['1', '2', '3']
        const data = [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']]
        const expected = [{ '1': 'a', '2': 'b', '3': 'c' }, { '1': 'd', '2': 'e', '3': 'f' }, { '1': 'g', '2': 'h', '3': 'i' }]
        expect(new DataFrame(cols, data).toPlainObjectArray()).toEqual(expected);
    })

})

/**
 * Test for @method copy
 */
describe('test df.copy', () => {
    test('test deep copy', () => {
        const testDf = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6]])
        const testDfCopy = testDf.copy()
        testDfCopy.data[0][0] = -5;
        expect(testDf).toEqual(new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6]]))
    })
})
/**
 * Test for @method transform
 */
describe('test df.transform', () => {
    test('src column name not found throws error', () => {
        const testDf = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6]])
        expect(() => testDf.transform('4', '2', x => x + 1)).toThrow()
    })
    test('dst column name not found is added', () => {
        const testDf = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6]])
        const expectedDf = new DataFrame(['1', '2', '3', '4'], [[1, 2, 3, 4], [4, 5, 6, 7]])
        testDf.transform('3', '4', x => x + 1)
        expect(testDf).toEqual(expectedDf)
    })
    test('erraneous function throws error', () => {
        const testDf = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6]])
        expect(() => testDf.transform('2', '2', x => { throw new Error() })).toThrow()
    })
    test('normal transform', () => {
        const testDf = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6]])
        const expectedDf = new DataFrame(['1', '2', '3'], [[5, 2, 3], [8, 5, 6]])
        testDf.transform('3', '1', x => x + 2)
        expect(testDf).toEqual(expectedDf)
    })
    test('handle empty cells', () => {
        const testDf = DataFrame.Uneven(['1', '2', '3'], [[1, 2, 3], [4, 5]])
        const expectedDf = DataFrame.Uneven(['1', '2', '3'], [[1, 2, 5], [4, 5]])
        testDf.transform('3', '3', x => x + 2)
        expect(testDf).toEqual(expectedDf)
    })
})

/**
 * Test for @method pushEmptyColumn
 */

describe('test df.transform', () => {
    test('adding existing column throws error', () => {
        const cols = ['a', 'b', 'c']
        const data = [[1, 2, 3], [4, 5, 6]]
        const df = new DataFrame(cols, data);
        expect(() => df.pushEmptyColumn('a')).toThrow();
    })

    test('add new column', () => {
        const cols = ['a', 'b', 'c']
        const data = [[1, 2, 3], [4, 5, 6]]
        const df = new DataFrame(cols, data);
        const expected_cols = ['a', 'b', 'c', 'd']
        const expected_data = [[1, 2, 3, DataFrame.EMPTY_CELL], [4, 5, 6, DataFrame.EMPTY_CELL]]
        const expected_df = new DataFrame(expected_cols, expected_data)
        df.pushEmptyColumn('d')
        expect(df).toEqual(expected_df);
    })
})

/**
 * Test for @method reorderColumns
 */
describe('test df.reorderColumns', () => {

    test('throw error on too few column names', () => {
        const test_df = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6]])
        expect(() => test_df.reorderColumns(['1', '3'])).toThrow();
    })

    test('throw error on too many column names', () => {
        const test_df = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6]])
        expect(() => test_df.reorderColumns(['1', '2', '3', '4'])).toThrow();
    })

    test('throw error on column name not found', () => {
        const test_df = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6]])
        expect(() => test_df.reorderColumns(['1', '2', '4'])).toThrow();
    })

    test('proper rearrangement', () => {
        const test_df = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6]])
        const expected_df = new DataFrame(['3', '1', '2'], [[3, 1, 2], [6, 4, 5]])
        test_df.reorderColumns(['3','1','2']);
        expect(test_df).toEqual(expected_df);
    })

})