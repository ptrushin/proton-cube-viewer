import React from "react";
import { Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

function getValue(record, dataIndex, level = 0) {
    if (typeof dataIndex === 'string') {
        return record[dataIndex];
    }
    if (dataIndex.length === level + 1) {
        return record[dataIndex[level]];
    } else {
        return getValue(record[dataIndex[level]], dataIndex, level + 1);
    }
}

export default dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
            <Input
                /*ref={node => {
                    this.searchInput = node;
                }}*/
                placeholder={`Search ${dataIndex}`}
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
                    Search
          </Button>
                <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
                    Reset
          </Button>
                <Button
                    type="link"
                    size="small"
                    onClick={() => {
                        confirm({ closeDropdown: false });
                        this.setState({
                            searchText: selectedKeys[0],
                            searchedColumn: dataIndex,
                        });
                    }}
                >
                    Filter
          </Button>
            </Space>
        </div>
    ),
    onFilter: (value, record) => {
        const v = getValue(record, dataIndex);
        return v
            ? v.toString().toLowerCase().includes(value.toLowerCase())
            : ''
    }
});