import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useNotes } from '@/context/notes-context'
import { useThemeColor } from '@/hooks/use-theme-color'
import {
  pickImageFromGallery,
  takePhotoWithCamera,
  type PickedImageAsset,
} from '@/lib/imagePicker'
import { uploadImageToSupabase } from '@/lib/imageUpload'
import { sendLocalNewNoteNotification } from '@/lib/notifications'
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'

export default function NewNoteScreen() {
  const { addNote, session } = useNotes()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedImage, setSelectedImage] = useState<PickedImageAsset | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const tintColor = useThemeColor({}, 'tint')
  const borderColor = useThemeColor({}, 'border')
  const secondaryTextColor = useThemeColor({}, 'secondaryText')

  const handlePickImage = async () => {
    if (isSaving) return

    try {
      const image = await pickImageFromGallery()
      if (image) {
        setSelectedImage(image)
      }
    } catch {
      Alert.alert('Feil', 'Kunne ikke velge bilde fra galleri')
    }
  }

  const handleTakePhoto = async () => {
    if (isSaving) return

    try {
      const image = await takePhotoWithCamera()
      if (image) {
        setSelectedImage(image)
      }
    } catch {
      Alert.alert('Feil', 'Kunne ikke ta bilde')
    }
  }

  const handleRemoveImage = () => {
    if (isSaving) return
    setSelectedImage(null)
  }

  const handleSave = async () => {
    if (isSaving) return

    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle || !trimmedContent) {
      Alert.alert('Feil', 'Du må fylle ut både tittel og innhold')
      return
    }

    try {
      setIsSaving(true)

      let imageUrl: string | null = null

      if (selectedImage) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        if (!user) {
          throw new Error('Fant ikke innlogget bruker')
        }

        const uploadedImage = await uploadImageToSupabase(selectedImage, user.id)
        imageUrl = uploadedImage?.imageUrl ?? null
      }

      await addNote(trimmedTitle, trimmedContent, imageUrl)
      await sendLocalNewNoteNotification(trimmedTitle)
      router.back()
    } catch (error: any) {
      const errorMessage =
        error?.message ??
        error?.error_description ??
        'Kunne ikke lagre notatet'

      Alert.alert('Feil', errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  if (!session) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.heading}>Nytt notat</ThemedText>
        <ThemedText testID="auth-guard-message">
          Du må være logget inn for å opprette notater.
        </ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.heading}>Nytt notat</ThemedText>

      <TextInput
        testID="title-input"
        style={[styles.input, { borderColor }]}
        placeholder="Tittel"
        value={title}
        onChangeText={setTitle}
        editable={!isSaving}
      />

      <TextInput
        testID="content-input"
        style={[styles.input, styles.textArea, { borderColor }]}
        placeholder="Innhold"
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
        editable={!isSaving}
      />

      <View style={styles.imageActions}>
        <Pressable
          testID="pick-image-button"
          style={[
            styles.secondaryButton,
            { borderColor: tintColor },
            isSaving && styles.buttonDisabled,
          ]}
          onPress={handlePickImage}
          disabled={isSaving}
        >
          <ThemedText
            style={[
              styles.secondaryButtonText,
              { color: isSaving ? secondaryTextColor : tintColor },
            ]}
          >
            Velg bilde
          </ThemedText>
        </Pressable>

        <Pressable
          testID="take-photo-button"
          style={[
            styles.secondaryButton,
            { borderColor: tintColor },
            isSaving && styles.buttonDisabled,
          ]}
          onPress={handleTakePhoto}
          disabled={isSaving}
        >
          <ThemedText
            style={[
              styles.secondaryButtonText,
              { color: isSaving ? secondaryTextColor : tintColor },
            ]}
          >
            Ta bilde
          </ThemedText>
        </Pressable>
      </View>

      {selectedImage && (
        <View style={styles.previewContainer}>
          <ThemedText style={styles.previewLabel}>Forhåndsvisning</ThemedText>

          <Image
            source={{ uri: selectedImage.uri }}
            style={styles.previewImage}
            resizeMode="cover"
          />

          <Pressable
            testID="remove-image-button"
            style={[
              styles.removeButton,
              { borderColor },
              isSaving && styles.buttonDisabled,
            ]}
            onPress={handleRemoveImage}
            disabled={isSaving}
          >
            <ThemedText style={styles.removeButtonText}>Fjern bilde</ThemedText>
          </Pressable>
        </View>
      )}

      <Pressable
        testID="save-note-button"
        style={[
          styles.button,
          { borderColor: tintColor },
          isSaving && styles.buttonDisabled,
        ]}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator testID="save-loader" size="small" color={tintColor} />
            <ThemedText
              style={[
                styles.buttonText,
                { color: secondaryTextColor, marginLeft: 8 },
              ]}
            >
              Lagrer...
            </ThemedText>
          </View>
        ) : (
          <ThemedText style={[styles.buttonText, { color: tintColor }]}>
            Lagre notat
          </ThemedText>
        )}
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
  imageActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 12,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  previewContainer: {
    marginBottom: 14,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#eaeaea',
  },
  removeButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})