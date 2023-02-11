import { DataFrame } from "../../../src/extension/model/DataFrame";

/**
 * Test @method CreateUnevenDF
 */
describe('test DataFrame.CreateUnevenDF method', () => {
    test('normal table', () => {
        const headers = ['a', 'b', 'c']
        const data = [[1, 2, 3], [1, 2, 3], [1, 2, 3]]
        const expected = new DataFrame(headers, data)
        expect(DataFrame.CreateUnevenDF(headers, data)).toEqual(expected)
    })

    test('jagged table with missing values', () => {
        const headers = ['a', 'b', 'c']
        const data = [[1, 2, 3], [1], [1, 2]]
        const expected_data = [[1, 2, 3], [1, DataFrame.EMPTY_CELL, DataFrame.EMPTY_CELL], [1, 2, DataFrame.EMPTY_CELL]]
        const expected = new DataFrame(headers, expected_data)
        expect(DataFrame.CreateUnevenDF(headers, data)).toEqual(expected)
    })

    test('too few headers throw an error', () => {
        const headers = ['a', 'b', 'c']
        const data = [[1, 2, 3], [1], [1, 2, 3, 4]]
        expect(() => DataFrame.CreateUnevenDF(headers, data)).toThrow()
    })
})

/**
 * Test @method FromPlainObject
 */
describe('test DataFrame.FromPlainObject method', () => {
    test('objects with common keys', () => {
        const input = [{ 'a': 1, 'b': 2, 'c': 3 }, { 'a': 4, 'b': 5, 'c': 6 }]
        const expectedOutput = new DataFrame(['a', 'b', 'c'], [[1, 2, 3], [4, 5, 6]])
        expect(DataFrame.FromPlainObject(input)).toEqual(expectedOutput);
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
        expect(DataFrame.FromPlainObject(input)).toEqual(expectedOutput);
    })
})