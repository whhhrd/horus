import "isomorphic-fetch";
import { APIError } from "./constants";

export interface RequestOptions {
    body: object | null;
    headers: object | null;
    method: string;
}

export type FetchFunction = (
    url: string,
    options: RequestOptions,
) => Promise<any>;

/**
 * Fetch JSON from a URL
 */
export async function fetchJSON(
    url: string,
    options: RequestOptions,
    isJSON: boolean = true,
) {
    let newOptions = {};
    if (options) {
        const headers = { ...options.headers };
        if (isJSON) {
            // @ts-ignore
            headers["Content-Type"] = "application/json; charset=utf-8";
        }
        newOptions = {
            method: options.method,
            body:
                options.body != null
                    ? isJSON
                        ? JSON.stringify(options.body)
                        : options.body
                    : null,
            headers,
        };
    }
    const response = await fetch(url, newOptions);
    const content = await response.text();
    const contentJson = content.length > 0 ? JSON.parse(content) : null;

    if (!response.ok) {
        throw new APIError(
            contentJson != null
                ? contentJson.message
                : "An unknown error occured.",
            response.status,
        );
    }
    return contentJson;
}

/**
 * Fetch JSON from a URL from Form Data request
 */
export async function fetchJSONFromForm(url: string, options: RequestOptions) {
    return fetchJSON(url, options, false);
}
