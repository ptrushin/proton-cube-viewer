import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import { Button } from 'antd'

import { loadCubeData, loadCubeRows, getOdataFilter } from '../lib/CubeLoaderOdata'
import CubeViewer from "../lib/CubeViewer";

import DimensionViewAntdTable from '../lib/DimensionViewAntdTable'
import AntdTableContainsFilter from '../lib/AntdTableContainsFilter'

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
                    code: 'OrderID', hidden: true
                },
                {
                    code: 'CustomerID', title: 'By customers',
                    table: 'Customers',
                    columnDefs: [
                        {
                            title: 'CompanyName', dataIndex: ['Label', 'CompanyName'],
                            sorter: (a, b) => a.Label.CompanyName.localeCompare(b.Label.CompanyName),
                            ...AntdTableContainsFilter(['Label', 'CompanyName']),
                        },
                        { title: 'Count', dataIndex: 'Cnt', align: 'right', width: 80 },
                        { title: 'Freight', dataIndex: 'Freight', align: 'right', width: 80 },
                    ]
                },
                {
                    code: 'EmployeeID', title: 'By employees',
                    table: 'Employees',
                    columnDefs: [
                        {
                            title: "LastName", dataIndex: ['Label', 'LastName'],
                            sorter: (a, b) => a.Label.CompanyName.localeCompare(b.Label.CompanyName),
                            ...AntdTableContainsFilter(['Label', 'CompanyName'])
                        },
                        { title: "Count", dataIndex: "Cnt" },
                        { title: "Freight", dataIndex: "Freight" }
                    ]
                }
            ],
            fieldDefs: [
                { code: 'Freight' },
            ],
            measureDefs: [
                { code: 'Cnt', funcName: 'count' },
                { code: 'Freight', funcName: 'sum'/*, fieldCode: 'Freight'*/ }
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
                    localeText={{
                        ConfigureDimensions: 'Configure dimensions',
                        ResetToDefault: 'Reset to default',
                        All: 'All'
                    }}
                    dimensionViewComponent1={DimensionViewAntdTable}
                />
            </div>
        </>
    }
}

export default withRouter(Example);