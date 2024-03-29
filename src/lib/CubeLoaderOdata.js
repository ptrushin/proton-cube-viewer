export function toKeyValueArray (rows, keyColumn) {
    let arr = {};
    for (let r of rows) {
        arr[r[keyColumn]] = r
    }
    return arr;
}

function get({url, callback}) {
    fetch(url)
        .then(response => response.json().then(data => callback(data)));
}

export function loadAll({url, callback, skip, top, count, rows}) {
    const urlSkip = skip ? skip : 0;
    const urlCount = !count ? '&$count=true' : '';
    get({
        url: `${url}&$skip=${urlSkip}${urlCount}`,
        callback: (data) => {
            if (!count) count = Number(data['@odata.count'])
            const length = data.value.length
            if ((urlSkip === 0 && length === count) 
                || (urlSkip > 0 && length < top)) {
                callback({value: (rows || []).concat(data.value)})
            } else {
                loadAll({
                    url,
                    callback,
                    skip: urlSkip + length,
                    top: length,
                    count: count,
                    rows: (rows || []).concat(data.value)
                }) 
            }
        }
    })
}

export function loadDimensionTables({odataPath, cubeDef, callback}) {
    for (let code of Object.keys(cubeDef.dimensionTableDefs)) {
        let dimensionTableDef = cubeDef.dimensionTableDefs[code];
        let select = [dimensionTableDef.keyColumn, ...dimensionTableDef.labelColumns];
        let order = dimensionTableDef.orderColumn || dimensionTableDef.labelColumns[0];
        loadAll({
            url: `${odataPath}/${code}?$select=${select.join(',')}&$orderby=${order}`,
            callback: (data) => {
                callback({ code, dimensionTableDef, rows: toKeyValueArray(data.value, dimensionTableDef.keyColumn)});
            }
        })
    }
}

export function loadDimensionTablesAll({odataPath, cubeDef, callback}) {
    let dimensionTables = {};
    let cnt = Object.keys(cubeDef.dimensionTableDefs).length;
    const singleCallback = ({code, rows}) => {
        dimensionTables[code] = rows;
        cnt--;
        if (cnt === 0) {
            callback({dimensionTables});
        }
    }
    loadDimensionTables({odataPath, cubeDef, callback: singleCallback});
}

export function loadCubeRows({odataPath, cubeDef, callback}) {
    const select = cubeDef.dimensionDefs.map(_ => _.code).concat(cubeDef.fieldDefs.filter(_ => !_.client).map(_ => _.code));
    loadAll({
        url: `${odataPath}/${cubeDef.code}?$select=${select.join(',')}`,
        callback: (data) => {
            callback({cubeRows: data.value})
        }
    })
}

export function loadCubeData({odataPath, cubeDef, callback}) {
    let isCubeRowsLoaded = false;
    let isDimensionTablesLoaded = false;
    let cubeData = {};
    const cb = ({cubeRows, dimensionTables}) => {
        if (cubeRows) {
            cubeData.cubeRows = cubeRows;
            isCubeRowsLoaded = true;
        }
        if (dimensionTables) {
            cubeData.dimensionTables = dimensionTables;
            isDimensionTablesLoaded = true;
        }
        if (isCubeRowsLoaded && isDimensionTablesLoaded) {
            callback({cubeData});
        }
    }
    loadDimensionTablesAll({odataPath, cubeDef, callback: cb});
    loadCubeRows({odataPath, cubeDef, callback: cb});
}

export function getOdataFilter({filters, specialNullCodes}) {
    const keyConv = (key) => typeof key === 'string' ? `'${key}'` : key;
    let result = [];
    const snc = specialNullCodes || [];
    for (let code in filters) {
        let values = filters[code];
        if (values && values.length) {
            let f = values.filter(_ => _ && snc.indexOf(_) < 0)
            if (f.length > 0) {
                result.push('(' + f.map(_ => `${code} eq ${keyConv(_)}`).join(' or ') + ')');
            }
        }
    }
    return result.join(' and ')
}