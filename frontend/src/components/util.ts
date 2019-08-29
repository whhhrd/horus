import queryString from "query-string";

// Colours used in components like the CanvasCard
const palette: string[] = [
    "#D32F2F",
    "#C2185B",
    "#7B1FA2",
    "#512DA8",
    "#303F9F",
    "#1976D2",
    "#0097A7",
    "#00796B",
    "#388E3C",
    "#FBC02D",
    "#FFA000",
    "#F57C00",
    "#E64A19",
];

const months: string[] = [
    "Jan.",
    "Feb.",
    "Mar.",
    "Apr.",
    "May",
    "June",
    "July",
    "Aug.",
    "Sept.",
    "Oct.",
    "Nov.",
    "Dec.",
];

const progressGradient = [
    "#F8D7DA",
    "#F8D9D8",
    "#F9DCD7",
    "#FADFD6",
    "#FAE2D4",
    "#FBE5D3",
    "#FCE7D2",
    "#FCEAD0",
    "#FDEDCF",
    "#FEF0CE",
    "#FFF3CD",
    "#FAF2CE",
    "#F6F1CF",
    "#F2F1D0",
    "#EDF0D2",
    "#E9F0D3",
    "#E5EFD4",
    "#E0EED6",
    "#DCEED7",
    "#D8EDD8",
    "#D4EDDA",
];
const progressBorderGradient = [
    "#DC3545",
    "#DF433E",
    "#E35138",
    "#E65F32",
    "#EA6D2C",
    "#ED7B26",
    "#F1891F",
    "#F49719",
    "#F8A513",
    "#FBB30D",
    "#FFC107",
    "#E9BE0D",
    "#D4BB13",
    "#BEB919",
    "#A9B61F",
    "#93B426",
    "#7EB12C",
    "#68AE32",
    "#53AC38",
    "#3DA93E",
    "#28A745",
];
const progressTextGradient = [
    "#721C24",
    "#732320",
    "#752A1D",
    "#77311A",
    "#793817",
    "#7B4014",
    "#7D4710",
    "#7F4E0D",
    "#81550A",
    "#835C07",
    "#856404",
    "#796207",
    "#6E610A",
    "#63600D",
    "#585E10",
    "#4D5D14",
    "#415C17",
    "#365A1A",
    "#2B591D",
    "#205820",
    "#155724",
];

/**
 * Returns a backgorund colour, border colour and text colour based on based
 * on the progress given. The gradient is as follows:
 * progress = 0: red
 * progress = 50: yellow
 * progress = 100: green
 * The colours used are hardcoded gradients, manually copy pasted from
 * http://www.perbang.dk/rgbgradient/.
 * @param progress A decimal value from 0 to 100, indicating the progress.
 */
export const gradientColor = (progress: number) => {
    const colorIndex = Math.floor(
        (progress / 100) * (progressGradient.length - 1),
    );
    const backgroundColor = progressGradient[colorIndex];
    const borderColor = progressBorderGradient[colorIndex];
    const color = progressTextGradient[colorIndex];

    return { backgroundColor, borderColor, color };
};

/**
 * Returns a random color from the 'palette' based on the
 * provided seed.
 */
export const randomColor = (seed: string) => {
    return palette[
        Array.from(seed)
            .map((char: string) => char.charCodeAt(0))
            .reduce((curr: number, next: number) => curr + next) %
            palette.length
    ];
};

/**
 * Transforms a date object into a user friendly date string.
 * NOTE: Not perfect! Use moment.js in the future.
 * @param date The date to be transformed.
 */
