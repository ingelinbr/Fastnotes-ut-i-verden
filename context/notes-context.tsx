import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

export type Note = {
  id: string
  title: string
  content: string | null
  image_url: string | null
  user_id: string
  user_email: string | null
  created_at: string
  updated_at: string
}

type NotesContextType = {
  session: Session | null
  notes: Note[]
  loading: boolean
  fetchNotes: () => Promise<void>
  addNote: (title: string, content: string, imageUrl?: string | null) => Promise<void>
  updateNote: (id: string, title: string, content: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

export function NotesProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotes = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) throw userError

    if (!user) {
      setNotes([])
      return
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    setNotes(data ?? [])
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)

      try {
        if (data.session) {
          await fetchNotes()
        } else {
          setNotes([])
        }
      } catch (error) {
        console.log('FETCH NOTES ERROR:', error)
      } finally {
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)

      try {
        if (session) {
          await fetchNotes()
        } else {
          setNotes([])
        }
      } catch (error) {
        console.log('AUTH STATE CHANGE ERROR:', error)
      } finally {
        setLoading(false)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const addNote = async (title: string, content: string, imageUrl?: string | null) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) throw userError
    if (!user) throw new Error('Ingen innlogget bruker')

    const { error } = await supabase.from('notes').insert({
      title,
      content,
      image_url: imageUrl ?? null,
      user_id: user.id,
      user_email: user.email,
    })

    if (error) throw error

    await fetchNotes()
  }

  const updateNote = async (id: string, title: string, content: string) => {
    const { error } = await supabase
      .from('notes')
      .update({
        title,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error

    await fetchNotes()
  }

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) throw error

    await fetchNotes()
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <NotesContext.Provider
      value={{
        session,
        notes,
        loading,
        fetchNotes,
        addNote,
        updateNote,
        deleteNote,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const context = useContext(NotesContext)

  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider')
  }

  return context
}