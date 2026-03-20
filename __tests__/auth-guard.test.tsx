import HomeScreen from '@/app/(tabs)/index'
import { useNotes } from '@/context/notes-context'
import { render } from '@testing-library/react-native'
import React from 'react'

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
}))

jest.mock('@/context/notes-context', () => ({
  useNotes: jest.fn(),
}))

describe('Auth guard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('viser ikke beskyttet innhold når brukeren ikke er logget inn', () => {
    ;(useNotes as jest.Mock).mockReturnValue({
      session: null,
      notes: [],
      loading: false,
      hasMore: false,
      loadingMore: false,
      loadMoreNotes: jest.fn(),
      signOut: jest.fn(),
    })

    const { getByTestId, queryByTestId, queryByText } = render(<HomeScreen />)

    expect(getByTestId('auth-guard-message')).toBeTruthy()
    expect(queryByTestId('add-note-button')).toBeNull()
    expect(queryByText('Jobb Notater')).toBeTruthy()
  })
})