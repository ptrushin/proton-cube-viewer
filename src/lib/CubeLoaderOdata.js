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

export function loadDimensionTables({odataPath, cubeDef, callback}) {
    for (let code of Object.keys(cubeDef.dimensionTableDefs)) {
        let dimensionTableDef = cubeDef.dimensionTableDefs[code];
        let select = [dimensionTableDef.keyColumn, ...dimensionTableDef.labelColumns];
        let order = dimensionTableDef.orderColumn || dimensionTableDef.labelColumns[0];
        get({
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
    get({
        url: `${odataPath}/${cubeDef.code}`,
        callback: (data) => {
            callback({cubeRows: data.value.map(v => ({...v, Cnt: 1}))})
            //callback({cubeRows: data.value})
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