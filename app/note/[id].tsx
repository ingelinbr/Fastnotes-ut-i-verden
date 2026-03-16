import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useNotes } from '@/context/notes-context'
import { useThemeColor } from '@/hooks/use-theme-color'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Image, Pressable, StyleSheet, TextInput } from 'react-native'

export default function NoteDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { notes, updateNote, deleteNote } = useNotes()

  const note = useMemo(() => notes.find((n) => n.id === id), [notes, id])

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const tintColor = useThemeColor({}, 'tint')
  const borderColor = useThemeColor({}, 'border')
  const destructiveColor = useThemeColor({}, 'destructive')
  const secondaryTextColor = useThemeColor({}, 'secondaryText')

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content ?? '')
    }
  }, [note])

  const handleSave = async () => {
    if (!note || isSaving) return

    if (!title.trim() || !content.trim()) {
      Alert.alert('Feil', 'Du må fylle ut både tittel og innhold')
      return
    }

    try {
      setIsSaving(true)
      await updateNote(note.id, title.trim(), content.trim())
      router.back()
    } catch (error) {
      Alert.alert('Feil', 'Kunne ikke oppdatere notatet')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!note || isDeleting) return

    Alert.alert('Slett notat', 'Er du sikker på at du vil slette notatet?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Slett',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true)
            await deleteNote(note.id)
            router.replace('/(tabs)')
          } catch (error) {
            Alert.alert('Feil', 'Kunne ikke slette notatet')
          } finally {
            setIsDeleting(false)
          }
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
        editable={!isSaving && !isDeleting}
      />

      <TextInput
        style={[styles.input, styles.textArea, { borderColor }]}
        placeholder="Content"
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
        editable={!isSaving && !isDeleting}
      />

      {note.image_url && (
        <>
          <ThemedText style={styles.imageLabel}>Bilde</ThemedText>
          <Image
            source={{ uri: note.image_url }}
            style={styles.noteImage}
            resizeMode="cover"
          />
        </>
      )}

      <Pressable
        style={[
          styles.button,
          { borderColor: tintColor },
          isSaving && styles.buttonDisabled,
        ]}
        onPress={handleSave}
        disabled={isSaving || isDeleting}
      >
        <ThemedText
          style={[
            styles.buttonText,
            { color: isSaving ? secondaryTextColor : tintColor },
          ]}
        >
          {isSaving ? 'Saving...' : 'Save changes'}
        </ThemedText>
      </Pressable>

      <Pressable
        style={[
          styles.deleteButton,
          { borderColor: destructiveColor },
          isDeleting && styles.buttonDisabled,
        ]}
        onPress={handleDelete}
        disabled={isSaving || isDeleting}
      >
        <ThemedText
          style={[
            styles.deleteButtonText,
            { color: isDeleting ? secondaryTextColor : destructiveColor },
          ]}
        >
          {isDeleting ? 'Deleting...' : 'Delete note'}
        </ThemedText>
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
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  noteImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#e5e5e5',
  },
  button: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButton: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})