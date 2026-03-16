import { Platform } from 'react-native'

let handlerConfigured = false

async function getNotificationsModule() {
  if (Platform.OS === 'web') return null

  const Notifications = await import('expo-notifications')

  if (!handlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    })
    handlerConfigured = true
  }

  return Notifications
}

export async function registerForLocalNotificationsAsync() {
  if (Platform.OS === 'web') return false

  const Notifications = await getNotificationsModule()
  if (!Notifications) return false

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    return false
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    })
  }

  return true
}

export async function sendLocalNewNoteNotification(title: string) {
  if (Platform.OS === 'web') return

  const Notifications = await getNotificationsModule()
  if (!Notifications) return

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Nytt notat',
      body: `Nytt notat: ${title}`,
      sound: true,
    },
    trigger: null,
  })
}