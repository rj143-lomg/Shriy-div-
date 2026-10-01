'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const BITS = ['🌸', '🌷', '💜', '🌼', '✨', '🌺', '💮']
const MSG =
  "Happyyyyyyy birthday shruuuuuuuu... mujhe bas itna bolna hai kiiiiii yaar bas yaaaarrrrrrrrr, I can't get a better sis in my life than you 😭💜"
const BIRTHDAY = new Date(2026, 9, 2)

export default function Home() {
  const [photos, setPhotos] = useState([])
  const [items, setItems] = useState([])
  const [tab, setTab] = useState('drama')
  const [open, setOpen] = useState(null)
  const [left, setLeft] = useState(null)
  const [typed, setTyped] = useState('')
  const [gift, setGift] = useState(false)
  const [burst, setBurst] = useState(0)

  useEffect(() => {
    supabase.from('photos').select('*').order('year', { ascending: true }).order('created_at').then(({ data }) => setPhotos(data || []))
    supabase.from('wishlist').select('*').order('created_at').then(({ data }) => setItems(data || []))
  }, [])

  useEffect(() => {
    const t = () => setLeft(BIRTHDAY - new Date())
    t()
    const id = setInterval(t, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      setTyped(MSG.slice(0, ++i))
      if (i >= MSG.length) clearInterval(id)
    }, 45)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('show')),
      { threshold: 0.2 }
    )
    document.querySelectorAll('.reveal').forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [photos, items])

  const c = left > 0 ? { Days: Math.floor(left / 864e5), Hours: Math.floor(left / 36e5) % 24, Min: Math.floor(left / 6e4) % 60, Sec: Math.floor(left / 1e3) % 60 } : null
  const list = items.filter((x) => x.kind === tab)

  return (
    <>
      <div id="fall">
        {Array.from({ length: 22 + burst }).map((_, i) => (
          <span key={i} className="p" style={{ left: `${(i * 37) % 100}%`, fontSize: 14 + ((i * 7) % 20), animationDuration: `${8 + ((i * 3) % 10)}s`, animationDelay: `-${(i * 5) % 12}s` }}>
            {BITS[i % BITS.length]}
          </span>
        ))}
      </div>

      <section>
        <div className="big float">🌸💜🌸</div>
        <h1>Happy Birthday Shriya!</h1>
        <p className="sub">2nd October · Shru, this one's all for you 🎂</p>
        {c ? (
          <div className="count">{Object.entries(c).map(([k, v]) => <div key={k}><b>{v}</b>{k}</div>)}</div>
        ) : left !== null && <h2>It's your day! 🎉</h2>}
      </section>

      <section>
        <h2>A message for you</h2>
        <div className="card"><p style={{ fontSize: '1.2rem', lineHeight: 1.7, minHeight: '7em' }}>{typed}</p></div>
      </section>

      <section>
        <h2 className="reveal">Shriya's memory lane 📸</h2>
        {photos.length === 0 && <p className="sub reveal">Photos are coming soon 🌷</p>}
        <div className="gal reveal">
          {photos.map((p) => (
            <div key={p.id} className="ph" onClick={() => setOpen(p)}>
              <img src={p.url} alt={p.caption || 'memory'} loading="lazy" />
              <div className="cap">{[p.year, p.caption].filter(Boolean).join(' · ')}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="reveal">Shru's Watch & Read list 📺📚</h2>
        <div className="tabs reveal">
          <button className={`tab ${tab === 'drama' ? 'on' : ''}`} onClick={() => setTab('drama')}>K-dramas</button>
          <button className={`tab ${tab === 'novel' ? 'on' : ''}`} onClick={() => setTab('novel')}>Novels</button>
        </div>
        <div style={{ maxWidth: 560, width: '100%' }} className="reveal">
          {list.length === 0 && <p className="sub">Nothing here yet 🌸</p>}
          {list.map((x) => (
            <div key={x.id} className="item">
              <div className={x.done ? 'done' : ''}>{x.title}{x.note && <small>{x.note}</small>}</div>
              <span>{x.done ? '✅' : '⏳'}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>One last thing…</h2>
        <div className="float" style={{ fontSize: '5rem', cursor: 'pointer' }} onClick={() => { setGift(true); setBurst(40) }}>{gift ? '🎂' : '🎁'}</div>
        <p className="sub" style={{ maxWidth: 480 }}>
          {gift ? 'Wishing you endless cakes, brownies, cozy novels and K-dramas with the best endings. Borahae, Shru! 💜' : 'Tap the gift'}
        </p>
      </section>

      {open && (
        <div className="lb" onClick={() => setOpen(null)}>
          <img src={open.url} alt={open.caption || ''} />
          <p>{[open.year, open.caption].filter(Boolean).join(' · ')}</p>
        </div>
      )}
    </>
  )
}
