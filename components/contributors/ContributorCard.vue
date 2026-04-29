<template>
  <article class="card-interactive group relative overflow-hidden p-5 pt-6">
    <!-- Tier accent stripe arriba — premium signature -->
    <div :class="['absolute inset-x-0 top-0 h-1', `tier-accent-${tier}`]" />

    <div class="flex items-start gap-4">
      <div class="relative shrink-0">
        <!-- Avatar con tier ring (premium) -->
        <div :class="['rounded-full p-[2px]', `tier-ring-${tier}`]">
          <div class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white">
            <img
              v-if="contributor.avatarUrl"
              :src="contributor.avatarUrl"
              :alt="contributor.displayName"
              class="h-full w-full object-cover"
              loading="lazy"
              @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-secondary text-base font-bold text-white"
            >
              {{ initials }}
            </div>
          </div>
        </div>
        <span
          v-if="contributor.verified"
          class="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-eco text-white shadow-md ring-2 ring-white"
          title="Identidad verificada"
        >
          <Icon name="lucide:badge-check" size="14" />
        </span>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="truncate text-base font-semibold text-ink">{{ contributor.displayName }}</h3>
          <span :class="['inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', `tier-${tier}`]">
            <Icon :name="tierIcon" size="11" />
            {{ formatTier(tier) }}
          </span>
        </div>
        <p class="mt-0.5 truncate text-xs text-ink-muted">
          @{{ contributor.handle }}
          <span v-if="contributor.affiliation"> · {{ contributor.affiliation }}</span>
        </p>
        <p v-if="contributor.bio" class="mt-2 line-clamp-2 text-sm text-slate-custom">
          {{ contributor.bio }}
        </p>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Reputación</p>
        <p :class="['text-base font-bold', tier === 'coral' ? 'text-coral-dark' : 'text-primary']">
          {{ formatNumber(contributor.reputationScore) }}
        </p>
      </div>
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Validados</p>
        <p class="text-base font-bold text-eco-dark">{{ contributor.validatedContributions }}</p>
      </div>
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Calidad</p>
        <p class="text-base font-bold text-ink">{{ Math.round(Number(contributor.averageQuality) || 0) }}/100</p>
      </div>
    </div>

    <div v-if="badges.length" class="mt-3 flex flex-wrap gap-1.5">
      <span
        v-for="b in badges.slice(0, 3)"
        :key="b.id"
        class="inline-flex items-center gap-1 rounded-full bg-coral-50 px-2 py-0.5 text-[10px] font-semibold text-coral-dark"
        :title="b.description"
      >
        <Icon :name="b.icon || 'lucide:award'" size="11" />
        {{ b.label }}
      </span>
      <span
        v-if="badges.length > 3"
        class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-ink-muted"
      >
        +{{ badges.length - 3 }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Contributor, ContributorTier } from '~/types'

const props = defineProps<{ contributor: Contributor }>()
const { formatTier, formatNumber } = useFormatters()

const tier = computed<ContributorTier>(() => (props.contributor.tier as ContributorTier) || 'bronze')

const tierIcon = computed(() => {
  const map: Record<ContributorTier, string> = {
    bronze: 'lucide:shield',
    silver: 'lucide:shield-check',
    gold: 'lucide:medal',
    platinum: 'lucide:gem',
    coral: 'lucide:crown',
  }
  return map[tier.value] || 'lucide:shield'
})

const initials = computed(() =>
  props.contributor.displayName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)

const badges = computed(() => props.contributor.badges ?? [])
</script>
