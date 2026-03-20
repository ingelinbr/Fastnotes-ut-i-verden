import NoteDetailsScreen from '@/app/note/[id]'
import { useNotes } from '@/context/notes-context'
import { render, waitFor } from '@testing-library/react-native'
import React from 'react'

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: () => ({
    id: '1',
  }),
}))

jest.mock('@/context/notes-context', () => ({
  useNotes: jest.fn(),
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(
            () =>
              new Promise((resolve) =>
                setTimeout(() => {
                  resolve({
                    data: {
                      id: '1',
                      title: 'Testnotat',
                      content: 'Testinnhold',
                      image_url: null,
                      user_id: '123',
                      user_email: 'test@test.no',
                      created_at: '2026-03-20T10:00:00.000Z',
                      updated_at: '2026-03-20T10:00:00.000Z',
                    },
                    error: null,
                  })
                }, 50)
              )
          ),
        })),
      })),
    })),
  },
}))

describe('NoteDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('viser loader mens notatet hentes og skjuler den når notatet er lastet', async () => {
    ;(useNotes as jest.Mock).mockReturnValue({
      session: { user: { id: '123' } },
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
    })

    const { getByTestId, queryByTestId, getByDisplayValue } = render(
      <NoteDetailsScreen />
    )

    expect(getByTestId('note-loader')).toBeTruthy()

    await waitFor(() => {
      expect(queryByTestId('note-loader')).toBeNull()
      expect(getByDisplayValue('Testnotat')).toBeTruthy()
      expect(getByDisplayValue('Testinnhold')).toBeTruthy()
    })
  })
})