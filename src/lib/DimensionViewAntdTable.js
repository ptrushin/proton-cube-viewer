import React from 'react';
import { Table } from 'antd'
import './CubeViewer.css';
import { ContextFilter, stringSorter, numberSorter } from './AntdTableExt';

export default ({ rows, selectedKeys, dimension, onSelectionChanged, localeText, keyName, selectedName }) => {
    return <div className="proton-cube-viewer-antd">
        <Table
            rowClassName={(record, index) => !record[selectedName] ? 'unselected-row' : undefined}
            columns={dimension.viewColumns}
            dataSource={rows}
            scroll={{ y: 400 }}
            pagination={false}
            size="small"
            rowKey={keyName}
            rowSelection={{
                type: 'checkbox',
                selectedRowKeys: selectedKeys,
                onChange: selectedKeys => onSelectionChanged(selectedKeys)
            }}
        />
    </div>
};

export function initViewColumns({cubeDef, dimensionDef, localeText}) {
    if (!dimensionDef.columns) return;
    dimensionDef.viewColumns = [];
    for (let column of dimensionDef.columns) {
        let viewColumn = {...column};
        if (viewColumn.type === 'text') {
            viewColumn.sorter = (a, b) => stringSorter(a, b, viewColumn.dataIndex);
            viewColumn = {...viewColumn, ...ContextFilter(viewColumn.dataIndex, localeText)};
        }
        if (viewColumn.type === 'float' || viewColumn.type === 'long') {
            viewColumn.sorter = (a, b) => numberSorter(a, b, viewColumn.dataIndex);
            viewColumn.align = 'right';
            viewColumn.width = 80;
        }
        if (viewColumn.type === 'float') {
            viewColumn.render = v => v.toFixed(2);
        }
        viewColumn = {...viewColumn, ...column};
        dimensionDef.viewColumns.push(viewColumn)
    }
}