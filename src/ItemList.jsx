import { memo } from 'react'

import Item from './Item.jsx'

const ItemList = ({
  data = [],
  renderItem,
  onItemClick,
  onItemHighlighted,
  highlightedItem,
  keyPrefix,
  theme,
}) => {
  if (data?.length === 0) {
    return null
  }

  return (
    <ul role="listbox" {...theme(`${keyPrefix}items-list`, 'itemsList')}>
      {data.map((item, itemIndex) => {
        const isHighlighted = itemIndex === highlightedItem?.index
        const itemKey = `${keyPrefix}item-${itemIndex}`
        const itemProps = {
          'aria-selected': isHighlighted,
          ...theme(itemKey, 'item', isHighlighted && 'itemHighlighted'),
        }

        return (
          <Item
            {...itemProps}
            key={itemKey}
            item={item}
            index={itemIndex}
            renderItem={renderItem}
            onClick={onItemClick}
            onMouseEnter={onItemHighlighted}
            isHighlighted={isHighlighted}
          />
        )
      })}
    </ul>
  )
}

export default memo(ItemList)
