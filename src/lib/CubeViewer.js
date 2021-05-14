import React, { useState, useMemo, useCallback } from "react";
import { Row, Space, Button, Popover } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import Dimension from './Dimension'
import SortableCheckboxGroup from './SortableCheckboxGroup'

const Table = require('olap-cube').model.Table
export const defaults = {
    Null: 0
}

export default ({ 
    cubeDef, 
    cubeData, 
    onSelectionChanged, 
    additionalActions, 
    localStorageKey, 
    localeText, 
    selectedKeys: extSelectedKeys,
    dimensionViewComponent
 }) => {
    if (!cubeDef || !cubeData || !cubeData.cubeRows || !cubeData.dimensionTables) return null;

    const dimensionDefMap = {};
    const dimensionDefNullMap = {};
    for (const dimensionDef of cubeDef.dimensionDefs) {
        dimensionDefMap[dimensionDef.code] = dimensionDef;
        dimensionDefNullMap[dimensionDef.code] = dimensionDef.null === undefined ? defaults.Null : dimensionDef.null;
    }
    const fieldDefNullMap = {};
    for (const fieldDef of cubeDef.fieldDefs) {
        dimensionDefNullMap[fieldDef.code] = fieldDef.null === undefined ? defaults.Null : fieldDef.null;
    }

    const initDimensionSettings = () => {
        let dimensionSettings = {}
        if (localStorageKey) {
            let str = localStorage.getItem(localStorageKey);
            if (str) {
                try {
                    dimensionSettings = JSON.parse(str);
                } catch(e) {
                }
            }
        }

        for (let dimensionDef of cubeDef.dimensionDefs) {
            if (dimensionDef.hidden) continue
            if (!dimensionSettings[dimensionDef.code]) {
                dimensionSettings[dimensionDef.code] = {
                    index: Object.keys(dimensionSettings).length,
                    visible: dimensionDef.visible !== undefined ? dimensionDef.visible : true
                }
            }
        }

        return dimensionSettings;
    }

    const initTableStructure = () => {
        return new Table({
            dimensions: cubeDef.dimensionDefs.map(_ => _.code),
            fields: cubeDef.fieldDefs.map(_ => _.code),
        })
    }

    const initTableRows = () => {
        const dimensions = cubeDef.dimensionDefs.map(_ => _.code);
        const fields = cubeDef.fieldDefs.map(_ => _.code);
        return tableStructure.addRows(
            {
                header: [...dimensions, ...fields],
                rows: cubeData.cubeRows.map(r => [...dimensions.map(name => r[name] || dimensionDefNullMap[name]), ...fields.map(name => r[name] || fieldDefNullMap[name])])
            }
        );
    }

    const extSetSelectedKeys = useCallback((newSelectedKeys, { dimensionCode, keys }) => {if (onSelectionChanged) onSelectionChanged({ selectedKeys: newSelectedKeys, dimensionCode, keys: keys });}, [onSelectionChanged]);

    const [selectedKeys, setSelectedKeys] = extSelectedKeys === undefined
        ? useState({})
        : [extSelectedKeys, extSetSelectedKeys];
      
    const [dimensionSettings, setDimensionSettings] = useState(initDimensionSettings);
    const tableStructure = useMemo(initTableStructure, [cubeDef]);
    const tableRows = useMemo(initTableRows, [cubeDef, cubeData]);

    const changeDimensionSettings = (dimensionSettings) => {
        setDimensionSettings(dimensionSettings);
        if (localStorageKey) {
            localStorage.setItem(localStorageKey, JSON.stringify(dimensionSettings))
        }
    }

    const selectionChanged = ({ dimensionCode, keys }) => {
        let dimensionsDef = dimensionDefMap[dimensionCode];
        if (!dimensionsDef) return;
        let currentKeys = selectedKeys[dimensionCode];
        let newKeys = keys.sort((a, b) => a - b);
        let isEqual = false;
        if (currentKeys && currentKeys.length === newKeys.length) {
            isEqual = true;
            for (let k in currentKeys) {
                if (currentKeys[k] !== newKeys[k]) {
                    isEqual = false;
                    break;
                }
            }
        }
        if (!isEqual) {
            const newSelectedKeys = { ...selectedKeys, [dimensionCode]: newKeys }
            setSelectedKeys(newSelectedKeys, { dimensionCode, keys });
            if (extSelectedKeys === undefined && onSelectionChanged) onSelectionChanged({ selectedKeys: newSelectedKeys, dimensionCode, keys: newKeys });
        }
    }

    const isVisibleDimension = (dimensionDef) => {
        return !dimensionDef.hidden && (dimensionSettings[dimensionDef.code] || {}).visible;
    }

    const getDimensionsRows = () => {
        const getRollupFunc = (measureDefs) => {
            const funcs = measureDefs.map((measureDef,i) => {
                let fieldCode = measureDef.fieldCode || measureDef.code
                let fieldIndex = cubeDef.fieldDefs.indexOf(cubeDef.fieldDefs.filter(_ => _.code === fieldCode)[0]);
                return measureDef.funcName === 'count'
                    ? (current, value) => [Number(current[i]) + 1]
                        : measureDef.funcName === 'sum'
                        ? (current, value) => [Number(current[i]) + value[fieldIndex]]
                            : measureDef.func;
            })
            return (current, value) => {
                let func = funcs.map(f => f(current, value));
                return func;
            }
        }
        let filterFunc = (point) => {
            for (const k of Object.entries(selectedKeys)) {
                const dimensionCode = k[0];
                const dimensionDef = dimensionDefMap[dimensionCode];
                if (!isVisibleDimension(dimensionDef)) continue;
                const keys = k[1];
                if (!keys || keys.length === 0) continue;
                const index = tableStructure.dimensions.indexOf(dimensionCode);
                if (keys.indexOf(point[index]) < 0) return false;
            }
            return true;
        }

        let label = (dimensionTable, key) => !key || key === 0 
            ? null 
            : dimensionTable 
                ? (dimensionTable[key] || '???') 
                : key;

        let compare = (values) => {
            for (var v of values) {
                let r = v[0] > v[1] ? 1 : v[0] < v[1] ? -1 : 0;
                if (v[2] === 'desc') r = r * -1;
                if (r !== 0) return r;
            }
            return 0;
        }

        let selectedFunc = (dimension, value) => selectedKeys[dimension] && selectedKeys[dimension].indexOf(value) >= 0;

        let sortFunc = (a, b) => compare([
            [a.UserSelected, b.UserSelected, 'desc'],
            [a.Selected, b.Selected, 'desc'],
            [a.Label, b.Label]
        ])

        let createRow = ({row, dimensionDef, dimensionTable, selected}) => {
            let dimensionCode = dimensionDef.code
            let result = { Value: row[0], Label: label(dimensionTable, row[0]), Selected: selected, UserSelected: selectedFunc(dimensionCode, row[0]) }
            let measureDefs = dimensionDef.measureDefs || cubeDef.measureDefs;
            for (let i in measureDefs) {
                result[measureDefs[i].code] = !selected ? 0 : (row[Number(i) + 1])[0]
            }
            return result;
        }

        let filteredTable = tableRows.dice(filterFunc)

        let getRowData = (dimensionDef, dimensionTable) => {
            const dimensionCode = dimensionDef.code
            const measureDefs = (dimensionDef.measureDefs || cubeDef.measureDefs)
            const measureDefsCodes = measureDefs.map(_ => _.code)
            const initialValue = measureDefsCodes.map(m => 0)
            let rollupFunc = getRollupFunc(measureDefs)
            let selected = filteredTable.rollup(dimensionCode, measureDefsCodes, rollupFunc, initialValue).rows.map(r => createRow({row: r, dimensionDef, dimensionTable, selected: true}));
            let selectedIndex = selected.map(r => r.Value);
            let others = tableRows.rollup(dimensionCode, measureDefsCodes, rollupFunc, initialValue).rows.filter(r => selectedIndex.indexOf(r[0]) < 0)
                .map(r => createRow({row: r, dimensionDef, dimensionTable, selected: false}));
            return [...selected, ...others].sort(sortFunc);
        }

        let dimensionsRows = {};

        for (let dimensionDef of cubeDef.dimensionDefs) {
            if (!isVisibleDimension(dimensionDef)) continue;
            dimensionsRows[dimensionDef.code] = getRowData(dimensionDef, cubeData.dimensionTables[dimensionDef.table]);
        }

        return dimensionsRows;
    }

    const dimensionsRows = useMemo(getDimensionsRows, [tableRows, selectedKeys, dimensionSettings])

    return <div className="proton-cube-viewer">
        <Row>
            <Space>
                <Popover trigger="click" content={
                    <Space direction="vertical">
                        <SortableCheckboxGroup items={cubeDef.dimensionDefs.filter(_ => !_.hidden).map(_ => ({code: _.code, title: _.title}))} itemSettings={dimensionSettings}
                            onChangeItemSettings={changeDimensionSettings}
                            localeText={localeText}
                        />
                        {localStorageKey ? <Button onClick={() => {localStorage.removeItem(localStorageKey); setDimensionSettings(initDimensionSettings())}}>{localeText.ResetToDefault}</Button> : null}
                    </Space>
                }>
                    <Button>
                        {localeText.ConfigureDimensions} <DownOutlined />
                    </Button>
                </Popover>
                {additionalActions}
            </Space>
        </Row>
        <Row>
            {cubeDef && cubeDef.dimensionDefs && cubeDef.dimensionDefs
                .filter(d => !d.hidden && dimensionSettings[d.code].visible)
                .sort((a, b) => dimensionSettings[a.code].index - dimensionSettings[b.code].index)
                .map((dimension, idx) => {
                    return <Dimension
                        dimensionViewComponent={dimensionViewComponent}
                        key={idx}
                        id={dimension.code}
                        index={idx}
                        rows={dimensionsRows[dimension.code]}
                        clearFilters={() => selectionChanged({ keys: [], dimensionCode: dimension.code })}
                        deleteDimension={() => changeDimensionSettings({...dimensionSettings, [dimension.code]: {...dimensionSettings[dimension.code], visible: false}})}
                        dimension={dimension}
                        selectedKeys={selectedKeys[dimension.code]}
                        onSelectionChanged={(keys) => selectionChanged({ dimensionCode: dimension.code, keys: keys })}
                    />
                })}
        </Row>
    </div>
}