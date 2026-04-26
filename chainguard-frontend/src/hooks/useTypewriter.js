import { useState, useEffect } from 'react'

export function useTypewriter(text, speed = 28, startDelay = 0) {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    if (!text) { setDisplayed(''); setIsDone(true); return }
    setDisplayed('')
    setIsDone(false)

    let index = 0
    let interval
    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        if (index < text.length) {
          setDisplayed(text.slice(0, index + 1))
          index++
        } else {
          setIsDone(true)
          clearInterval(interval)
        }
      }, speed)
    }, startDelay)

    return () => {
      clearTimeout(startTimer)
      if (interval) clearInterval(interval)
    }
  }, [text, speed, startDelay])

  return { displayed, isDone }
}
