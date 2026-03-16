import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useNotes } from '@/context/notes-context'
import { useThemeColor } from '@/hooks/use-theme-color'
import { router } from 'expo-router'
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native'

export default function HomeScreen() {
  const { notes, signOut } = useNotes()
  const tintColor = useThemeColor({}, 'tint')
  const borderColor = useThemeColor({}, 'border')
  const secondaryTextColor = useThemeColor({}, 'secondaryText')

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Jobb Notater</ThemedText>

        <Pressable
          onPress={async () => {
            await signOut()
            router.replace('/auth')
          }}
        >
          <ThemedText style={styles.link}>Log out</ThemedText>
        </Pressable>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<ThemedText>No notes yet.</ThemedText>}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.noteCard, { borderColor }]}
            onPress={() => router.push(`/note/${item.id}`)}
          >
            <ThemedText style={styles.noteTitle}>{item.title}</ThemedText>

            <ThemedText style={[styles.noteUser, { color: secondaryTextColor }]}>
              Created by: {item.user_email ?? 'Unknown'}
            </ThemedText>

            {item.image_url && (
              <Image
                source={{ uri: item.image_url }}
                style={styles.noteImage}
                resizeMode="cover"
              />
            )}

            <ThemedText
              numberOfLines={2}
              style={[styles.noteContent, { color: secondaryTextColor }]}
            >
              {item.content}
            </ThemedText>

            <ThemedText style={[styles.noteDate, { color: secondaryTextColor }]}>
              Last updated: {new Date(item.updated_at).toLocaleString()}
            </ThemedText>
          </Pressable>
        )}
      />

      <Pressable
        style={[styles.addButton, { borderColor: tintColor }]}
        onPress={() => router.push('/new')}
      >
        <ThemedText style={[styles.addButtonText, { color: tintColor }]}>
          + New note
        </ThemedText>
      </Pressable>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  link: {
    fontSize: 16,
  },
  noteCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  noteUser: {
    fontSize: 12,
    marginBottom: 6,
  },
  noteImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#e5e5e5',
  },
  noteContent: {
    fontSize: 14,
  },
  noteDate: {
    fontSize: 12,
    marginTop: 6,
  },
  addButton: {
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})