export const getDisplayedDate = (date: Date) => {
    const currentDate: Date = new Date();
    const timeDiff = currentDate.getTime() - date.getTime();
    const yearDiff = Math.floor(timeDiff / (1000 * 3600 * 24 * 365));

    const isToday =
        date.getDate() === currentDate.getDate() &&
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear();

    const yesterday = new Date(currentDate.getTime());
    yesterday.setDate(yesterday.getDate() - 1);

    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

    let dateString = "";

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeString = `${hours}:${minutes < 10 ? "0" + minutes : minutes}`;

    if (isToday) {
        dateString = "today";
    } else if (isYesterday) {
        dateString = "yesterday";
    } else {
        dateString = `on ${date.getDate()} ${months[date.getMonth()]}`;
    }

    if (yearDiff > 0) {
        dateString += ` ${date.getFullYear()}`;
    }

    return `${dateString} at ${timeString}`;
};

/**
 * Converts an object to a query string.
 * @param queryObject The object to be converted to a query string.
 */
export const objectToQueryString = (queryObject: object) => {
    const resultingQueryString = Object.entries(queryObject)
        .map(([name, value]) => {
            if (Array.isArray(value)) {
                const arrayFiltered = value.filter((arrayVal) => !!arrayVal);
                if (arrayFiltered.length > 0) {
                    return `${name}=${value
                        .filter((arrayVal) => !!arrayVal)
                        .map((arrayVal) => `${arrayVal}`)
                        .join(",")}`;
                } else {
                    return null;
                }
            } else if (value != null) {
                return `${name}=${encodeURIComponent(value)}`;
            } else {
                return null;
            }
        })
        .filter((e) => !!e)
        .join("&");
    if (resultingQueryString !== "") {
        return `?${resultingQueryString}`;
    } else {
        return "";
    }
};

/**
 * Replaces the indicated query parameter with the given value. If the
 * property of the indicated name does not exist, then it adds it.
 * @param currentQuery The current query properties.
 * @param name The name/key of the desired replaced/added property.
 * @param value The value.
 */
export const addReplaceQueryParam = (
    currentQuery: queryString.ParsedQuery,
    name: string,
    value: any,
) => {
    const newQuery: any = {};

    // tslint:disable-next-line: forin
    Object.keys(currentQuery).forEach((key) => {
        const val = currentQuery[key];
        if (key === name) {
            newQuery[key] = value;
        } else {
            newQuery[key] = val;
        }
    });

    if (newQuery[name] == undefined) {
        newQuery[name] = value;
    }

    return newQuery;
};

/**
 * Removes a query parameter from the query properties if it exists.
 * @param currentQuery The current query properties.
 * @param name The name/key of the to-be-deleted property.
 */
export const removeQueryParam = (
    currentQuery: queryString.ParsedQuery,
    name: string,
) => {
    const newQuery: any = Object.assign({}, currentQuery);

    // tslint:disable-next-line: forin
    Object.keys(currentQuery).forEach((key) => {
        if (key === name) {
            newQuery[key] = undefined;
        }
    });

    return newQuery;
};

/**
 * Transforms a query property in a list of numbers.
 * @param search The search parameters from the URL.
 * @param key The identifier of the query property.
 */
export const getListFromQuery = (search: string, key: string) => {
    const queryList = queryString.parse(search)[key];

    if (queryList != null) {
        return queryList
            .toString()
            .split(",")
            .map((s) => Number(s));
    } else {
        return [];
    }
};

/**
 * Checks if two lists of primitive types are equal (order does not matter).
 */
export const arraysEqual = (a: any[], b: any[]) => {
    if (a === b) {
        return true;
    }

    if (a == null || b == null) {
        return false;
    }

    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
};

/**
 * Retrieves the 'string' value of the desired query parameter.
 * @param search The search parameters from the URL.
 * @param key The key of the desired query parameter.
 */
export const getFilterParam = (search: string, key: string) => {
    return queryString.parse(search)[key];
};

/**
 * Retrieves all found matches in of a regular expression in a string.
 * @param regex The regular expression.
 * @param str The string.
 */
export const findAllMatches = (regex: RegExp, str: string): RegExpExecArray[] => {
    const matches = [];
    let matchArr: RegExpExecArray | null;
    // tslint:disable-next-line: no-conditional-assignment
    while ((matchArr = regex.exec(str)) !== null) {
        matches.push(matchArr);
    }
    return matches;
};
