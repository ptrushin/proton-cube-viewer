import React from 'react';
import './CubeViewer.css';
import Chart from './Chart'

const contractExecutionStateAggr = [
    {
        contractor: "Контрагент 1",
        inWork: 70,
        inWorkWithProblem: 30,
        executed: 50,
        closed: 25
    },
    {
        contractor: "Контрагент 2",
        inWork: 60,
        inWorkWithProblem: 15,
        executed: 105,
        closed: 55
    },
    {
        contractor: "Контрагент 3",
        inWork: 50,
        inWorkWithProblem: 40,
        executed: 20,
        closed: 100
    },
    {
        contractor: "Контрагент 4",
        inWork: 60,
        inWorkWithProblem: 50,
        executed: 50,
        closed: 15
    },
    {
        contractor: "Контрагент 5",
        inWork: 30,
        inWorkWithProblem: 15,
        executed: 5,
        closed: 50
    }
]

export default ({ rows, selectedKeys, dimension, onSelectionChanged, localeText, keyName, selectedName }) => {
    console.log({rows, selectedKeys, dimension, onSelectionChanged, localeText, keyName, selectedName})
    let labelCode = dimension.columns[0].dataIndex;
    let valueCodes = dimension.columns.slice(1, 2).map(_ => _.dataIndex);
    return <div className="proton-cube-viewer-chart">
        <Chart
        type='bar'
        data={{
            labels: rows.filter(_ => _._selected).map(_ => _[labelCode]),
            datasets: valueCodes.map(valueCode => ({
                label: valueCode,
                data: rows.filter(_ => _._selected).map(_ => _[valueCode]),
                backgroundColor: [
                    'rgba(164, 206, 255, 0.4)'
                ],
                borderWidth: 1,
                borderRadius: 5,
                datalabels1: {
                    anchor: 'end',
                    align: 'top',
                    color: 'rgba(164, 206, 255, 1)'
                }
            })
            )
        }}
        options={{
            plugins: {
                datalabels1: {
                    display: true,
                    anchor: 'end',
                    align: 'top'
                }
            },
            scales: {
                xAxes: {
                    //stacked: true,
                    grid: {
                        display: true
                    }
                },
                yAxes: {
                    display: false
                }
            }
        }} />
    </div>
};