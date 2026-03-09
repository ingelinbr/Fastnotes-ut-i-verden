import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useNotes } from '@/context/notes-context'
import { useThemeColor } from '@/hooks/use-theme-color'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native'

export default function AuthScreen() {
  const { signIn, signUp, session } = useNotes()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const borderColor = useThemeColor({}, 'border')
  const buttonColor = useThemeColor({}, 'button')

  useEffect(() => {
    if (session) {
      router.replace('/(tabs)')
    }
  }, [session])

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Email and password cannot be empty')
      return
    }

    const { error } = await signIn(email, password)
    if (error) {
      Alert.alert('Login failed', error.message)
      return
    }
  }

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Email and password cannot be empty')
      return
    }

    const { error } = await signUp(email, password)
    if (error) {
      Alert.alert('Signup failed', error.message)
      return
    }

    Alert.alert('Success', 'User created. You can now log in.')
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Cloud Note</ThemedText>

      <TextInput
        style={[styles.input, { borderColor }]}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={[styles.input, { borderColor }]}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={handleSignIn}
        >
          <ThemedText style={styles.buttonText}>Log in</ThemedText>
        </Pressable>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={handleSignUp}
        >
          <ThemedText style={styles.buttonText}>Sign up</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})