import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useNotes } from '@/context/notes-context'
import { useThemeColor } from '@/hooks/use-theme-color'
import { router } from 'expo-router'
import { useState } from 'react'
import { Alert, Pressable, StyleSheet, TextInput } from 'react-native'

export default function NewNoteScreen() {
  const { addNote } = useNotes()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const tintColor = useThemeColor({}, 'tint')
  const borderColor = useThemeColor({}, 'border')

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Feil', 'Du må fylle ut både tittel og innhold')
      return
    }

    await addNote(title, content)
    router.back()
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.heading}>New Note</ThemedText>

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
        <ThemedText style={[styles.buttonText, { color: tintColor }]}>Save note</ThemedText>
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
})