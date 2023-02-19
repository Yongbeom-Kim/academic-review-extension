/**
 * Type to signify request to download a batch of PDFs from a certain url with a certain filename
 */
export type BatchDownloadPDFRequest = { msg: string, urls: string[], filenames: string[] }
export const BATCH_DOWNLOAD_REQUEST_MESSAGE = 'download_pdf' //msg field of above type

/**
 * Type to signify requests containing metadata of batch-downloaded PDFs
 * In some ways, this is a response to the batch-download PDF response.
 */
export type BatchDownloadPDFResponse = {msg: string, ids: number[], paths: string[]}
export const BATCH_DOWNLOAD_RESPONSE_MSG = 'download_pdf_done' //msg field of above type

/**
 * This refers to requests to messages that trigger the creation of a new tab go parse a given pdf file.
 */
export type ParsePDFRequest = {msg: string, filePath: string, from_tab_id?: number}
export const PARSE_PDF_REQUEST_MSG = 'parse_pdf' //msg field of above type

/**
 * This refers to requests to messages that trigger the creation of a new tab go parse a given pdf file.
 */
export type ParsePDFResponse = {msg: string, filePath: string, data: string} // placeholder data
export const PARSED_PDF_RESPONSE_MSG = 'parsed_pdf_data' //msg field of above type