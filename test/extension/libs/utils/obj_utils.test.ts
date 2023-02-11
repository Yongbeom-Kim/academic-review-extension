import { categorizeStringTable, tableToObject, test_export } from "../../../../src/extension/libs/utils/obj_utils";
import { expect, jest, test } from '@jest/globals';
import {
    alwaysFalse,
    alwaysTrue,
    isZero,
    isOne,
    isTwo,
    isThree,
    isFour,
    isBetween0to10,
    isBetween10to20,
    isBetween20to30,
    isBetween30to40,
    isBetween40to50,
} from '../../../test_utils';

const { permute, get_predicate_score } = test_export;

const EPSILON = 0.000001
/**
 * Test for @method permute
 */
describe('testing permute function', () => {
    test('array length 1', () => {
        expect(permute(['1']).sort()).toEqual([['1']].sort());
    })
    test('array length 2', () => {
        expect(permute(['1', '2']).sort()).toEqual([['1', '2'], ['2', '1']].sort());
    })
    test('array length 3', () => {
        const input = ['1', '2', '3'];
        const expected =
            [['1', '2', '3'],
            ['1', '3', '2'],
            ['2', '1', '3'],
            ['2', '3', '1'],
            ['3', '2', '1'],
            ['3', '1', '2']]
        expect(permute(input).sort()).toEqual(expected.sort());
    })
})

/**
 * test for @method get_predicate_score
 */
describe('testing get_predicate_score function', () => {
    test('perfect match, 1 row', () => {
        const table = [['0','1','2']]
        const preds = [isZero, isOne, isTwo]
        expect(get_predicate_score(table, preds)).toBe(1)
    })
    
    test('imperfect match, 1 row', () => {
        const table = [['0','1','1']]
        const preds = [isZero, isOne, isTwo]
        expect(get_predicate_score(table, preds)).toBeCloseTo(2/3, EPSILON)
    })
    test('no match, 1 row', () => {
        const table = [['1','2','3']]
        const preds = [isZero, isOne, isTwo]
        expect(get_predicate_score(table, preds)).toBe(0)
    })
    test('perfect match, 3 row', () => {
        const table = [['0','1','2'],['0','1','2'],['0','1','2']]
        const preds = [isZero, isOne, isTwo]
        expect(get_predicate_score(table, preds)).toBe(1)
    })

})

/**
 * Test for @method categorizeStringTable
 */
describe('testing categorizeStringTable function', () => {

    test('column header length < column predicate length throws error', () => {
        const cols = ['0', '1', '2']
        const table = [['0', '1', '2']]
        const preds = [isZero, isOne, isTwo, isThree]
        expect(() => categorizeStringTable(table, cols, preds)).toThrow()
    })

    test('column header length > column predicate length throws error', () => {
        const cols = ['0', '1', '2']
        const table = [['0', '1', '2']]
        const preds = [isZero, isOne]
        expect(() => categorizeStringTable(table, cols, preds)).toThrow()
    })

    test('handle table data width < column predicate', () => {
        const cols = ['0', '1', '2', '3']
        const table = [['2', '1', '0']]
        const preds = [isZero, isOne, isTwo, isThree]
        const expected = [{'0': '0', '1': '1', '2': '2'}]
        expect(categorizeStringTable(table, cols, preds)).toEqual(expected)
    })

    test('handle table data width > column predicate length', () => {
        const cols = ['0', '1']
        const table = [['2', '0', '1']]
        const preds = [isZero, isOne]
        expect(categorizeStringTable(table, cols, preds)).toEqual([{'0':'0', '1':'1'}])
    })

    test('handle inconsistent table width', () => {
        const cols = ['0', '1', '2']
        const table = [['2', '1', '0'], ['2', '1', '0'], ['2', '1', '0', '3']]
        const preds = [isZero, isOne, isTwo]
        expect(categorizeStringTable(table, cols, preds)).toEqual([{'0':'0', '1':'1', '2':'2'},{'0':'0', '1':'1', '2':'2'},{'0':'0', '1':'1', '2':'2'}])
    })

    test('column duplicate headers throws error', () => {
        const cols = ['0', '1', '1']
        const table = [['0', '1', '2'], ['0', '1', '2'], ['0', '1', '2']]
        const preds = [isZero, isOne, isTwo]
        expect(() => categorizeStringTable(table, cols, preds)).toThrow()
    })

    test('perfect columns are matched correctly', () => {
        const cols = ['0', '1', '2']
        const table = [['1', '2', '0'], ['1', '2', '0'], ['1', '2', '0']]
        const preds = [isZero, isOne, isTwo]
        const result = [{ '0': '0', '1': '1', '2': '2' }, { '0': '0', '1': '1', '2': '2' }, { '0': '0', '1': '1', '2': '2' }]
        expect(categorizeStringTable(table, cols, preds)).toEqual(result)
    })

    test('imperfect columns are matched correctly', () => {
        const cols = ['0', '1', '2']
        const table = [['1', '2', '0'], ['1', '2', '0'], ['2', '0', '1']]
        const preds = [isZero, isOne, isTwo]
        const result = [{ '0': '0', '1': '1', '2': '2' }, { '0': '0', '1': '1', '2': '2' }, { '0': '1', '1': '2', '2': '0' }]
        expect(categorizeStringTable(table, cols, preds)).toEqual(result)
    })

    test('specific and general columns are matched correctly', () => {
        const cols = ['0', '1', '10']
        const table = [['9', '0', '1'], ['4', '0', '1'], ['1', '0', '1']]
        const preds = [isZero, isOne, isBetween0to10]
        const result = [{ '0': '0', '1': '1', '10': '9' }, { '0': '0', '1': '1', '10': '4' }, { '0': '0', '1': '1', '10': '1' }]
        expect(categorizeStringTable(table, cols, preds)).toEqual(result)
    })
})

/**
 * Test for @method tableToObject
 */
describe('testing tableToObject method', () => {
    test('column too short throws an error', () => {
        const cols = ['a', 'b', 'c'];
        const data = [['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd']];
        expect(() => tableToObject(cols, data)).toThrow();
    })

    test('column too long throws an error', () => {
        const cols = ['a', 'b', 'c'];
        const data = [['a', 'b'], ['a', 'b'], ['a', 'b']];
        expect(() => tableToObject(cols, data)).toThrow();
    })

    test('column duplicate name throws an error', () => {
        const cols = ['a', 'c', 'c'];
        const data = [['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd']];
        expect(() => tableToObject(cols, data)).toThrow();
    })

    test('inconsistent table row length throws error', () => {
        const cols = ['a', 'b', 'c'];
        const data = [['a', 'b', 'c'], ['a', 'b', 'c', 'd'], ['a', 'b']];
        expect(() => tableToObject(cols, data)).toThrow();
    })

    test('parse data with only one row', () => {
        const cols = ['1', '2', '3']
        const data = [['a', 'b', 'c']]
        const expected = [{ '1': 'a', '2': 'b', '3': 'c' }]
        expect(tableToObject(cols, data)).toEqual(expected);
    })

    test('parse data with only multiple rows', () => {
        const cols = ['1', '2', '3']
        const data = [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']]
        const expected = [{ '1': 'a', '2': 'b', '3': 'c' }, { '1': 'd', '2': 'e', '3': 'f' }, { '1': 'g', '2': 'h', '3': 'i' }]
        expect(tableToObject(cols, data)).toEqual(expected);
    })

})