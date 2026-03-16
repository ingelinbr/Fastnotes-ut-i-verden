import * as ImagePicker from 'expo-image-picker'
import { Alert } from 'react-native'
import { validateImage } from './imageValidation'

export type PickedImageAsset = {
  uri: string
  fileName?: string | null
  fileSize?: number
  mimeType?: string | null
  width?: number
  height?: number
}

export async function pickImageFromGallery(): Promise<PickedImageAsset | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

  if (!permission.granted) {
    Alert.alert(
      'Ingen tilgang',
      'Du må gi tilgang til bildegalleriet for å velge et bilde.'
    )
    return null
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 0.8,
  })

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null
  }

  const asset = result.assets[0]

  const validation = validateImage({
    fileSize: asset.fileSize,
    mimeType: asset.mimeType ?? null,
    fileName: asset.fileName ?? null,
  })

  if (!validation.valid) {
    Alert.alert('Ugyldig bilde', validation.error ?? 'Kunne ikke bruke bildet.')
    return null
  }

  return {
    uri: asset.uri,
    fileName: asset.fileName ?? null,
    fileSize: asset.fileSize,
    mimeType: asset.mimeType ?? null,
    width: asset.width,
    height: asset.height,
  }
}

export async function takePhotoWithCamera(): Promise<PickedImageAsset | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync()

  if (!permission.granted) {
    Alert.alert('Ingen tilgang', 'Du må gi tilgang til kamera for å ta bilde.')
    return null
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.8,
  })

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null
  }

  const asset = result.assets[0]

  const validation = validateImage({
    fileSize: asset.fileSize,
    mimeType: asset.mimeType ?? null,
    fileName: asset.fileName ?? null,
  })

  if (!validation.valid) {
    Alert.alert('Ugyldig bilde', validation.error ?? 'Kunne ikke bruke bildet.')
    return null
  }

  return {
    uri: asset.uri,
    fileName: asset.fileName ?? null,
    fileSize: asset.fileSize,
    mimeType: asset.mimeType ?? null,
    width: asset.width,
    height: asset.height,
  }
}