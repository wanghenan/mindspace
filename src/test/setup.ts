import '@testing-library/jest-dom'
import { afterEach } from 'vitest'

afterEach(() => {
  // Only clean DOM if in browser/jsdom environment
  if (typeof document !== 'undefined') {
    document.body.innerHTML = ''
  }
})
