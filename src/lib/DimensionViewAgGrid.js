import React from 'react';
import { AllModules } from "ag-grid-enterprise";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import './CubeViewer.css';

export default ({ index, rows, selectedKeys, dimension, onSelectionChanged, keyName, selectedName }) => {
    const rowClassRules = {
        'unselected-row': params => params.data && !params.data[selectedName],
    };
    const getAllNodes = (api) => {
        let nodes = [];
        api.forEachNode(node => nodes.push(node));
        return nodes;
    }
    const rowDataChanged = (params) => {
        if (!selectedKeys) return;
        for (let node of getAllNodes(params.api)) {
            if (node.data && selectedKeys.indexOf(node.data[keyName]) >= 0) {
                node.setSelected(true);
            }
        }
    }

    return <div className="ag-theme-balham">
        <AgGridReact
            key={index}
            columnDefs={dimension.viewColumns}
            rowData={rows}
            onRowDataChanged={rowDataChanged}
            modules={AllModules}
            rowSelection="multiple"
            onSelectionChanged={(params) => onSelectionChanged(params.api.getSelectedRows().map(r => r[keyName]))}
            rowClassRules={rowClassRules}
        />
    </div>
};

export function initViewColumns({cubeDef, dimensionDef, localeText}) {
    if (!dimensionDef.columns) return;
    dimensionDef.viewColumns = [];
    for (let column of dimensionDef.columns) {
        let viewColumn = {...column};
        viewColumn.headerName = viewColumn.title;
        viewColumn.field = (typeof viewColumn.dataIndex === 'string') ? viewColumn.dataIndex : viewColumn.dataIndex.join('.');
        viewColumn.sortable = true;
        if (viewColumn.type === 'text') {
            viewColumn.filter = 'agTextColumnFilter';
        }
        if (viewColumn.type === 'float' || viewColumn.type === 'long') {
            viewColumn.width = 80;
            viewColumn.filter = null;
        }
        viewColumn = {...viewColumn, ...column};
        dimensionDef.viewColumns.push(viewColumn)
    }
}