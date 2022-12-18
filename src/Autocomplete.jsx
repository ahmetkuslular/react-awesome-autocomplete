import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import themeable from 'react-themeable'

import DataPanel from './DataPanel.jsx'
import { useOverlayListener } from './hooks/index.js'
import Input from './Input.jsx'
import ItemList from './ItemList.jsx'
import ObjectUtils from './utils/ObjectUtils.js'

const REASON = {
  SUGGESTIONS_REVEALED: 'suggestions-revealed',
  SUGGESTIONS_UPDATED: 'suggestions-updated',
  SUGGESTION_SELECTED: 'suggestion-selected',
  INPUT_FOCUSED: 'input-focused',
  INPUT_CHANGED: 'input-changed',
  INPUT_BLURRED: 'input-blurred',
  ESCAPE_PRESSED: 'escape-pressed',
  ENTER: 'enter',
  CLICK: 'click',
}

const defaultTheme = {
  container: 'react-autowhatever__container',
  containerOpen: 'react-autowhatever__container--open',
  input: 'react-autowhatever__input',
  inputOpen: 'react-autowhatever__input--open',
  inputFocused: 'react-autowhatever__input--focused',
  itemsContainer: 'react-autowhatever__items-container',
  itemsContainerOpen: 'react-autowhatever__items-container--open',
  itemsList: 'react-autowhatever__items-list',
  item: 'react-autowhatever__item',
  itemFirst: 'react-autowhatever__item--first',
  itemHighlighted: 'react-autowhatever__item--highlighted',
  sectionContainer: 'react-autowhatever__section-container',
  sectionContainerFirst: 'react-autowhatever__section-container--first',
  sectionTitle: 'react-autowhatever__section-title',
}

const createContent = ({
  visible,
  id,
  shouldRender,
  renderEmptyComponent,
  renderDefaultComponent,
  alwaysShowData,
  listProps: { data, ...rest },
}) => {
  if (!visible) {
    return null
  }

  if (shouldRender && data?.length === 0 && renderEmptyComponent) {
    return renderEmptyComponent()
  }

  if (!shouldRender && renderDefaultComponent && !alwaysShowData) {
    return renderDefaultComponent()
  }

  if (data?.length > 0) {
    return <ItemList data={data} keyPrefix={`react-autocomplete-${id}-`} {...rest} />
  }

  return null
}

