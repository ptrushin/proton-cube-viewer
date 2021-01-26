import React, { useState } from "react";
import { Row, Space, Button, Popover } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import Dimension from './Dimension'
import SortableCheckboxGroup from './SortableCheckboxGroup'

const Table = require('olap-cube').model.Table

export default ({ cubeDef, cubeData, onSelectionChanged, additionalActions, localStorageKey, localeText }) => {
    const initDimensionSettings = () => {
        if (localStorageKey) {
            let str = localStorage.getItem(localStorageKey);
            if (str) {
                try {
                    return JSON.parse(str);
                } catch(e) {
                }
            }
        }

        let result = {}
        let index = 0;
        for (let dimensionDef of cubeDef.dimensionDefs) {
            if (dimensionDef.hidden) continue
            result[dimensionDef.code] = {
                index: Number(index),
                visible: true
            }
            index++
        }

        return result;
    }

    const [selectedKeys, setSelectedKeys] = useState({});
    const [dimensionSettings, setDimensionSettings] = useState(initDimensionSettings());

    if (!cubeData || !cubeData.cubeRows) return null;

    const changeDimensionSettings = (dimensionSettings) => {
        setDimensionSettings(dimensionSettings);
        if (localStorageKey) {
            localStorage.setItem(localStorageKey, JSON.stringify(dimensionSettings))
        }
    }

    const selectionChanged = ({ dimensionCode, keys }) => {
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
            setSelectedKeys(newSelectedKeys);
            if (onSelectionChanged) onSelectionChanged({ selectedKeys: newSelectedKeys, dimensionCode, keys: newKeys });
        }
    }

    const getDimensionsRows = () => {
        const table = new Table({
            dimensions: cubeDef.dimensionDefs.map(_ => _.code),
            fields: cubeDef.fieldDefs.map(_ => _.code),
        })
        let table1 = table.addRows(
            {
                header: [...table.dimensions, ...table.fields],
                rows: cubeData.cubeRows.map(r => [...table.dimensions, ...table.fields].map(name => r[name] || 0))
            }
        );
        const getRollupFunc = (dimensionDef) => {
            const measureDefs = dimensionDef.measureDefs || cubeDef.measureDefs
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
                let a = funcs.map(f => f(current, value));
                return a;
            }
        }
        let getFilterFunc = (dimensionDef) => {
            return (point) => {
                for (const k of Object.entries(selectedKeys)) {
                    const dimension = k[0];
                    const keys = k[1];
                    if (!keys || keys.length === 0) continue;
                    const index = table.dimensions.indexOf(dimension);
                    if (keys.indexOf(point[index]) < 0) return false;
                }
                return true;
            }
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

        let getRowData = (dimensionDef, dimensionTable) => {
            let dimensionCode = dimensionDef.code
            let table2 = table1.dice(getFilterFunc(dimensionDef))
            let measures = (dimensionDef.measureDefs || cubeDef.measureDefs).map(_ => _.code)
            const initialValue = measures.map(m => 0)
            let rollupFunc = getRollupFunc(dimensionDef)
            let selected = table2.rollup(dimensionCode, measures, rollupFunc, initialValue).rows.map(r => createRow({row: r, dimensionDef, dimensionTable, selected: true}));
            let selectedIndex = selected.map(r => r.Value);
            let others = table1.rollup(dimensionCode, measures, rollupFunc, initialValue).rows.filter(r => selectedIndex.indexOf(r[0]) < 0)
                .map(r => createRow({row: r, dimensionDef, dimensionTable, selected: false}));
            return [...selected, ...others].sort(sortFunc);
        }

        let dimensionsRows = {};

        for (let dimensionDef of cubeDef.dimensionDefs) {
            dimensionsRows[dimensionDef.code] = getRowData(dimensionDef, cubeData.dimensionTables[dimensionDef.table]);
        }

        return dimensionsRows;
    }

    let dimensionsRows = getDimensionsRows();

    return <div>
        <Row>
            <Space>
                <Popover trigger="click" content={
                    <Space direction="vertical">
                        <SortableCheckboxGroup items={cubeDef.dimensionDefs.filter(_ => !_.hidden).map(_ => ({code: _.code, title: _.title}))} itemSettings={dimensionSettings}
                            onChangeItemSettings={changeDimensionSettings}
                        />
                        {localStorageKey ? <Button onClick={() => {localStorage.removeItem(localStorageKey); setDimensionSettings(initDimensionSettings())}}>{localeText.resetToDefault}</Button> : null}
                    </Space>
                }>
                    <Button>
                        {localeText.configureDimensions} <DownOutlined />
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
                        key={idx}
                        id={dimension.code}
                        index={idx}
                        rows={dimensionsRows[dimension.code]}
                        clearFilters={() => setSelectedKeys({ ...selectedKeys, [dimension.code]: null })}
                        deleteDimension={() => changeDimensionSettings({...dimensionSettings, [dimension.code]: {...dimensionSettings[dimension.code], visible: false}})}
                        dimension={dimension}
                        selectedKeys={selectedKeys[dimension.code]}
                        onSelectionChanged={(params) => selectionChanged({ dimensionCode: dimension.code, keys: params.api.getSelectedRows().map(r => r.Value) })}
                    />
                })}
        </Row>
    </div>
}