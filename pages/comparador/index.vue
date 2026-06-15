<template>
  <div>
    <CommonHeroSection compact :eyebrow="hero?.eyebrow" :title="hero?.title" :subtitle="hero?.subtitle" />

    <section class="section-padding-sm">
      <div class="container-wide space-y-6">
        <!-- Selector mobile-first: 3 selects -->
        <div class="card p-4 md:p-5">
          <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">Selecciona hasta 3 arrecifes</p>
          <div class="mt-3 grid gap-3 md:grid-cols-3">
            <div v-for="i in 3" :key="i" class="form-group">
              <label class="form-label">Arrecife {{ i }}</label>
              <select v-model.number="picks[i - 1]" class="select">
                <option :value="0">— ninguno —</option>
                <option v-for="r in reefs.publicReefs" :key="r.id" :value="r.id">{{ r.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Card por columna (mobile = stack, desktop = grid) -->
        <div v-if="selected.length" :class="['grid gap-4', selected.length === 1 ? '' : selected.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3']">
          <article v-for="reef in selected" :key="reef.id" class="card p-5">
            <div class="aspect-video overflow-hidden rounded-xl bg-surface-cool">
              <img v-if="reef.hero" :src="reef.hero" :alt="reef.name" class="h-full w-full object-cover" loading="lazy" />
            </div>
            <p class="mt-4 font-display text-base font-bold text-ink">{{ reef.name }}</p>
            <p class="text-xs text-ink-muted">{{ reef.state }} · {{ oceanLabel(reef.ocean) }}</p>

            <dl class="mt-4 space-y-2 text-sm">
              <div class="flex items-center justify-between border-t border-gray-100 pt-2">
                <dt class="text-ink-muted">Cobertura coral</dt>
                <dd class="font-semibold text-ink">{{ formatPercent(reef.liveCoralCover) }}</dd>
              </div>
              <div class="flex items-center justify-between border-t border-gray-100 pt-2">
                <dt class="text-ink-muted">Superficie</dt>
                <dd class="font-semibold text-ink">{{ formatHectares(reef.area) }}</dd>
              </div>
              <div class="flex items-center justify-between border-t border-gray-100 pt-2">
                <dt class="text-ink-muted">Profundidad</dt>
                <dd class="font-semibold text-ink">{{ formatDepth(reef.depthRange) }}</dd>
              </div>
              <div class="flex items-center justify-between border-t border-gray-100 pt-2">
                <dt class="text-ink-muted">Protección</dt>
                <dd class="font-semibold text-ink">{{ formatProtection(reef.protection) }}</dd>
              </div>
              <div class="flex items-center justify-between border-t border-gray-100 pt-2">
                <dt class="text-ink-muted">Estatus</dt>
                <dd>
                  <span :class="['badge-primary text-[11px]', reefStatusBadgeClass(reef.status)]">
                    {{ formatReefStatus(reef.status) }}
                  </span>
                </dd>
              </div>
              <div class="flex items-center justify-between border-t border-gray-100 pt-2">
                <dt class="text-ink-muted">Especies clave</dt>
                <dd class="font-semibold text-ink">{{ speciesCount(reef.id) }}</dd>
              </div>
              <div class="flex items-center justify-between border-t border-gray-100 pt-2">
                <dt class="text-ink-muted">Sitios de restauración</dt>
                <dd class="font-semibold text-ink">{{ restorationCount(reef.id) }}</dd>
              </div>
              <div class="flex items-center justify-between border-t border-gray-100 pt-2">
                <dt class="text-ink-muted">Presión total</dt>
                <dd class="font-semibold text-ink">{{ pressureFor(reef.id) ?? '—' }}</dd>
              </div>
            </dl>

            <NuxtLink :to="`/livemap?reef=${reef.id}`" class="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline">
              Abrir en mapa <Icon name="lucide:arrow-up-right" size="12" />
            </NuxtLink>
          </article>
        </div>

        <div v-else class="card p-10 text-center">
          <Icon name="lucide:scale" size="32" class="mx-auto text-ink-muted" />
          <p class="mt-3 font-semibold text-ink">Selecciona arrecifes para comparar</p>
          <p class="text-sm text-ink-muted">Hasta 3, lado a lado.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useReefsStore } from '~/stores/reefs'
import { speciesByReef } from '~/data/species'
import { sitesByReef } from '~/data/restoration-sites'
import { indexByReef } from '~/data/pressure-index'
import type { Ocean } from '~/types'

const cms = useCmsContent('comparador')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const reefs = useReefsStore()
const {
  formatPercent,
  formatHectares,
  formatDepth,
  formatProtection,
  formatReefStatus,
  reefStatusBadgeClass,
} = useFormatters()

const picks = ref<number[]>([0, 0, 0])
const selected = computed(() =>
  picks.value.map((id) => reefs.findById(id)).filter((r): r is NonNullable<typeof r> => !!r),
)

const oceanLabel = (o: Ocean): string => ({ caribbean: 'Caribe', gulf_of_mexico: 'Golfo', pacific: 'Pacífico' }[o] ?? o)
const speciesCount = (id: number) => speciesByReef(id).length
const restorationCount = (id: number) => sitesByReef(id).filter((s) => s.active).length
const pressureFor = (id: number) => indexByReef(id)?.total ?? null

useHead({ title: 'Comparador · Observatorio de Arrecifes' })
</script>
