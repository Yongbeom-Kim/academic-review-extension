/**
 * Get all permutations of an array
 * Uses heap's algorithm, as seen here: https://en.wikipedia.org/wiki/Heap's_algorithm
 * @param arr array to permute
 * @returns an array of permutations of said array
 */
export function permute<T>(arr: T[]): T[][] {
    const permutations: T[][] = []
    function permute_helper(k: number, A: T[]) {
        if (k === 1) {
            permutations.push(Array.from(A))
        } else {
            permute_helper(k - 1, A)

            for (let i = 0; i < k - 1; i++) {
                if (k % 2 == 0) {
                    const temp = A[i]
                    A[i] = A[k - 1]
                    A[k - 1] = temp
                } else {
                    const temp = A[0]
                    A[0] = A[k - 1]
                    A[k - 1] = temp
                }
                permute_helper(k - 1, A)
            }
        }
    }
    permute_helper(arr.length, arr);
    return permutations;

}

export const test_export = { permute }