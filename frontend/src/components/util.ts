import queryString from "query-string";

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
export const randomColor = (courseName: string) => {
    return palette[
        Array.from(courseName)
            .map((char: string) => char.charCodeAt(0))
            .reduce((curr: number, next: number) => curr + next) %
            palette.length
    ];
};

/**
 * Transforms a date object into a user friendly date string.
 * @param date the date to be transformed
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

    // Debugging purposes
    // console.log("======");
    // console.log("Current date: ", new Date().toString());
    // console.log("Handled date: ", date.toString());

    // console.log("Time diff: ", timeDiff);
    // console.log("Year diff: ", yearDiff);

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
                return `${name}=${value}`;
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
 * If the value is empty, remove the property from the object.
 * @param currentQuery The current query properties.
 * @param name The name/key of the desired replaced/added/deleted property.
 * @param value The value.
 */
export const replaceQueryParam = (
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

export const getFilterParam = (search: string, key: string) => {
    return queryString.parse(search)[key];
};
