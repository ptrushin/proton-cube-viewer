import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import { Button } from 'antd'

import { loadCubeData, loadCubeRows } from '../lib/CubeLoaderOdata'
import CubeViewer from "../lib/CubeViewer";

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
                    code: 'OrderID', hidden: true
                },
                {
                    code: 'CustomerID', title: 'By customers',
                    table: 'Customers',
                    columnDefs: [
                        { headerName: "CompanyName", field: "Label.CompanyName", sortable: true, filter: 'agTextColumnFilter', flex: 2 },
                        { headerName: "Count", field: "Cnt", sortable: true, width: 80, filter: null },
                        { headerName: "Freight", field: "Freight", sortable: true, width: 80, filter: null }
                    ]
                },
                {
                    code: 'EmployeeID', title: 'By employees',
                    table: 'Employees',
                    columnDefs: [
                        { headerName: "LastName", field: "Label.LastName", sortable: true, filter: 'agTextColumnFilter', flex: 2 },
                        { headerName: "Count", field: "Cnt", sortable: true, width: 80, filter: null },
                        { headerName: "Freight", field: "Freight", sortable: true, width: 80, filter: null }
                    ]
                }
            ],
            fieldDefs: [
                {code: 'Freight'},
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
        let filters = [];
        let addFilter = (filterName, urlName, keyType) => {
            const keyConv = (key, keyType) => keyType === 'string' ? `'${key}'` : key;
            if (!this.state.selectedKeys[filterName] || this.state.selectedKeys[filterName].length === 0) return;
            let f = this.state.selectedKeys[filterName].filter(f => f && f !== 0);
            if (f.length === 0) return;
            filters.push('(' + f.map(_ => `${urlName} eq ${keyConv(_, keyType)}`).join(' or ') + ')');
        }
        addFilter('CustomerID', 'CustomerID', 'string');
        addFilter('EmployeeID', 'EmployeeID');
        return `${this.odataPath}/${this.state.cubeDef.code}?$filter=${filters.join(' and ')}`;
    }

    render() {
        return <div style={{ padding: 10 }}>
            <CubeViewer cubeDef={this.state.cubeDef} cubeData={this.state.cubeData}
                onSelectionChanged={this.onSelectionChanged}
                additionalActions={[
                    <Button key="refresh" onClick={this.refresh}>Refresh</Button>,
                    <Button key="detailUrl" href={this.getDetailUrl()}>Show details</Button>
                ]}
                localStorageKey="ShipmentCube"
                localeText={{ configureDimensions: 'Configure dimensions', resetToDefault: 'Reset to default' }}
            />
        </div>
    }
}

export default withRouter(Example);