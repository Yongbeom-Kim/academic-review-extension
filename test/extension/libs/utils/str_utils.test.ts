import { findWordWithRadius } from "../../../../src/extension/libs/utils/str_utils";

/**
 * Test for @method findWordWithRadius
 */
describe('test findWordWithRadius', () => {
    test('empty source string', () => {
        expect(findWordWithRadius('word', '', 5)).toEqual([]);
    })
    test('no match', () => {
        const haystack = 'a b c d e f g h i j k l m n o p q r s t u v w x z y'
        expect(findWordWithRadius('ab', haystack, 5)).toEqual([]);
    })
    test('1 match', () => {
        const haystack = 'a b c d e f g h i j k l m n o p q r s t u v w x z y'
        expect(findWordWithRadius('g', haystack, 5)).toEqual(['b c d e f g h i j k l']);
    })
    test('3 match', () => {
        const haystack =
            'a b c d e f g h i j k l m n o p q r s t u v w x z y '
            + 'a b c d e f g h i j k l m n o p q r s t u v w x z y '
            + 'a b c d e f g h i j k l m n o p q r s t u v w x z y'
        expect(findWordWithRadius('g', haystack, 5)).toEqual(['b c d e f g h i j k l', 'b c d e f g h i j k l', 'b c d e f g h i j k l']);
    })
})