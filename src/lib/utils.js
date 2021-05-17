export function numberCompare(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
}

export function stringCompare(a, b) {
    return a === null || a === undefined || a === ""
        ? -1
        : b === null || b === undefined || b === ""
            ? 1
            : a.localeCompare(b);
}

export function getValueByDataIndex(record, dataIndex, level = 0) {
    if (typeof dataIndex === 'string') {
        return record[dataIndex];
    }
    if (dataIndex.length === level + 1) {
        return record[dataIndex[level]];
    } else {
        return getValueByDataIndex(record[dataIndex[level]], dataIndex, level + 1);
    }
}