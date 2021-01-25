import React from 'react';
import { AllModules } from "ag-grid-enterprise";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { Row, Col, Button } from 'antd'
import { FilterOutlined, CloseOutlined } from '@ant-design/icons'
import './CubeViewer.css';

export default ({ index, rows, selectedKeys, clearFilters, deleteDimension, dimension, onSelectionChanged }) => {
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
    
    return <div style={{
        marginTop: 10,
        marginRight: 10
    }}>
        <Row>
            <Col><span style={{ fontSize: 16 }}>{dimension.title}</span></Col>
            <Col><Button shape="circle" type="text" icon={<FilterOutlined style={{ fontSize: '20px' }} />}
                title={'Очистить все фильтры'}
                onClick={clearFilters}>
                <CloseOutlined style={{ fontSize: 16, position: 'absolute', margin: '6px -10px' }} />
            </Button></Col>
            <Col><Button shape="circle" type="text"
                title={'Убрать измерение'}
                onClick={deleteDimension}>
                <CloseOutlined style={{ fontSize: 20 }} />
            </Button></Col>
        </Row>
        <Row>
            <div
                style={{
                    width: '400px',
                    height: '400px',
                    border: '1px solid gray'
                }}
                className="ag-theme-balham"
            >
                <AgGridReact
                    key={index}
                    columnDefs={dimension.columnDefs}
                    rowData={rows}
                    onRowDataChanged={rowDataChanged}
                    modules={AllModules}
                    rowSelection="multiple"
                    onSelectionChanged={onSelectionChanged}
                    rowClassRules={rowClassRules}
                >
                </AgGridReact>
            </div>
        </Row>
    </div>
};