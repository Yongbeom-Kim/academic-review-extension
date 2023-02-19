/**
 * Download a csv string in the browser
 * @param csv_string a valid CSV string.
 */
export function exportCSV(csv_string: string) {
    window.open("data:text/csv;charset=utf-8," + encodeURIComponent(csv_string));
}