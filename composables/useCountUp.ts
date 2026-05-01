// Animación count-up genérica con easeOutExpo + respeto a reduced-motion.
// Devuelve `display` (ref<number>) que crece de 0 al `target` provisto.

import { ref, watch, onMounted, onBeforeUnmount, type MaybeRef, unref } from 'vue'

interface Options {
  duration?: number  // ms; default 1500
  delay?: number     // ms antes de iniciar
}

export const useCountUp = (target: MaybeRef<number>, options: Options = {}) => {
  const display = ref(0)
  let raf: number | null = null

  const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

  const start = () => {
    if (typeof window === 'undefined') {
      display.value = unref(target)
      return
    }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      display.value = unref(target)
      return
    }
    const duration = options.duration ?? 1500
    const delay = options.delay ?? 0
    const startTime = performance.now() + delay
    const goal = unref(target)
    display.value = 0
    const step = (now: number) => {
      if (now < startTime) {
        raf = requestAnimationFrame(step)
        return
      }
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / duration)
      display.value = goal * easeOutExpo(t)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
  }

  const stop = () => {
    if (raf !== null) {
      cancelAnimationFrame(raf)
      raf = null
    }
  }

  onMounted(start)

  watch(
    () => unref(target),
    () => {
      stop()
      start()
    },
  )

  onBeforeUnmount(stop)

  return { display, start, stop }
}
