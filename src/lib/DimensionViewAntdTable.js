import React from 'react';
import { Table } from 'antd'
import './CubeViewer.css';

export default ({ rows, selectedKeys, dimension, onSelectionChanged }) => {
    return <div className="proton-cube-viewer-antd">
        <Table
            columns={dimension.columnDefs}
            dataSource={rows}
            scroll={{ y: 400 }}
            pagination={false}
            size="small"
            rowKey="Value"
            rowSelection={{
                type: 'checkbox',
                selectedKeys,
                onChange: selectedKeys => onSelectionChanged(selectedKeys)
            }}
        />
    </div>
};