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
        for (let i in cubeDef.dimensionDefs) {
            let dimensionDef = cubeDef.dimensionDefs[i]
            result[dimensionDef.code] = {
                index: Number(i),
                visible: true
            }
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
        const summation = (sum, value) => {
            return [sum[0] + value[0]]
        }
        const initialValue = [0]
        let filterFunc = (point) => {
            for (const k of Object.entries(selectedKeys)) {
                const dimension = k[0];
                const keys = k[1];
                if (!keys || keys.length === 0) continue;
                const index = table.dimensions.indexOf(dimension);
                if (keys.indexOf(point[index]) < 0) return false;
            }
            return true;
        }

        let label = (dimensionTable, key) => !key || key === 0 ? null : (dimensionTable[key] || '???');

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

        let getRowData = (dimensionCode, dimensionTable) => {
            let table2 = table1.dice(filterFunc)
            let selected = table2.rollup(dimensionCode, ['Cnt'], summation, initialValue).rows.map(r => { return { Value: r[0], Label: label(dimensionTable, r[0]), Cnt: r[1], Selected: true, UserSelected: selectedFunc(dimensionCode, r[0]) } });
            let selectedIndex = selected.map(r => r.Value);
            let others = table1.rollup(dimensionCode, ['Cnt'], summation, initialValue).rows.filter(r => selectedIndex.indexOf(r[0]) < 0)
                .map(r => { return { Value: r[0], Label: label(dimensionTable, r[0]), Cnt: 0, Selected: false, UserSelected: selectedFunc(dimensionCode, r[0]) } });
            return [...selected, ...others].sort(sortFunc);
        }

        let dimensionsRows = {};

        for (let dimensionDef of cubeDef.dimensionDefs) {
            dimensionsRows[dimensionDef.code] = getRowData(dimensionDef.code, cubeData.dimensionTables[dimensionDef.table]);
        }

        return dimensionsRows;
    }

    let dimensionsRows = getDimensionsRows();

    return <div>
        <Row>
            <Space>
                <Popover trigger="click" content={
                    <SortableCheckboxGroup items={cubeDef.dimensionDefs.map(_ => ({code: _.code, title: _.title}))} itemSettings={dimensionSettings}
                        onChangeItemSettings={changeDimensionSettings}
                    />
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
                .filter(d => dimensionSettings[d.code].visible)
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