const Autocomplete = ({
  data,
  renderItem,
  onItemClick,
  onSelect,
  onSubmit,
  onItemHighlighted,
  id = '1',
  theme: customTheme = defaultTheme,
  value: defaultValue = '',
  getValue,
  onDataFetch,
  onDataClear,
  shouldRenderData,
  alwaysShowData = false,
  isFirstItemHighlight = false,
  isFocusOnSelectItem = true,
  onChange,
  onFocus,
  onBlur,
  renderEmptyComponent,
  renderDefaultComponent,
  renderDataContainer,
  renderInputComponent,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [panelVisible, setPanelVisible] = useState(alwaysShowData || false)
  const [highlightedItem, setHighlightedItem] = useState(null)
  const theme = themeable(customTheme)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const panelRef = useRef(null)

  const [bindPanelListener, unbindPanelListener] = useOverlayListener({
    target: containerRef,
    overlay: panelRef,
    listener: (event, { type }) => {
      type === 'outside' ? !isInputClicked(event) && hide() : hide()
    },
    when: panelVisible,
  })

  const onOverlayEntered = () => {
    bindPanelListener()
  }

  const onOverlayExit = () => {
    unbindPanelListener()
  }

  const isInputClicked = (event) => {
    return event.target === inputRef.current
  }

  const show = () => {
    setPanelVisible(true)
  }

  const hide = () => {
    setPanelVisible(false)
  }

  const handleOnItemHighlighted = useCallback(({ item, index }) => {
    const value = getValue({ item })
    setHighlightedItem({ item, index, value })
    onItemHighlighted?.({ item, index, value })
  }, [])

  const handleOnChange = useCallback(({ item }) => {
    const value = inputRef.current.value
    const newValue = getValue({ item })
    if (value !== newValue) {
      onChange?.(newValue)
      inputRef.current.value = newValue
    }
  }, [])

  const handleOnItemClick = useCallback(({ item, index }) => {
    handleOnChange({ item })
    onItemClick?.({ item, index })
    onSelect?.({ item, index })

    if (isFocusOnSelectItem) {
      inputRef?.current?.focus()
    } else {
      inputRef?.current?.blur()
    }
    hide()
  }, [])

  useEffect(() => {
    if (isFirstItemHighlight) {
      const value = getValue({ item: data[0] })
      setHighlightedItem({ item: data[0], index: 0, value })
    }
  }, [data])

  const arrowDown = () => {
    let index = highlightedItem?.index ?? -1
    index = (index + 1) % data.length
    if (index > -1 && index !== highlightedItem?.index) {
      const value = getValue({ item: data[index] })
      setHighlightedItem({ item: data[index], index, value })
      onItemHighlighted?.({ item: data[index], index, value })
      handleOnChange({ item: data[index] })
    }
  }

  const arrowUp = () => {
    let index = highlightedItem?.index ?? data.length
    index = (index - 1 + data.length) % data.length

    if (index !== data.length) {
      const value = getValue({ item: data[index] })
      setHighlightedItem({ item: data[index], index, value })
      onItemHighlighted?.({ item: data[index], index, value })
      handleOnChange({ item: data[index] })
    }
  }

  const handleOnSubmit = () => {
    const inputValue = inputRef?.current?.value
    const highlightedItemValue = highlightedItem?.value

    onSubmit?.({
      value: inputRef?.current?.value,
      highlightedItem,
    })

    onSelect?.({
      value: inputRef?.current?.value,
      highlightedItem,
      reason: REASON.ENTER,
    })

    if (highlightedItemValue && inputValue !== highlightedItemValue) {
      handleOnChange({ item: highlightedItem?.item })
    }
    hide()
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      arrowDown()
    } else if (event.key === 'ArrowUp') {
      arrowUp()
    } else if (event.key === 'Enter') {
      handleOnSubmit()
    } else if (event.key === 'Escape') {
      hide()
    }
  }

  const shouldRender = shouldRenderData({
    value: inputRef?.current?.value,
  })
  const items = panelVisible ? data : []
  const content = createContent({
    visible: panelVisible,
    shouldRender,
    renderEmptyComponent,
    renderDefaultComponent,
    alwaysShowData,
    id,
    listProps: {
      data: items,
      renderItem,
      onItemClick: handleOnItemClick,
      onItemHighlighted: handleOnItemHighlighted,
      highlightedItem,
      theme,
    },
  })
  const isOpen = content !== null

  const inputProps = {
    defaultValue,
    ...theme(
      `react-autowhatever-${id}-input`,
      'input',
      isOpen && 'inputOpen',
      isFocused && 'inputFocused',
    ),
    onFocus: (event) => {
      const value = inputRef?.current?.value
      const shouldRender = shouldRenderData({ value })
      setIsFocused(true)
      onFocus?.(event)

      if (shouldRender || renderDefaultComponent) {
        show()
      }
      if (!shouldRender) {
        hide()
      }
      if (shouldRender) {
        onDataFetch?.({ value, reason: REASON.INPUT_FOCUSED })
      }
    },
    onBlur: (event) => {
      setIsFocused(false)
      onBlur?.(event)
      setHighlightedItem(null)
    },
    onChange: (event) => {
      const { value } = event.target
      onChange?.(event, { value })
      setHighlightedItem(null)
      const shouldRender = shouldRenderData({ value })

      if (shouldRender || renderDefaultComponent) {
        show()
      }
      if (shouldRender) {
        onDataFetch?.({ value, reason: REASON.INPUT_CHANGED })
      } else {
        onDataClear()
      }
    },
    onKeyDown,
  }

  const itemId = useMemo(() => {
    if (ObjectUtils.isEmpty(highlightedItem?.index)) {
      return null
    }

    return `react-autowhatever-${id}-item-${highlightedItem?.index}`
  }, [highlightedItem])

  const containerProps = {
    role: 'combobox',
    'aria-haspopup': 'listbox',
    'aria-owns': `react-autowhatever-${id}`,
    'aria-expanded': isOpen,
    ...theme(`react-autocomplete-${id}-container`, 'container', isOpen && 'containerOpen'),
  }

  return (
    <div ref={containerRef} {...containerProps}>
      <Input
        ref={inputRef}
        inputProps={inputProps}
        renderInputComponent={renderInputComponent}
        itemId={itemId}
      />
      <DataPanel
        ref={panelRef}
        visible={panelVisible}
        content={content}
        isOpen={isOpen}
        theme={theme}
        onEntered={onOverlayEntered}
        onExit={onOverlayExit}
        value={inputRef?.current?.value}
        renderDataContainer={renderDataContainer}
      />
    </div>
  )
}

export default Autocomplete
