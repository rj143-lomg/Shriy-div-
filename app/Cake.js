'use client'
import { useState } from 'react'

export default function Cake() {
  const [lit, setLit] = useState([true, true, true, true, true])
  const out = lit.every((x) => !x)
  const blow = (i) => setLit((l) => l.map((v, j) => (j === i ? false : v)))
  const bits = ['🎉', '🌸', '💜', '✨', '🎊', '🌷']

  return (
    <section>
      <style>{`
        .candles{display:flex;gap:18px;justify-content:center;margin-bottom:-8px;position:relative;z-index:2}
        .candle{cursor:pointer;display:flex;flex-direction:column;align-items:center;width:34px}
        .flame{font-size:1.8rem;height:2.2rem;animation:flick .4s infinite alternate}
        .stick{width:10px;height:44px;border-radius:5px;background:linear-gradient(#ffd1e8,#ff8ec3)}
        .cakeEmoji{font-size:9rem;line-height:1}
        @keyframes flick{to{transform:scale(1.15) rotate(6deg)}}
        @keyframes cfall{to{transform:translateY(110vh) rotate(540deg)}}
        .cf{position:fixed;top:-40px;z-index:40;pointer-events:none;animation:cfall linear forwards}
      `}</style>
      <h2>Make a wish 🎂</h2>
      <p className="sub">{out ? 'Your wish is going to come true, Shru! Happy Birthday 💜' : 'Tap each candle to blow it out'}</p>
      <div className="candles">
        {lit.map((on, i) => (
          <div key={i} className="candle" onClick={() => blow(i)}>
            <span className="flame">{on ? '🔥' : ''}</span>
            <div className="stick" />
          </div>
        ))}
      </div>
      <div className="cakeEmoji float">🎂</div>
      {out &&
        Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="cf"
            style={{
              left: `${(i * 29) % 100}%`,
              fontSize: 20 + ((i * 5) % 18),
              animationDuration: `${3 + ((i * 7) % 4)}s`,
              animationDelay: `${(i % 8) * 0.2}s`,
            }}
          >
            {bits[i % bits.length]}
          </span>
        ))}
    </section>
  )
  }
