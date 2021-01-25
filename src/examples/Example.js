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
                    code: 'OrderID', title: 'По типу проблемы',
                    table: 'Customers',
                    columnDefs: [
                        { headerName: "Тип", field: "Label.CompanyName", filter: 'agTextColumnFilter', flex: 2 },
                        { headerName: "Кол-во", field: "Cnt", width: 80, filter: null }
                    ],
                },
                {
                    code: 'CustomerID', title: 'По типу проблемы',
                    table: 'Customers',
                    columnDefs: [
                        { headerName: "Тип", field: "Label.CompanyName", filter: 'agTextColumnFilter', flex: 2 },
                        { headerName: "Кол-во", field: "Cnt", width: 80, filter: null }
                    ],
                },
                {
                    code: 'EmployeeID', title: 'По сотрудникам',
                    table: 'Employees',
                    columnDefs: [
                        { headerName: "Сотрудник", field: "Label.LastName", filter: 'agTextColumnFilter', flex: 2 },
                        { headerName: "Кол-во", field: "Cnt", width: 80, filter: null }
                    ]
                }
            ],
            fieldDefs: [
                { code: 'Cnt' }
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

    getShipmentUrl = () => {
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
        return (
                <CubeViewer cubeDef={this.state.cubeDef} cubeData={this.state.cubeData}
                    onSelectionChanged={this.onSelectionChanged}
                    additionalActions={[<Button href={this.getShipmentUrl()}>Перейти к партиям</Button>]}
                    localStorageKey="ShipmentCube"
                    localeText={{configureDimensions: 'Настроить измерения'}}
                />
        );
    }
}

export default withRouter(Example);