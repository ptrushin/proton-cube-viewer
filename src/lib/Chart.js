import React, { useRef, useEffect } from 'react'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// eslint-disable-next-line
export default ({ className, maxHeight, maxWidth, type, data, options, onInit }) => {
    const chartRef = useRef(null)

    useEffect(() => {
        if (chartRef.current) {
            const chart = new Chart(chartRef.current.getContext('2d'), {
                plugins: [ChartDataLabels],
                type,
                data,
                options: {
                    ...options,
                    animation: {
                        duration: 0,
                    },
                },
            })
            if (onInit) onInit({ chart })
            return () => {
                if (onInit) onInit({ chart: null })
                chart.destroy()
            }
        }
        return null
    }, [chartRef.current, type, data, options])

    let style = {}
    if (maxHeight) style = { ...style, maxHeight }
    if (maxWidth) style = { ...style, maxWidth }

    return (
        <div className={className || ''}>
            <canvas ref={chartRef} style={style} />
        </div>
    )
}
