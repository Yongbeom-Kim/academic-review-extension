import { permute } from '../libs/utils/obj_utils';
import { cloneDeep, isEqual } from "lodash";
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

        if (new Set(headers).size != headers.length)
            throw new Error("Column headers cannot have duplicate");

        this.headers = headers;
        this.data = data;
        this.cols = headers.length;
        this.rows = data.length;
    }

    /**
     * Get an empty dataframe
     * @param headers headers for empty dataframe
     */
    static Empty<T>(headers: string[]): DataFrame<T> {
        return new DataFrame(headers, []);
    }
    /**
     * Create an "uneven" dataframe. Any data missing will be automatically filled in.
     * If there are insufficient headers, throws an error.
     * @param headers headers for the table
     * @param data data for the table
     * @returns a new DataFrame object.
     */
    static Uneven<T>(headers: string[], data: (T | undefined)[][]): DataFrame<T> {
        let max_width = headers.length;
        data.forEach(row => max_width = Math.max(max_width, row.length))
        if (max_width > headers.length)
            throw new Error('max width of data cannot be greater than header length')

        data.forEach(row => {
            while (row.length < max_width)
                row.push(DataFrame.EMPTY_CELL)
        })

        return new DataFrame(headers, data)
    }

    /**
     * Create a dataframe from an array of plain objects.
     * Headers will be the collective union of all keys.
     * Entries will be the values of each object (DataFrame.EMPTY_CELL if missing).
     * @param objects an array of plain objects to parse into a DataFrame.
     * @returns a DataFrame object.
     */
    static FromPlainObjectArray<T>(objects: Record<string, T | undefined>[]): DataFrame<T> {
        const columns: string[] = []
        objects.forEach(object => {
            Object.keys(object).forEach(key => {
                if (!columns.includes(key))
                    columns.push(key)
            })
        })

        const data = objects.map(object => {
            const row: (T | undefined)[] = []
            columns.forEach(column => {
                if (column in object)
                    row.push(object[column])
                else
                    row.push(this.EMPTY_CELL)
            })
            return row;
        })

        return new DataFrame(columns, data);
    }

    static EMPTY_CSV_CELL = '""';
    /**
     * Get a CSV representation of the target dataframe.
     * @returns a string
     */
    toCsvString(): string {
        const header_str = this.headers
            .map(header => header.replaceAll('"', '""'))
            .map(header => '"' + header + '"')
            .join(',')

        const body_str = this.data
            .map(row =>
                row.map(cell => {
                    if (cell === DataFrame.EMPTY_CELL) {
                        return DataFrame.EMPTY_CSV_CELL;
                    } else {
                        return '"' + (`${cell}`.replaceAll('"', '""')) + '"'
                    }
                }).join(',')
            ).join('\n')

        return header_str + '\n' + body_str;
    }

    /**
     * Get a JS Plain Object representation of the target dataframe
     * @returns a object
     */
    toPlainObjectArray(): Record<string, T | undefined>[] {
        const result: Record<string, T | undefined>[] = []
        this.data.forEach(row => {
            result.push({})
            row.forEach((cell, i) => {
                result.at(-1)![this.headers[i]] = cell;
            })
        })

        return result;
    }



    /*
        Dynamic column matching
    */
    /**
     * Automatically match column headers to table, given headers, data, and a set of predicate functions.
     * @param column_headers an array of column headers
     * @param data a 2-d array of data
     * @param column_header_predicates a plain object of headers mapped to predicate functions 
     */
    static AutoHeaders<T>(
        column_headers: string[],
        data: (T | undefined)[][],
        column_header_predicates: Record<string, ((arg0: T) => (boolean))>
    ): DataFrame<T> {
        let maxScore = 0;
        let best_match: DataFrame<T>;

        permute(column_headers).forEach(column_headers => {
            const df = DataFrame.Uneven(column_headers, data);
            const score = df.getTableMatchScore(column_header_predicates);
            if (score > maxScore) {
                best_match = df;
                maxScore = score;
            }
        })

        return best_match!;
    }

    /**
     * 
     * @param column_predicates 
     * @returns a float score between 0 and 1
     */
    private getTableMatchScore(column_predicates: Record<string, ((arg0: T) => (boolean))>): number {
        let matches = 0

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = this.data[i][j]
                if (cell === DataFrame.EMPTY_CELL)
                    continue

                if (column_predicates[this.headers[j]](cell))
                    matches++
            }
        }

        return matches * 1.0 / this.rows / this.cols;
    }

    /**
     * Get the fraction of columns that match a given predicate.
     * Empty column cells will always be false.
     * @param column_name name of column to test
     * @param predicate predicate for matching
     * @returns a number between 0 and 1.
     */
    getColumnMatchScore(column_name: string, predicate: (arg0: T) => boolean): number {
        const index = this.headers.indexOf(column_name);
        if (index === -1)
            throw new Error("Column name not found in table")

        let matches = 0;
        this.data.forEach((row) => {
            const data = row[index];
            if (typeof data !== 'undefined' && predicate(data))
                matches++;
        })

        return matches / this.rows;
    }

    /**
     * Get a shallow copy of the dataframe
     * @returns a copy of the dataframe
     */
    copy(): DataFrame<T> {
        // return new DataFrame(
        //     JSON.parse(JSON.stringify(this.headers)),
        //     JSON.parse(JSON.stringify(this.data)))
        return cloneDeep(this);
    }


    /**
     * Append an empty column to the dataframe
     * @param new_col column name to append
     */
    pushEmptyColumn(new_col: string): void {
        if (this.headers.includes(new_col))
            throw new Error("Column already exists")

        this.headers.push(new_col);
        this.data.forEach(row => {
            row.push(DataFrame.EMPTY_CELL)
        })

        this.calculate_dimensions();
    }

    /**
     * Pop a column in the dataframe by column name
     * @param col column name to remove
     */
    popColumn(col: string): void {
        if (!this.headers.includes(col))
            throw new Error("Column does not exist")

        const index = this.headers.indexOf(col);
        this.headers.splice(index, 1);

        this.data.forEach(row => {
            row.splice(index, 1)
        })

        this.calculate_dimensions();
    }

    /**
     * Reorder the columns target dataframe with the new headers provided.
     * If columns present are not in the new ordering, it is deleted.
     * IF columns in ordering is not inside the current df, a corresponding empty column is added.
     * Makes a copy (which is inefficient), but if it works it works. TODO
     * @param new_column_ordering array of headers to reorder by
     */
    reorderColumns(new_column_ordering: string[]): void {
        // add columns
        new_column_ordering.forEach((col) => {
            if (!this.headers.includes(col))
                this.pushEmptyColumn(col);
        })

        // remove columns
        for (let i = 0; i < this.cols; i++)
            if (!new_column_ordering.includes(this.headers[i])) {
                this.popColumn(this.headers[i]);
                i--;
            }

        const mapping: Record<number, number> = {}
        for (let i = 0; i < this.cols; i++) {
            mapping[i] = new_column_ordering.indexOf(this.headers[i])
        }

        const newData = this.copy().data // wasteful, but easy

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                newData[i][j] = DataFrame.EMPTY_CELL
            }
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                newData[i][mapping[j]] = this.data[i][j]
            }
        }

        this.data = newData;
        this.headers = new_column_ordering;
    }

    /**
     * Transform a column into another column of the dataframe.
     * Source column remains intact.
     * If destination column is not found in df, it is added.
     * Functions need to take into account any potential undefined values.
     * @param src_columns Array of source column header to transform.
     * @param column_dst Destination column header to transform.
     * @param fn function to transform src to dst.
     */
    transform(src_columns: string[], column_dst: string, fn: (...args: (T | undefined)[]) => (T | undefined)): void {
        const src_indexes = src_columns.map(col => this.headers.indexOf(col));

        src_indexes.forEach((index) => {
            if (index == -1)
                throw new Error("column name not in table")
        })

        let dst_index = this.headers.indexOf(column_dst);
        if (dst_index == -1) {
            this.pushEmptyColumn(column_dst)
            dst_index = this.headers.indexOf(column_dst);
        }

        this.data.forEach(row => {
            const args = src_indexes.map(i => row[i]);
            row[dst_index] = fn.apply(null, args)
        })
    }

    private calculate_dimensions() {
        this.cols = this.headers.length;
        this.rows = this.data.length;

        this.data.forEach(row => {
            if (row.length != this.cols)
                throw new Error("Inconsistent table width");
        })
    }

    getRow(i: number): (T | undefined)[] {
        return this.data[i]
    }

    getCol(col: string): (T | undefined)[] {
        const index = this.headers.indexOf(col);
        if (index === -1)
            throw new Error("Column not found")

        return this.data.map(row => row[index]);
    }

    pushRow(row: (T | undefined)[]) {
        if (row.length > this.cols)
            throw new Error("Row is too long")

        while (row.length < this.cols)
            row.push(DataFrame.EMPTY_CELL)

        this.data.push(row);
        this.calculate_dimensions();
    }

    /**
     * Test if 2 dataframes are equal.
     * @param df dataframe to compare
     * @returns a boolean on whetehr the dataframes are equal.
     */
    isEqual(df: DataFrame<T>) {
        const df_copy = df.copy();
        df_copy.reorderColumns(this.headers);

        return isEqual(this, df_copy)
    }

    selectRows(selected: boolean[]): DataFrame<T> {
        const new_df = DataFrame.Empty<T>(this.headers);

        for (let i = 0; i < this.rows; i++)
            if (selected[i])
                new_df.pushRow(this.data[i]);
        return new_df;
    }
}