import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import { Button } from 'antd'

import { loadCubeData, loadCubeRows } from '../lib/CubeLoaderOdata'
import CubeViewer from "../lib/CubeViewer";

export class Example extends PureComponent {
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
            odataPath: 'https://services.odata.org/V4/Northwind/Northwind.svc',
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
            odataPath: window.APPCFG.odataPath,
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
            const keyConv = (key, keyType) => keyType === 'string' ? `%22${key}%22` : key;
            if (!this.state.selectedKeys[filterName] || this.state.selectedKeys[filterName].length === 0) return;
            let f = this.state.selectedKeys[filterName].filter(f => f && f !== 0);
            if (f.length === 0) return;
            filters.push(`${urlName}=%5B${f.map(_ => keyConv(_, keyType)).join("%2C")}%5D`);
        }
        addFilter('BuyerId', 'Buyer');
        addFilter('OperationTypeId', 'Operation');
        addFilter('SupplierId', 'Supplier');
        addFilter('ResponsibleEmployeeId', 'ResponsibleEmployee');
        addFilter('ProblemType', 'ProblemType', 'string');
        addFilter('ConsigneeId', 'Consignee');
        addFilter('SourceNodeId', 'SourceNode');
        addFilter('DestinationNodeId', 'DestinationNode');
        addFilter('CustomerId', 'Customer');
        addFilter('WbsId', 'Wbs');
        return this.getUrl(`/ExecutionMonitoring?notOnlyProblem=true&notOnlyOwn=true&${filters.join('&')}`);
    }

    getUrl = (path) => {
        return `${path}`;
    }

    render() {
        return <div style={{ padding: 10 }}>
            <CubeViewer cubeDef={this.state.cubeDef} cubeData={this.state.cubeData}
                onSelectionChanged={this.onSelectionChanged}
                additionalActions={[<Button key="detailUrl" href={this.getDetailUrl()}>Show details</Button>]}
                localStorageKey="ShipmentCube"
                localeText={{ configureDimensions: 'Configure dimensions', resetToDefault: 'Reset to default' }}
            />
        </div>
    }
}

export default withRouter(Example);