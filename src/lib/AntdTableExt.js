import React from "react";
import { Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getValueByDataIndex, numberCompare } from './utils';

export function ContextFilter(dataIndex, localeText) {
    return {
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={confirm}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={confirm}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        {localeText.Search}
                    </Button>
                    <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
                        {localeText.Reset}
                    </Button>
                </Space>
            </div>
        ),
        onFilter: (value, record) => {
            const v = getValueByDataIndex(record, dataIndex);
            return v
                ? v.toString().toLowerCase().includes(value.toLowerCase())
                : ''
        }
    }
};

export function stringSorter(a, b, dataIndex) { 
    const valueA = getValueByDataIndex(a, dataIndex);
    return valueA === null || valueA === undefined
        ? -1
        : valueA.localeCompare(getValueByDataIndex(b, dataIndex));
}

export function numberSorter(a, b, dataIndex) {
    return numberCompare(getValueByDataIndex(a, dataIndex), getValueByDataIndex(b, dataIndex));
}

