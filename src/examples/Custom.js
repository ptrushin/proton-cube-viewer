import React from 'react';

export default ({ rows, selectedKeys, dimension, onSelectionChanged, localeText, keyName, selectedName, allRows, cubeDef }) => {
    return <div className="proton-cube-viewer-chart" style={{overflow: 'scroll', width: '800px'}}>
        {JSON.stringify(allRows)}
    </div>
};