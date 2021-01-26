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
    const urlTop = top ? top : 100000;
    const urlSkip = skip ? skip : 0;
    const urlCount = !count ? '&$count=true' : '';
    get({
        url: `${url}&$skip=${urlSkip}&$top=${urlTop}${urlCount}`,
        callback: (data) => {
            if (!count) count = Number(data['@odata.count'])
            const length = data.value.length
            if ((urlSkip === 0 && length === count) 
                || (urlSkip > 0 && length < urlTop)) {
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
    const select = cubeDef.dimensionDefs.map(_ => _.code).concat(cubeDef.fieldDefs.map(_ => _.code));
    get({
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