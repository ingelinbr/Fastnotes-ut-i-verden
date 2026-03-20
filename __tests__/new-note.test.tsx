import NewNoteScreen from '@/app/new';
import { useNotes } from '@/context/notes-context';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock('@/context/notes-context', () => ({
  useNotes: jest.fn(),
}));

jest.mock('@/lib/notifications', () => ({
  sendLocalNewNoteNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/imagePicker', () => ({
  pickImageFromGallery: jest.fn(),
  takePhotoWithCamera: jest.fn(),
}));

jest.mock('@/lib/imageUpload', () => ({
  uploadImageToSupabase: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      }),
    },
  },
}));

describe('NewNoteScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('oppretter notat og navigerer tilbake', async () => {
    const addNote = jest.fn().mockResolvedValue(undefined);

    (useNotes as jest.Mock).mockReturnValue({
      addNote,
      session: { user: { id: '123' } },
    });

    const { getByPlaceholderText, getByTestId } = render(<NewNoteScreen />);

    fireEvent.changeText(getByPlaceholderText('Tittel'), 'Testnotat');
    fireEvent.changeText(getByPlaceholderText('Innhold'), 'Dette er innhold');
    fireEvent.press(getByTestId('save-note-button'));

    await waitFor(() => {
      expect(addNote).toHaveBeenCalledWith('Testnotat', 'Dette er innhold', null);
      expect(router.back).toHaveBeenCalledTimes(1);
    });
  });
});