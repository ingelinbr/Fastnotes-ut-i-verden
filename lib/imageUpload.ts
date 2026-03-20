import { decode } from 'base64-arraybuffer'
import * as FileSystem from 'expo-file-system/legacy'
import type { PickedImageAsset } from './imagePicker'
import { supabase } from './supabase'

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

function getFileExtension(fileName?: string | null, mimeType?: string | null) {
  if (fileName && fileName.includes('.')) {
    return fileName.split('.').pop()?.toLowerCase() ?? 'jpg'
  }

  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  return 'jpg'
}

function getContentType(ext: string, mimeType?: string | null) {
  if (mimeType) return mimeType
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  return 'image/jpeg'
}

function validateImage(image: PickedImageAsset, ext: string, contentType: string) {
  if (image.fileSize && image.fileSize > MAX_FILE_SIZE_BYTES) {
    throw new Error('Bildet er for stort. Maks størrelse er 15MB.')
  }

  const normalizedExt = ext.toLowerCase()

  if (!ALLOWED_EXTENSIONS.includes(normalizedExt)) {
    throw new Error('Ugyldig filformat. Kun JPG, PNG og WebP er tillatt.')
  }

  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    throw new Error('Ugyldig bildeformat. Kun JPG, PNG og WebP er tillatt.')
  }
}

export async function uploadImageToSupabase(
  image: PickedImageAsset,
  userId: string
) {
  try {
    if (!image?.uri) {
      throw new Error('Fant ikke bildefil.')
    }

    if (!userId) {
      throw new Error('Fant ikke innlogget bruker.')
    }

    const ext = getFileExtension(image.fileName, image.mimeType)
    const contentType = getContentType(ext, image.mimeType)

    validateImage(image, ext, contentType)

    // console.log('UPLOAD START')
    // console.log('image.uri:', image.uri)
    // console.log('image.fileName:', image.fileName)
    // console.log('image.fileSize:', image.fileSize)
    // console.log('image.mimeType:', image.mimeType)
    // console.log('ext:', ext)
    // console.log('contentType:', contentType)

    const fileInfo = await FileSystem.getInfoAsync(image.uri)
    // console.log('fileInfo:', fileInfo)

    if (!fileInfo.exists) {
      throw new Error('Bildefilen finnes ikke på enheten.')
    }

    const base64 = await FileSystem.readAsStringAsync(image.uri, {
      encoding: 'base64',
    })

    if (!base64) {
      throw new Error('Kunne ikke lese bildefilen.')
    }

    const filePath = `${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`

    // console.log('Uploading to path:', filePath)

    const { data, error } = await supabase.storage
      .from('note-images')
      .upload(filePath, decode(base64), {
        contentType,
        upsert: false,
      })

    // console.log('UPLOAD RESULT data:', data)
    // console.log('UPLOAD RESULT error:', error)

    if (error) {
      throw new Error(`Opplasting feilet: ${error.message}`)
    }

    const { data: publicUrlData } = supabase.storage
      .from('note-images')
      .getPublicUrl(data.path)

    // console.log('PUBLIC URL:', publicUrlData.publicUrl)

    return {
      path: data.path,
      imageUrl: publicUrlData.publicUrl,
    }
  } catch (error: any) {
    // console.log('UPLOAD IMAGE ERROR:', error)
    throw new Error(error?.message ?? 'Kunne ikke laste opp bildet.')
  }
}