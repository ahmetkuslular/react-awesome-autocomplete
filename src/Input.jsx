import { forwardRef } from 'react'

const defaultRenderInputComponent = (props) => <input {...props} />

const Input = forwardRef(
  ({ inputProps, renderInputComponent = defaultRenderInputComponent, id, itemId }, ref) => {
    return renderInputComponent({
      ref,
      type: 'text',
      role: 'combobox',
      autoComplete: 'off',
      'aria-autocomplete': 'list',
      'aria-controls': `react-autocomplete-${id}`,
      'aria-activedescendant': itemId,
      ...inputProps,
    })
  },
)

export default Input
