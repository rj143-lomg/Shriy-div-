'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [photos, setPhotos] = useState([])
  const [items, setItems] = useState([])
  const [files, setFiles] = useState([])
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
    if (!files.length) return
    const form = e.target
    setBusy(true); setErr('')
    let failed = 0
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setMsg(`Uploading ${i + 1} of ${files.length}…`)
      const path = `${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const up = await supabase.storage.from('photos').upload(path, file)
      if (up.error) { failed++; setErr(up.error.message); continue }
      const url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
      const ins = await supabase.from('photos').insert({ url, path, caption: caption || null, year: year ? Number(year) : null })
      if (ins.error) { failed++; setErr(ins.error.message) }
    }
    setMsg(failed ? `Done, but ${failed} failed` : `All ${files.length} uploaded ✅`)
    setFiles([]); setCaption(''); setYear(''); form.reset()
    setBusy(false); load()
  }

  const updatePhoto = async (id, fields) => {
    await supabase.from('photos').update(fields).eq('id', id)
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
        <h3>Add photos (select many)</h3>
        <form onSubmit={upload}>
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files))} required />
          <p style={{ margin: '4px 0' }}>{files.length ? `${files.length} photo(s) selected` : ''}</p>
          <input placeholder="Year for all (optional)" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
          <input placeholder="Caption for all (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} />
          <button className="btn" disabled={busy}>{busy ? 'Uploading…' : 'Upload'}</button>
        </form>
        {msg && <p>{msg}</p>}
        <p style={{ opacity: 0.7, fontSize: '.9rem' }}>Tip: edit each photo's year and caption in the boxes below. They save when you tap outside the box.</p>
        <div className="gal" style={{ marginTop: 16 }}>
          {photos.map((p) => (
            <div key={p.id}>
              <div className="ph" style={{ transform: 'none' }}>
                <img src={p.url} alt="" />
                <button className="btn sm" style={{ position: 'absolute', top: 6, right: 6 }} onClick={() => delPhoto(p)}>✕</button>
              </div>
              <input type="number" placeholder="Year" defaultValue={p.year || ''} onBlur={(e) => updatePhoto(p.id, { year: e.target.value ? Number(e.target.value) : null })} />
              <input placeholder="Caption" defaultValue={p.caption || ''} onBlur={(e) => updatePhoto(p.id, { caption: e.target.value || null })} />
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
