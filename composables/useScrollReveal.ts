interface ScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  stagger?: boolean
  once?: boolean
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const {
    threshold = 0.15,
    rootMargin = '0px 0px -60px 0px',
    stagger = false,
    once = true,
  } = options

  const revealRef = ref<HTMLElement | null>(null)

  onMounted(() => {
    const el = revealRef.value
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (stagger) {
              el.querySelectorAll('.reveal').forEach((child) => child.classList.add('is-visible'))
            } else {
              entry.target.classList.add('is-visible')
            }
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            if (stagger) {
              el.querySelectorAll('.reveal').forEach((child) => child.classList.remove('is-visible'))
            } else {
              entry.target.classList.remove('is-visible')
            }
          }
        }
      },
      { threshold, rootMargin },
    )

    if (stagger) {
      observer.observe(el)
    } else {
      const tokens = ['reveal', 'reveal-left', 'reveal-right', 'reveal-scale']
      if (tokens.some((t) => el.classList.contains(t))) observer.observe(el)
      el.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((child) =>
        observer.observe(child),
      )
    }

    onUnmounted(() => observer.disconnect())
  })

  return { revealRef }
}
