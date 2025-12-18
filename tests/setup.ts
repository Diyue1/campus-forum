import { vi } from 'vitest'

// Mock Canvas API for happy-dom environment
class MockCanvasRenderingContext2D {
  fillStyle = ''
  font = ''
  textAlign = 'left'
  textBaseline = 'alphabetic'

  fillRect() {}
  fillText() {}
  measureText() {
    return { width: 100 }
  }
  clearRect() {}
  beginPath() {}
  arc() {}
  fill() {}
  stroke() {}
}

// Mock HTMLCanvasElement
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
    if (contextType === '2d') {
      return new MockCanvasRenderingContext2D() as any
    }
    return null
  }) as any

  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => {
    return 'data:image/png;base64,mock-image-data'
  }) as any
}

// Mock localStorage if needed
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  } as any
}
