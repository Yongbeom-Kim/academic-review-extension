import { DataFrame } from "../../../src/extension/model/DataFrame";
import { isBetween0to10, isOne, isThree, isTwo, isZero } from "../../test_utils";

const EPSILON = 0.000000001;

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
 * Test for @method popColumn
 */
describe('test df.popColumn', () => {
    test('test pop column', () => {
        const df = new DataFrame(['1','2','3'], [[1,2,3],[4,5,6],[7,8,9]])
        const expected_df = new DataFrame(['1','3'], [[1,3],[4,6],[7,9]])
        df.popColumn('2');
        expect(df).toEqual(expected_df);
    })
})
/**
 * Test for @method reorderColumns
 */
describe('test df.reorderColumns', () => {

    test('reorder to fewer column names', () => {
        const test_df = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6]])
        const expected_df = new DataFrame(['1', '3'], [[1, 3], [4, 6]])
        test_df.reorderColumns(expected_df.headers);
        expect(test_df).toEqual(expected_df);
    })

    test('reorder and increase columns names', () => {
        const test_df = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6]])
        const expected_df = new DataFrame(['1', '2', '3', '4'], [[1, 2, 3, DataFrame.EMPTY_CELL], [4, 5, 6, DataFrame.EMPTY_CELL]])
        test_df.reorderColumns(expected_df.headers);
        expect(test_df).toEqual(expected_df);
    })

    test('Add column names not found', () => {
        const test_df = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6]])
        const expected_df = new DataFrame(['1', '2', '4'], [[1, 2, DataFrame.EMPTY_CELL], [4, 5, DataFrame.EMPTY_CELL]])
        test_df.reorderColumns(expected_df.headers);
        expect(test_df).toEqual(expected_df);
    })

    test('proper rearrangement', () => {
        const test_df = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6]])
        const expected_df = new DataFrame(['3', '1', '2'], [[3, 1, 2], [6, 4, 5]])
        test_df.reorderColumns(['3', '1', '2']);
        expect(test_df).toEqual(expected_df);
    })

})


/**
 * Test for @method categorizeStringTable
 * TODO: replace .isEqual() .toBeTruthy with a custom jest match function
 */
describe('testing categorizeStringTable function', () => {

    test('column header length > column predicate length throws error', () => {
        const cols = ['0', '1', '2']
        const table = [[0, 1, 2]]
        const preds = { '0': isZero, '1': isOne }
        expect(() => DataFrame.AutoHeaders(cols, table, preds)).toThrow()
    })

    test('table data width > column predicate length throws error', () => {
        const cols = ['0', '1']
        const table = [[2, 0, 1]]
        const preds = { '0': isZero, '1': isOne }
        expect(() => DataFrame.AutoHeaders(cols, table, preds)).toThrow();
    })

    test('column duplicate headers throws error', () => {
        const cols = ['0', '1', '1']
        const table = [[0, 1, 2], [0, 1, 2], [0, 1, 2]]
        const preds = { '0': isZero, '1': isOne, '2': isTwo }
        expect(() => DataFrame.AutoHeaders(cols, table, preds)).toThrow()
    })

    test('handle table data width < column predicate', () => {
        const cols = ['0', '1', '2', '3']
        const table = [[2, 1, 0]]
        const preds = { '0': isZero, '1': isOne, '2': isTwo, '3': isThree }
        const expected = DataFrame.Uneven(['0', '1', '2', '3'], [[0, 1, 2]])
        expect(DataFrame.AutoHeaders(cols, table, preds).isEqual(expected)).toBeTruthy();
    })

    test('handle inconsistent table width', () => {
        const cols = ['0', '1', '2']
        const table = [[2, 1, 0], [2, 1, 0], [2]]
        const preds = { '0': isZero, '1': isOne, '2': isTwo }
        const expected = DataFrame.Uneven(['0', '1', '2'], [[0, 1, 2], [0, 1, 2], [DataFrame.EMPTY_CELL, DataFrame.EMPTY_CELL, 2]])
        expect(DataFrame.AutoHeaders(cols, table, preds).isEqual(expected)).toBeTruthy();
    })

    test('perfect columns are matched correctly', () => {
        const cols = ['0', '1', '2']
        const table = [[1, 2, 0], [1, 2, 0], [1, 2, 0]]
        const preds = { '0': isZero, '1': isOne, '2': isTwo }
        const expected = new DataFrame(['0', '1', '2'], [[0, 1, 2], [0, 1, 2], [0, 1, 2]])
        expect(DataFrame.AutoHeaders(cols, table, preds).isEqual(expected)).toBeTruthy();
    })

    test('imperfect columns are matched correctly', () => {
        const cols = ['0', '1', '2']
        const table = [[1, 2, 0], [1, 2, 0], [2, 0, 1]]
        const preds = { '0': isZero, '1': isOne, '2': isTwo }
        const expected = new DataFrame(['0', '1', '2'], [[0, 1, 2], [0, 1, 2], [1, 2, 0]])
        expect(DataFrame.AutoHeaders(cols, table, preds).isEqual(expected)).toBeTruthy();
    })

    test('specific and general columns are matched correctly', () => {
        const cols = ['0', '1', '10']
        const table = [[9, 0, 1], [4, 0, 1], [1, 0, 1]]
        const preds = { '0': isZero, '1': isOne, '10': isBetween0to10 }
        const expected = new DataFrame(['0', '1', '10'], [[0, 1, 9], [0, 1, 4], [0, 1, 1]])
        // const result = [{ '0': '0', '1': '1', '10': '9' }, { '0': '0', '1': '1', '10': '4' }, { '0': '0', '1': '1', '10': '1' }]
        expect(DataFrame.AutoHeaders(cols, table, preds).isEqual(expected)).toBeTruthy();
    })
})

