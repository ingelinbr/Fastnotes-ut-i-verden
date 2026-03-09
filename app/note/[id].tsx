import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useNotes } from '@/context/notes-context'
import { useThemeColor } from '@/hooks/use-theme-color'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Pressable, StyleSheet, TextInput } from 'react-native'

export default function NoteDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { notes, updateNote, deleteNote } = useNotes()

  const note = useMemo(() => notes.find((n) => n.id === id), [notes, id])

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const tintColor = useThemeColor({}, 'tint')
  const borderColor = useThemeColor({}, 'border')
  const destructiveColor = useThemeColor({}, 'destructive')

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content ?? '')
    }
  }, [note])

  const handleSave = async () => {
    if (!note) return

    if (!title.trim() || !content.trim()) {
      Alert.alert('Feil', 'Du må fylle ut både tittel og innhold')
      return
    }

    await updateNote(note.id, title, content)
    router.back()
  }

  const handleDelete = async () => {
    if (!note) return

    Alert.alert('Slett notat', 'Er du sikker på at du vil slette notatet?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Slett',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(note.id)
          router.replace('/(tabs)')
        },
      },
    ])
  }

  if (!note) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Fant ikke notatet.</ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.heading}>Edit Note</ThemedText>

      <TextInput
        style={[styles.input, { borderColor }]}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.textArea, { borderColor }]}
        placeholder="Content"
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
      />

      <Pressable style={[styles.button, { borderColor: tintColor }]} onPress={handleSave}>
        <ThemedText style={[styles.buttonText, { color: tintColor }]}>Save changes</ThemedText>
      </Pressable>

      <Pressable style={[styles.deleteButton, { borderColor: destructiveColor }]} onPress={handleDelete}>
        <ThemedText style={[styles.deleteButtonText, { color: destructiveColor }]}>Delete note</ThemedText>
      </Pressable>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  textArea: {
    height: 160,
  },
  button: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})