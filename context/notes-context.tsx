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

const PAGE_SIZE = 5

type NotesContextType = {
  session: Session | null
  notes: Note[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  fetchNotes: () => Promise<void>
  loadMoreNotes: () => Promise<void>
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
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const fetchNotes = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      throw userError
    }

    if (!user) {
      setNotes([])
      setPage(0)
      setHasMore(false)
      return
    }

    const start = 0
    const end = PAGE_SIZE - 1

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(start, end)

    if (error) {
      throw error
    }

    const fetchedNotes = data ?? []

    setNotes(fetchedNotes)
    setPage(1)
    setHasMore(fetchedNotes.length === PAGE_SIZE)
  }

  const loadMoreNotes = async () => {
    if (loadingMore || !hasMore) return

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      throw userError
    }

    if (!user) {
      setHasMore(false)
      return
    }

    try {
      setLoadingMore(true)

      const start = page * PAGE_SIZE
      const end = start + PAGE_SIZE - 1

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
        .range(start, end)

      if (error) {
        throw error
      }

      const newNotes = data ?? []

      setNotes((prev) => [...prev, ...newNotes])
      setPage((prev) => prev + 1)
      setHasMore(newNotes.length === PAGE_SIZE)
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)

      try {
        if (data.session) {
          await fetchNotes()
        } else {
          setNotes([])
          setHasMore(false)
          setPage(0)
        }
      } finally {
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)

      try {
        if (newSession) {
          await fetchNotes()
        } else {
          setNotes([])
          setHasMore(false)
          setPage(0)
        }
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
    const { error } = await supabase.from('notes').delete().eq('id', id)

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
        loadingMore,
        hasMore,
        fetchNotes,
        loadMoreNotes,
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