import { test_export } from "../../../../src/extension/libs/utils/obj_utils";
import { expect, jest, test } from '@jest/globals';

const { permute } = test_export;

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



