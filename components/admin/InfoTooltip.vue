<script setup lang="ts">
// Tooltip de información para términos técnicos del admin (snapshot, DHW, CHI,
// ZOFEMAT, NDBI, slug, prospect, tier, etc.). Funciona con hover en desktop y
// con tap en mobile. Auto-importado como `<AdminInfoTooltip>`.
//
// Uso típico:
//   <AdminInfoTooltip text="Captura del estado actual de los 12 arrecifes.">
//     Snapshot
//   </AdminInfoTooltip>
//
// O sin slot, sólo el icono `?` (típico junto a un label de form):
//   <AdminInfoTooltip text="..." />

defineProps<{
  text: string
  // 'inline' (default) — muestra el slot subrayado punteado seguido de un `?`.
  // 'icon' — sólo el icono `?` circular, sin texto contenedor.
  variant?: 'inline' | 'icon'
  // 'top' (default) | 'bottom' | 'right' — dirección de aparición.
  placement?: 'top' | 'bottom' | 'right'
  // Tamaño del icono en px (default 12).
  size?: number
}>()

const open = ref(false)
const triggerEl = ref<HTMLElement | null>(null)

// En mobile (no hover) toggleamos con click. En desktop el hover ya funciona
// vía clase `:hover`, pero también dejamos el click activo para usuarios con
// teclado / lectores.
const toggle = (e: MouseEvent) => {
  e.stopPropagation()
  open.value = !open.value
}

// Cierra al click fuera.
const onDocClick = (e: MouseEvent) => {
  if (!open.value) return
  if (triggerEl.value && !triggerEl.value.contains(e.target as Node)) {
    open.value = false
  }
}
onMounted(() => { document.addEventListener('click', onDocClick) })
onBeforeUnmount(() => { document.removeEventListener('click', onDocClick) })
</script>

<template>
  <span
    ref="triggerEl"
    class="info-tooltip group"
    :class="[
      `info-tooltip--${placement || 'top'}`,
      open ? 'info-tooltip--open' : '',
    ]"
    @click="toggle"
  >
    <slot v-if="variant !== 'icon'" />
    <Icon
      name="lucide:help-circle"
      :size="String(size ?? 12)"
      class="info-tooltip__icon"
      :class="variant === 'icon' ? 'ml-0' : 'ml-1'"
    />
    <span class="info-tooltip__bubble" role="tooltip">{{ text }}</span>
  </span>
</template>

<style scoped>
.info-tooltip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0;
  cursor: help;
}

/* Si hay texto contenedor (variant=inline), lo subrayamos discretamente para
   indicar al usuario que tiene info adicional. */
.info-tooltip:not(.info-tooltip--icon-only) {
  text-decoration: underline dotted;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  text-decoration-color: rgba(14, 116, 144, 0.45);
}

.info-tooltip__icon {
  color: rgb(100 116 139); /* slate-500 */
  transition: color 0.15s ease;
  flex-shrink: 0;
}
.info-tooltip:hover .info-tooltip__icon,
.info-tooltip--open .info-tooltip__icon {
  color: rgb(14 116 144); /* primary */
}

.info-tooltip__bubble {
  position: absolute;
  z-index: 50;
  width: max-content;
  max-width: 18rem;
  padding: 0.5rem 0.65rem;
  border-radius: 0.5rem;
  background: rgb(15 23 42); /* ink */
  color: rgb(255 255 255);
  font-size: 11px;
  font-weight: 400;
  line-height: 1.4;
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.35);
  white-space: normal;
  text-align: left;
  text-decoration: none;
  pointer-events: none;
  opacity: 0;
  transform: translateY(2px);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

/* Flechita */
.info-tooltip__bubble::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 5px solid transparent;
}

.info-tooltip:hover .info-tooltip__bubble,
.info-tooltip--open .info-tooltip__bubble {
  opacity: 1;
  transform: translateY(0);
}

/* ── Placement: top ── */
.info-tooltip--top .info-tooltip__bubble {
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translate(-50%, 2px);
}
.info-tooltip--top:hover .info-tooltip__bubble,
.info-tooltip--top.info-tooltip--open .info-tooltip__bubble {
  transform: translate(-50%, 0);
}
.info-tooltip--top .info-tooltip__bubble::before {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: rgb(15 23 42);
}

/* ── Placement: bottom ── */
.info-tooltip--bottom .info-tooltip__bubble {
  top: calc(100% + 6px);
  left: 50%;
  transform: translate(-50%, -2px);
}
.info-tooltip--bottom:hover .info-tooltip__bubble,
.info-tooltip--bottom.info-tooltip--open .info-tooltip__bubble {
  transform: translate(-50%, 0);
}
.info-tooltip--bottom .info-tooltip__bubble::before {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: rgb(15 23 42);
}

/* ── Placement: right ── */
.info-tooltip--right .info-tooltip__bubble {
  left: calc(100% + 6px);
  top: 50%;
  transform: translate(-2px, -50%);
}
.info-tooltip--right:hover .info-tooltip__bubble,
.info-tooltip--right.info-tooltip--open .info-tooltip__bubble {
  transform: translate(0, -50%);
}
.info-tooltip--right .info-tooltip__bubble::before {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: rgb(15 23 42);
}

@media (prefers-reduced-motion: reduce) {
  .info-tooltip__bubble {
    transition: opacity 0.05s linear;
    transform: none !important;
  }
}
</style>
