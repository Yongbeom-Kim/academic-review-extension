/**
 * Converts an array of plain objects to csv format
 * Assumes that each field of the object array is a string (or likewise primitive)
 * @param oa object array to be converted
 * @returns csv string
 */
export function objArrayToCsv(oa: Record<any, any>[]): string {
    let headers = Object.keys(oa[0])
    console.log({ oa });

    let str = headers.map(x => `"${x}"`).join(",");
    str += "\n";
    str += oa
        .map(o => Object.values(o)
            .map(x => `${x}`.replaceAll('"', '""')) // Replace " with "" to avoid csv parse errors
            .map(x => x.length === 9 ? '' : '"' + x + '"')
            .join(','))
        .join('\n');

    console.log({ str });
    console.log(str);
    return str;
}