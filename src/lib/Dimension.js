import React from 'react';
import { Row, Col, Button } from 'antd'
import { FilterOutlined, CloseOutlined } from '@ant-design/icons'
import './CubeViewer.css';

export default ({
    index, 
    rows, 
    selectedKeys, 
    clearFilters, 
    deleteDimension, 
    dimension, 
    onSelectionChanged,
    localeText,
    dimensionViewComponent: DimensionViewComponent,
    keyName,
    selectedName,
    allRows,
    cubeDef,
    cubeData
}) => {
    return <div style={{
        marginTop: 10,
        marginRight: 10
    }}>
        <Row>
            <Col><span style={{ fontSize: 16 }}>{dimension.title}</span></Col>
            <Col><Button shape="circle" type="text" icon={<FilterOutlined style={{ fontSize: '20px' }} />}
                title={localeText.ClearFilters}
                onClick={clearFilters}>
                <CloseOutlined style={{ fontSize: 16, position: 'absolute', margin: '6px -10px' }} />
            </Button></Col>
            <Col><Button shape="circle" type="text"
                title={localeText.ExcludeDimension}
                onClick={deleteDimension}>
                <CloseOutlined style={{ fontSize: 20 }} />
            </Button></Col>
        </Row>
        <Row>
            <div className="proton-cube-viewer-dimension">
                <DimensionViewComponent
                    index={index}
                    rows={rows}
                    clearFilters={clearFilters}
                    dimension={dimension}
                    selectedKeys={selectedKeys}
                    onSelectionChanged={onSelectionChanged}
                    localeText={localeText}
                    keyName={keyName}
                    selectedName={selectedName}
                    allRows={allRows}
                    cubeDef={cubeDef}
                    cubeData={cubeData}
                />
            </div>
        </Row>
    </div>
};