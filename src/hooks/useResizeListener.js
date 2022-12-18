import { useEventListener } from './useEventListener.js'

export const useResizeListener = ({ listener }) =>
  useEventListener({ target: 'window', type: 'resize', listener })
