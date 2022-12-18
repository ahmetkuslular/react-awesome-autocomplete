import { memo, useCallback } from 'react'

const Item = ({
  renderItem,
  item,
  index,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  ...props
}) => {
  const handleOnMouseEnter = useCallback(() => {
    onMouseEnter?.({ item, index })
  }, [])

  const handleOnMouseLeave = useCallback(() => {
    onMouseLeave?.({ item, index })
  }, [])

  const handleOnMouseDown = useCallback(() => {
    onMouseDown?.({ item, index })
  }, [])

  const handleOnClick = useCallback(() => {
    onClick?.({ item, index })
  }, [])

  return (
    <li
      role="option"
      {...props}
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
      onMouseDown={handleOnMouseDown}
      onClick={handleOnClick}
    >
      {renderItem({ item })}
    </li>
  )
}

export default memo(Item)
