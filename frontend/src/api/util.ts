import "isomorphic-fetch";

export interface RequestOptions {
    body: object | null;
    headers: object | null;
    method: string;
}

export type FetchFunction = (url: string, options: RequestOptions) => Promise<any>;

/**
 * Fetch JSON from a URL
 */
export async function fetchJSON(url: string, options: RequestOptions) {
    let newOptions = {};
    if (options) {
        newOptions = {
            method: options.method,
            body: options.body != null ? JSON.stringify(options.body) : null,
            headers: {
                ...options.headers,
                "Content-Type": "application/json; charset=utf-8",
            },
        };
    }
    const response = await fetch(url, newOptions);
    try {
        const content = await response.text();
        if (!response.ok) {
            throw Error("js.fetch.response.NotOK");
        }
        return content.length > 0 ? JSON.parse(content) : null;
    } catch (ex) {
        throw Error("js.fetch.response.json.InvalidJSON");
    }
}
