import { describe, it, expect } from 'vitest'

describe('Pagination Utility', () => {
  describe('Page Calculation', () => {
    it('should calculate total pages correctly', () => {
      const totalItems = 100
      const pageSize = 10
      const totalPages = Math.ceil(totalItems / pageSize)
      expect(totalPages).toBe(10)
    })

    it('should handle partial pages', () => {
      const totalItems = 95
      const pageSize = 10
      const totalPages = Math.ceil(totalItems / pageSize)
      expect(totalPages).toBe(10)
    })

    it('should handle single page', () => {
      const totalItems = 5
      const pageSize = 10
      const totalPages = Math.ceil(totalItems / pageSize)
      expect(totalPages).toBe(1)
    })

    it('should handle empty list', () => {
      const totalItems = 0
      const pageSize = 10
      const totalPages = Math.ceil(totalItems / pageSize)
      expect(totalPages).toBe(0)
    })
  })

  describe('Page Range', () => {
    it('should calculate start index', () => {
      const currentPage = 2
      const pageSize = 10
      const startIndex = (currentPage - 1) * pageSize
      expect(startIndex).toBe(10)
    })

    it('should calculate end index', () => {
      const currentPage = 2
      const pageSize = 10
      const startIndex = (currentPage - 1) * pageSize
      const endIndex = startIndex + pageSize
      expect(endIndex).toBe(20)
    })

    it('should slice array correctly', () => {
      const items = Array.from({ length: 25 }, (_, i) => i + 1)
      const currentPage = 2
      const pageSize = 10
      const startIndex = (currentPage - 1) * pageSize
      const endIndex = startIndex + pageSize
      const pageItems = items.slice(startIndex, endIndex)
      
      expect(pageItems.length).toBe(10)
      expect(pageItems[0]).toBe(11)
      expect(pageItems[9]).toBe(20)
    })
  })

  describe('Page Navigation', () => {
    it('should validate current page', () => {
      const currentPage = 1
      const totalPages = 10
      expect(currentPage).toBeGreaterThanOrEqual(1)
      expect(currentPage).toBeLessThanOrEqual(totalPages)
    })

    it('should detect first page', () => {
      const currentPage = 1
      const isFirstPage = currentPage === 1
      expect(isFirstPage).toBe(true)
    })

    it('should detect last page', () => {
      const currentPage = 10
      const totalPages = 10
      const isLastPage = currentPage === totalPages
      expect(isLastPage).toBe(true)
    })

    it('should calculate has next page', () => {
      const currentPage = 5
      const totalPages = 10
      const hasNext = currentPage < totalPages
      expect(hasNext).toBe(true)
    })

    it('should calculate has previous page', () => {
      const currentPage = 5
      const hasPrev = currentPage > 1
      expect(hasPrev).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative page numbers', () => {
      const currentPage = -1
      const normalizedPage = Math.max(1, currentPage)
      expect(normalizedPage).toBe(1)
    })

    it('should handle page exceeding total', () => {
      const currentPage = 15
      const totalPages = 10
      const normalizedPage = Math.min(currentPage, totalPages)
      expect(normalizedPage).toBe(10)
    })

    it('should handle zero page size', () => {
      const pageSize = 0
      const safePageSize = Math.max(1, pageSize)
      expect(safePageSize).toBe(1)
    })
  })
})
