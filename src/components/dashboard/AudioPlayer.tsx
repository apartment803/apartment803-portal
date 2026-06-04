'use client'
import { useRef, useState, useEffect } from 'react'

export default function AudioPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0)
    const onLoad = () => setDuration(a.duration)
    const onEnd = () => { setPlaying(false); setProgress(0) }
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onLoad)
    a.addEventListener('ended', onEnd)
    return () => { a.removeEventListener('timeupdate', onTime); a.removeEventListener('loadedmetadata', onLoad); a.removeEventListener('ended', onEnd) }
  }, [])

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const a = audioRef.current
    if (!a) return
    playing ? a.pause() : a.play()
    setPlaying(!playing)
  }

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    const a = audioRef.current
    if (!a) return
    a.currentTime = (parseFloat(e.target.value) / 100) * a.duration
    setProgress(parseFloat(e.target.value))
  }

  const fmt = (s: number) => isNaN(s) ? '0:00' : `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`

  return (
    <div onClick={e => e.stopPropagation()} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#F0F0F0', border:'0.5px solid #E0E0E0', borderRadius:20, padding:'4px 12px 4px 4px' }}>
      <button onClick={toggle} style={{ width:26, height:26, borderRadius:'50%', background:'#1C1C1E', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {playing
          ? <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1.5" y="1" width="2.5" height="8" rx="0.5" fill="white"/><rect x="6" y="1" width="2.5" height="8" rx="0.5" fill="white"/></svg>
          : <svg width="10" height="10" viewBox="0 0 10 10"><polygon points="2.5,1 9,5 2.5,9" fill="white"/></svg>
        }
      </button>
      <input
        type="range" min={0} max={100} value={progress}
        onChange={seek}
        onClick={e => e.stopPropagation()}
        style={{ width:80, height:3, accentColor:'#1C1C1E', cursor:'pointer' }}
      />
      <span style={{ fontFamily:'monospace', fontSize:10, color:'#AEAEB2', minWidth:28 }}>
        {fmt(duration)}
      </span>
      <audio ref={audioRef} src={url} preload="metadata" />
    </div>
  )
}
