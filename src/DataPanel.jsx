import { forwardRef, useMemo } from 'react'

import { CSSTransition } from './CSSTransition.jsx'

const defaultRenderDataContainer = ({ containerProps, children }) => (
  <div {...containerProps}>{children}</div>
)

const DataPanel = forwardRef(
  (
    {
      visible,
      id,
      onEntered,
      onExit,
      content,
      isOpen,
      theme,
      value,
      renderDataContainer = defaultRenderDataContainer,
    },
    ref,
  ) => {
    const containerProps = useMemo(
      () => ({
        role: 'listbox',
        ...theme(
          `react-autocomplete-${id}-items-container`,
          'itemsContainer',
          isOpen && 'itemsContainerOpen',
          ref,
        ),
      }),
      [id, isOpen],
    )

    return (
      <CSSTransition
        nodeRef={ref}
        in={visible}
        unmountOnExit
        timeout={100}
        onEntered={onEntered}
        onExit={onExit}
      >
        {renderDataContainer({ containerProps, children: content, value })}
      </CSSTransition>
    )
  },
)

export default DataPanel
