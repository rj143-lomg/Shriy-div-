'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Book() {
  const [photos, setPhotos] = useState([])
  const [items, setItems] = useState([])

  useEffect(() => {
    supabase.from('photos').select('*').order('year').order('created_at').then(({ data }) => setPhotos(data || []))
    supabase.from('wishlist').select('*').order('created_at').then(({ data }) => setItems(data || []))
  }, [])
  return (
    <div className="book">
      <style>{`
        .book{max-width:760px;margin:0 auto;padding:24px 16px 60px;text-align:center}
        .book .pg{break-inside:avoid;margin:28px 0}
        .book img{width:100%;max-height:520px;object-fit:contain;border-radius:16px}
        .book .bar{position:sticky;top:0;padding:10px;z-index:5}
        @media print{.bar{display:none}body{background:#fff}}
      `}</style>

      <div className="bar">
        <button className="btn" onClick={() => window.print()}>Save as PDF 📄</button>
      </div>

      <h1>Shriya's Memory Book 💜</h1>
      <p className="sub">Happy Birthday, 2nd October 2026</p>

      <div className="card" style={{ margin: '24px auto' }}>
        <p style={{ fontSize: '1.15rem', lineHeight: 1.7 }}>
          Happyyyyyyy birthday shruuuuuuuu... I can't get a better sis in my life than you 😭💜
        </p>
      </div>

      {photos.map((p) => (
        <div key={p.id} className="pg">
          <img src={p.url} alt={p.caption || 'memory'} />
          <p>{[p.year, p.caption].filter(Boolean).join(' · ')}</p>
        </div>
      ))}

      {items.length > 0 && (
        <div className="pg">
          <h2>Shru's Watch & Read list 📺📚</h2>
          {items.map((x) => (
            <p key={x.id}>
              {x.kind === 'drama' ? '📺' : '📚'} {x.title} {x.done ? '✅' : ''}
              {x.note ? ` — ${x.note}` : ''}
            </p>
          ))}
        </div>
      )}
    </div>
  )
  }
