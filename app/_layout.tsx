import { NotesProvider, useNotes } from '@/context/notes-context'
import { registerForLocalNotificationsAsync } from '@/lib/notifications'
import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'

function RootNavigator() {
  const { session, loading } = useNotes()

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await registerForLocalNotificationsAsync()
      } catch (error) {
        // console.log('Kunne ikke sette opp lokale notifikasjoner:', error)
      }
    }

    setupNotifications()
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {session ? <Stack.Screen name="(tabs)" /> : <Stack.Screen name="auth" />}
      <Stack.Screen name="new" />
      <Stack.Screen name="note/[id]" />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <NotesProvider>
      <RootNavigator />
    </NotesProvider>
  )
}