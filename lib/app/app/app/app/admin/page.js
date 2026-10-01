'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [photos, setPhotos] = useState([])
  const [items, setItems] = useState([])
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [year, setYear] = useState('')
  const [kind, setKind] = useState('drama')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const load = async () => {
    const a = await supabase.from('photos').select('*').order('year').order('created_at')
    const b = await supabase.from('wishlist').select('*').order('created_at')
    setPhotos(a.data || []); setItems(b.data || [])
  }
  useEffect(() => { if (session) load() }, [session])

  const login = async (e) => {
    e.preventDefault(); setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) setErr(error.message)
  }

  const upload = async (e) => {
    e.preventDefault()
    if (!file) return
    setBusy(true); setErr('')
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const up = await supabase.storage.from('photos').upload(path, file)
    if (up.error) { setErr(up.error.message); setBusy(false); return }
    const url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
    const ins = await supabase.from('photos').insert({ url, path, caption, year: year ? Number(year) : null })
    if (ins.error) setErr(ins.error.message)
    setFile(null); setCaption(''); setYear(''); e.target.reset()
    setBusy(false); load()
  }

  const delPhoto = async (p) => {
    await supabase.storage.from('photos').remove([p.path])
    await supabase.from('photos').delete().eq('id', p.id)
    load()
  }

  const addItem = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    await supabase.from('wishlist').insert({ kind, title: title.trim(), note: note.trim() || null })
    setTitle(''); setNote(''); load()
  }
  const toggle = async (x) => { await supabase.from('wishlist').update({ done: !x.done }).eq('id', x.id); load() }
  const delItem = async (x) => { await supabase.from('wishlist').delete().eq('id', x.id); load() }

  if (!ready) return <div className="admin">Loading…</div>

  if (!session)
    return (
      <div className="admin" style={{ maxWidth: 380 }}>
        <h2>Admin login 🔐</h2>
        <form onSubmit={login}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} required />
          <button className="btn" type="submit">Log in</button>
        </form>
        {err && <p style={{ color: '#c0396b' }}>{err}</p>}
      </div>
    )

  return (
    <div className="admin">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2>Admin 💜</h2>
        <button className="btn sm" onClick={() => supabase.auth.signOut()}>Log out</button>
      </div>
      {err && <p style={{ color: '#c0396b' }}>{err}</p>}

      <div className="card" style={{ margin: '16px 0' }}>
        <h3>Add a photo</h3>
        <form onSubmit={upload}>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required />
          <input placeholder="Year (e.g. 2012)" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
          <input placeholder="Caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
          <button className="btn" disabled={busy}>{busy ? 'Uploading…' : 'Upload'}</button>
        </form>
        <div className="gal" style={{ marginTop: 16 }}>
          {photos.map((p) => (
            <div key={p.id} className="ph" style={{ transform: 'none' }}>
              <img src={p.url} alt="" />
              <div className="cap">{[p.year, p.caption].filter(Boolean).join(' · ')}</div>
              <button className="btn sm" style={{ position: 'absolute', top: 6, right: 6 }} onClick={() => delPhoto(p)}>✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Watch & Read list</h3>
        <form onSubmit={addItem}>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="drama">K-drama</option>
            <option value="novel">Novel</option>
          </select>
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn">Add</button>
        </form>
        {items.map((x) => (
          <div key={x.id} className="item">
            <div className={x.done ? 'done' : ''}>{x.kind === 'drama' ? '📺' : '📚'} {x.title}{x.note && <small>{x.note}</small>}</div>
            <div className="row">
              <button className="btn sm" onClick={() => toggle(x)}>{x.done ? 'Undo' : 'Done'}</button>
              <button className="btn sm" onClick={() => delItem(x)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
    }
