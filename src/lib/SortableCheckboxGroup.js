import React from 'react';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Space, Checkbox } from 'antd'
import SortableCheckboxItem from './SortableCheckboxItem';
const CheckboxGroup = Checkbox.Group;

export default ({ items, itemSettings, onChangeItemSettings }) => {
    const visibleItems = Object.entries(itemSettings).filter(e => e[1].visible).map(e => e[0]);
    const indeterminate = visibleItems.length > 0 && visibleItems.length < items.length;
    const checkedAll = visibleItems.length === items.length;
    const checkAllChange = (checked) => {
        for (let ck of Object.keys(itemSettings)) {
            itemSettings[ck].visible = checked
        }
        onChangeItemSettings({...itemSettings});
    }
    const checkChange = (list) => { 
        for (let ck of Object.keys(itemSettings)) {
            itemSettings[ck].visible = list.indexOf(ck) >= 0
        }
        onChangeItemSettings({...itemSettings});
    }
    const changeIndex = ({item, dragIndex, hoverIndex}) => { 
        const dragComponent = itemSettings[item.code];
        for (let ck of Object.keys(itemSettings)) {
            let c = itemSettings[ck]
            if (hoverIndex < dragIndex && c.index >= hoverIndex && c.index < dragIndex) {
                c.index++;
            }
            else if (hoverIndex > dragIndex && c.index <= hoverIndex && c.index > dragIndex) {
                c.index--;
            }
        }
        dragComponent.index = hoverIndex;
        onChangeItemSettings({...itemSettings});
    }

    return <DndProvider backend={HTML5Backend}>
        <Space direction="vertical">
            <Checkbox indeterminate={indeterminate} onChange={(e) => checkAllChange(e.target.checked)} checked={checkedAll}>Все</Checkbox>
            <CheckboxGroup value={visibleItems} onChange={checkChange}>
                {items
                    .sort((a, b) => itemSettings[a.code].index - itemSettings[b.code].index)
                    .map((item, idx) =>
                        <SortableCheckboxItem key={item.code} code={item.code} title={item.title} index={idx} changeIndex={changeIndex} />
                    )}
            </CheckboxGroup>
        </Space>
    </DndProvider>
}