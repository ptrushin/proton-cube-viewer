import React from 'react';
import { AllModules } from "ag-grid-enterprise";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import './CubeViewer.css';

export default ({ index, rows, selectedKeys, dimension, onSelectionChanged }) => {
    const rowClassRules = {
        'unselected-row': params => params.data && !params.data.Selected,
    };
    const getAllNodes = (api) => {
        let nodes = [];
        api.forEachNode(node => nodes.push(node));
        return nodes;
    }
    const rowDataChanged = (params) => {
        if (!selectedKeys) return;
        for (let node of getAllNodes(params.api)) {
            if (node.data && selectedKeys.indexOf(node.data.Value) >= 0) {
                node.setSelected(true);
            }
        }
    }

    return <div className="ag-theme-balham">
        <AgGridReact
            key={index}
            columnDefs={dimension.columnDefs}
            rowData={rows}
            onRowDataChanged={rowDataChanged}
            modules={AllModules}
            rowSelection="multiple"
            onSelectionChanged={(params) => onSelectionChanged(params.api.getSelectedRows().map(r => r.Value))}
            rowClassRules={rowClassRules}
        />
    </div>
};