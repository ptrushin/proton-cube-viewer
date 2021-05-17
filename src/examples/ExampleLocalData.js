import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";

import CubeViewer from "../lib/CubeViewer";

import data from './data'

const localeText={
    ConfigureDimensions: 'Configure dimensions',
    ResetToDefault: 'Reset to default',
    All: 'All',
    ClearFilters: 'Clear filters',
    ExcludeDimension: 'Exclude dimension',
    Search: 'Search',
    Reset: 'Reset'
};
export class ExampleLocalData extends PureComponent {
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
        this.setState({ cubeData: data });
    }

    onSelectionChanged = ({ selectedKeys }) => {
        this.setState({ selectedKeys: { ...selectedKeys } })
    }

    render() {
        return <>
            <div style={{ padding: 10 }}>
                <CubeViewer cubeDef={this.state.cubeDef} cubeData={this.state.cubeData}
                    onSelectionChanged={this.onSelectionChanged}
                    localStorageKey="ShipmentCube"
                    localeText={localeText}
                    isProcessing={this.state.isProcessing}
                />
            </div>
        </>
    }
}

export default withRouter(ExampleLocalData);