/**
 * A DataFrame class - an abstraction of a table of data with headers.
 */
export class DataFrame<T> {
    static EMPTY_CELL = undefined;

    cols: number;
    rows: number;
    headers: string[];
    data: (T | undefined)[][];

    constructor(headers: string[], data: (T | undefined)[][]) {
        for (let i = 0; i < data.length; i++)
            if (headers.length !== data[i].length)
                throw new Error("headers and data width is inconsistent");

        this.headers = headers;
        this.data = data;
        this.cols = headers.length;
        this.rows = data.length;
    }

    /**
     * Create an "uneven" dataframe. Any data missing will be automatically filled in.
     * If there are insufficient headers, throws an error.
     * @param headers headers for the table
     * @param data data for the table
     */
    static CreateUnevenDF<T>(headers: string[], data: (T | undefined)[][]): DataFrame<T> {
        let max_width = headers.length;
        data.forEach(row => max_width = Math.max(max_width, row.length))
        if (max_width > headers.length)
            throw new Error('max width of data cannot be greater than header length')
        
        data.forEach(row => {
            while(row.length < max_width)
                row.push(DataFrame.EMPTY_CELL)
        })

        return new DataFrame(headers, data)
    }


}