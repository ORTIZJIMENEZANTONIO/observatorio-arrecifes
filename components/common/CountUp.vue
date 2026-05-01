<template>
  <span>{{ formatted }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCountUp } from '~/composables/useCountUp'

// Componente CountUp universal: anima un número de 0 al `value` con easeOutExpo.
// Permite formato personalizado vía `format` (ej. formatNumber, formatHectares),
// o cae a Intl.NumberFormat es-MX con `decimals`.
const props = withDefaults(
  defineProps<{
    value: number
    duration?: number
    delay?: number
    decimals?: number
    format?: (n: number) => string
    suffix?: string                  // ej. '%', 'k', 'sitios'
  }>(),
  { duration: 1500, delay: 0, decimals: 0 },
)

const target = computed(() => Number.isFinite(props.value) ? props.value : 0)
const { display } = useCountUp(target, { duration: props.duration, delay: props.delay })

const formatted = computed(() => {
  const n = display.value
  // Para decimals=0 redondeamos para evitar parpadeo de fracción durante la animación.
  const value = props.decimals === 0 ? Math.round(n) : n
  const base = props.format
    ? props.format(value)
    : value.toLocaleString('es-MX', {
        minimumFractionDigits: props.decimals ?? 0,
        maximumFractionDigits: props.decimals ?? 0,
      })
  return props.suffix ? `${base}${props.suffix}` : base
})
</script>