/**
 * Tests for @method isEqual
 */
describe('testing df.equal', () => {
    test('test exact same dataframe', () => {
        const df1 = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6], [7, 8, 9]])
        const df2 = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6], [7, 8, 9]])
        expect(df1.isEqual(df2)).toBeTruthy();
    })

    test('test dataframe with rearranged rows', () => {
        const df1 = new DataFrame(['1', '2', '3'], [[1, 2, 3], [4, 5, 6], [7, 8, 9]])
        const df2 = new DataFrame(['3', '1', '2'], [[3, 1, 2], [6, 4, 5], [9, 7, 8]])
        expect(df1.isEqual(df2)).toBeTruthy();
    })

    test('test dataframe with rearranged, undefined rows', () => {
        const df1 = new DataFrame(['1', '2', '3'], [[1, 2, DataFrame.EMPTY_CELL]])
        const df2 = new DataFrame(['3', '1', '2'], [[DataFrame.EMPTY_CELL, 1, 2]])
        expect(df1.isEqual(df2)).toBeTruthy();
    })

    test('test two empty dataframes', () => {
        const df1 = DataFrame.Empty<number>(['1','2','3'])
        const df2 = DataFrame.Empty<number>(['1','2','3'])
        expect(df1.isEqual(df2)).toBeTruthy();
    })
})

/**
 * test for @method getMatchScore
 */
describe('testing df.getMatchScore function', () => {

    test('perfect match, 1 row', () => {
        const df = new DataFrame(['0', '1', '2'], [[0, 1, 2]])
        const preds = {'0': isZero, '1': isOne, '2': isTwo}
        expect(df['getMatchScore'](preds)).toBe(1)
    })

    test('imperfect match, 1 row', () => {
        const df = new DataFrame(['0', '1', '2'], [[0, 1, 1]])
        const preds = {'0': isZero, '1': isOne, '2': isTwo}
        expect(df['getMatchScore'](preds)).toBeCloseTo(2 / 3, EPSILON)
    })
    test('no match, 1 row', () => {
        const df = new DataFrame(['0', '1', '2'], [[1, 2, 3]])
        const preds = {'0': isZero, '1': isOne, '2': isTwo}
        expect(df['getMatchScore'](preds)).toBe(0)
    })
    test('perfect match, 3 row', () => {
        const df = new DataFrame(['0', '1', '2'], [[0, 1, 2], [0, 1, 2], [0, 1,2]])
        const preds = {'0': isZero, '1': isOne, '2': isTwo}
        expect(df['getMatchScore'](preds)).toBe(1)
    })

})

/**
 * Tests for @method selectRows
 */
describe('testing df.selectRows', () => {
    test('select no rows', () => {
        const df = new DataFrame(['1','2','3'], [[1,2,3],[1,2,3]])
        const rows = [false, false]
        const df_expected = DataFrame.Empty<number>(['1','2','3'])
        expect(df.selectRows(rows).isEqual(df_expected)).toBeTruthy()
    })
    test('select some rows', () => {
        const df = new DataFrame(['1','2','3'], [[1,2,3],[4,5,6],[7,8,9]])
        const rows = [false, true, false]
        const df_expected = new DataFrame(['1','2','3'], [[4,5,6]])
        expect(df.selectRows(rows).isEqual(df_expected)).toBeTruthy()
    })
})