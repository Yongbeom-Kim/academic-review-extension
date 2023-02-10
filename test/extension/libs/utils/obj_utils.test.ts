import { categorizeStringTable, tableToObject } from "../../../../src/extension/libs/utils/obj_utils";
import { expect, jest, test } from '@jest/globals';

// categorizeStringTable
// 
// tableToObject

/**
 * Test for @method tableToObject
 */

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
    const cols = ['1','2','3']
    const data = [['a','b','c']]
    const expected = [{'1': 'a', '2': 'b', '3': 'c'}]
    expect(tableToObject(cols, data)).toEqual(expected);
})

test('parse data with only multiple rows', () => {
    const cols = ['1','2','3']
    const data = [['a','b','c'],['d','e','f'],['g','h','i']]
    const expected = [{'1': 'a', '2': 'b', '3': 'c'},{'1': 'd', '2': 'e', '3': 'f'},{'1': 'g', '2': 'h', '3': 'i'}]
    expect(tableToObject(cols, data)).toEqual(expected);
})