import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import { Button } from 'antd'

import { loadCubeData, loadCubeRows, getOdataFilter } from '../lib/CubeLoaderOdata'
import CubeViewer from "../lib/CubeViewer";
import Custom from './Custom'

const localeText={
    ConfigureDimensions: 'Configure dimensions',
    ResetToDefault: 'Reset to default',
    All: 'All',
    ClearFilters: 'Clear filters',
    ExcludeDimension: 'Exclude dimension',
    Search: 'Search',
    Reset: 'Reset'
};
export class Example extends PureComponent {
    odataPath = 'https://services.odata.org/V4/Northwind/Northwind.svc';
    state = {
        cubeDef: {
            code: 'Orders',
            dimensionTableDefs: {
                'Customers': {
                    keyColumn: 'CustomerID',
                    labelColumns: ['CompanyName']
                },
                'Employees': {
                    keyColumn: 'EmployeeID',
                    labelColumns: ['LastName']
                }
            },
            dimensionDefs: [
                {
                    // needs to identity
                    code: 'OrderID'
                },
                {
                    code: 'CustomerID',
                    table: 'Customers'
                },
                {
                    code: 'EmployeeID',
                    table: 'Employees'
                }
            ],
            fieldDefs: [
                { code: 'Freight' },
            ],
            measureDefs: [
                { code: 'Cnt', funcName: 'count' },
                { code: 'Freight', funcName: 'sum'/*, fieldCode: 'Freight'*/ }
            ],
            widgetDefs: [
                {
                    code: 'CustomerID', title: 'By customers',
                    table: 'Customers',
                    columns: [
                        { title: 'CompanyName', dataIndex: 'CompanyName', type: 'text' },
                        { title: 'Count', dataIndex: 'Cnt', type: 'long' },
                        { title: 'Freight', dataIndex: 'Freight', type: 'float' },
                    ]
                },
                {
                    code: 'EmployeeID', title: 'By employees',
                    table: 'Employees',
                    columns: [
                        { title: "LastName", dataIndex: 'LastName', type: 'text' },
                        { title: "Count", dataIndex: "Cnt", type: 'long' },
                        { title: "Freight", dataIndex: "Freight", type: 'float' }
                    ]
                },
                {
                    code: 'EmployeeIDByChart', title: 'By employees Chart',
                    dimensionCode: 'EmployeeID',
                    table: 'Employees',
                    type: 'chart',
                    columns: [
                        { title: "LastName", dataIndex: 'LastName', type: 'text' },
                        { title: "Count", dataIndex: "Cnt", type: 'long' },
                        { title: "Freight", dataIndex: "Freight", type: 'float' }
                    ]
                },
                {
                    code: 'custom', title: 'Custom',
                    dimensionCode: 'EmployeeID',
                    table: 'Employees',
                    type: Custom,
                    columns: [
                        { title: "LastName", dataIndex: 'LastName', type: 'text' },
                        { title: "Count", dataIndex: "Cnt", type: 'long' },
                        { title: "Freight", dataIndex: "Freight", type: 'float' }
                    ]
                }
            ]
        },
        cubeData: {
        },
        selectedKeys: {}
    }

    componentDidMount() {
        this.setState({ isProcessing: true });
        loadCubeData({
            odataPath: this.odataPath,
            cubeDef: this.state.cubeDef,
            callback: ({ cubeData }) => {
                this.setState({
                    cubeData: {
                        ...this.state.cubeData,
                        dimensionTables: { ...this.state.cubeData.dimensionTables, ...cubeData.dimensionTables },
                        cubeRows: cubeData.cubeRows
                    },
                    isProcessing: false
                });
            }
        })
    }

    refresh = () => {
        this.setState({ isProcessing: true });
        loadCubeRows({
            odataPath: this.odataPath,
            cubeDef: this.state.cubeDef,
            callback: ({ cubeRows }) => {
                this.setState({
                    cubeData: {
                        ...this.state.cubeData,
                        cubeRows: cubeRows
                    }
                });
                this.setState({ isProcessing: false });
            }
        })
    }

    onSelectionChanged = ({ selectedKeys }) => {
        this.setState({ selectedKeys: { ...selectedKeys } })
    }

    getDetailUrl = () => {
        const filter = getOdataFilter({ filters: this.state.selectedKeys, specialNullCodes: [0] })
        return `${this.odataPath}/${this.state.cubeDef.code}${filter ? `?$filter=${filter}` : ''}`;
    }

    render() {
        return <>
            <div style={{ padding: 10 }}>
                <CubeViewer cubeDef={this.state.cubeDef} cubeData={this.state.cubeData}
                    onSelectionChanged={this.onSelectionChanged}
                    additionalActions={[
                        <Button key="refresh" onClick={this.refresh}>Refresh</Button>,
                        <Button key="detailUrl" href={this.getDetailUrl()}>Show details</Button>
                    ]}
                    localStorageKey="ShipmentCube"
                    localeText={localeText}
                    isProcessing={this.state.isProcessing}
                />
            </div>
        </>
    }
}

export default withRouter(Example);