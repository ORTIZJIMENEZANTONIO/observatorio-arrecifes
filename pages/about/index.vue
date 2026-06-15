<template>
  <div>
    <CommonHeroSection compact>
      <div class="max-w-3xl">
        <span class="badge-coral mb-3 bg-white/15 text-white">{{ hero?.eyebrow }}</span>
        <h1 class="font-display text-3xl font-extrabold text-white md:text-5xl">
          {{ hero?.title }}
        </h1>
        <p class="mt-3 text-base text-white/80 md:text-lg">{{ hero?.subtitle }}</p>
      </div>
    </CommonHeroSection>

    <section class="section-padding-sm">
      <div class="container-narrow">
        <div class="prose prose-slate max-w-none">
          <h2 v-if="mission" id="mission" class="text-2xl font-bold text-ink">{{ mission.heading }}</h2>
          <p v-if="mission" class="whitespace-pre-line text-base text-slate-custom">{{ mission.body }}</p>

          <h2 v-if="vision" id="vision" class="mt-10 text-2xl font-bold text-ink">{{ vision.heading }}</h2>
          <p v-if="vision" class="whitespace-pre-line text-base text-slate-custom">{{ vision.body }}</p>

          <h2 v-if="objective" id="objective" class="mt-10 text-2xl font-bold text-ink">{{ objective.heading }}</h2>
          <p v-if="objective" class="whitespace-pre-line text-base text-slate-custom">{{ objective.body }}</p>

          <h2 id="inspiration" class="mt-10 text-2xl font-bold text-ink">Inspiraciones</h2>
          <ul class="text-base text-slate-custom">
            <li v-for="(item, idx) in inspirations" :key="idx">
              <strong>{{ item.title }}</strong> — {{ item.description }}
            </li>
          </ul>

          <h2 id="sources" class="mt-10 text-2xl font-bold text-ink">Jerarquía de fuentes</h2>
          <ol class="text-base text-slate-custom">
            <li v-for="(item, idx) in sources" :key="idx">
              <strong>{{ item.title }}</strong> — {{ item.description }}
            </li>
          </ol>

          <h2 v-if="team.length" id="team" class="mt-10 text-2xl font-bold text-ink">Equipo</h2>
          <div v-for="(person, idx) in team" :key="idx" class="mt-4 not-prose rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10">
            <p class="font-display text-lg font-semibold text-ink">{{ person.name }}</p>
            <p v-if="person.role" class="text-sm font-medium text-primary">{{ person.role }}</p>
            <p v-if="person.credentials" class="mt-3 whitespace-pre-line text-sm text-slate-custom">{{ person.credentials }}</p>
            <p v-if="person.bio" class="mt-3 whitespace-pre-line text-base text-slate-custom">{{ person.bio }}</p>
          </div>

          <h2 v-if="mediaCoverageIntro" id="media" class="mt-10 text-2xl font-bold text-ink">{{ mediaCoverageIntro.heading }}</h2>
          <p v-if="mediaCoverageIntro" class="whitespace-pre-line text-base text-slate-custom">{{ mediaCoverageIntro.body }}</p>
          <ul v-if="mediaCoverage.length" class="not-prose mt-3 flex flex-wrap gap-2">
            <li v-for="(outlet, idx) in mediaCoverage" :key="idx">
              <a
                :href="outlet.href"
                target="_blank"
                rel="noopener noreferrer"
                class="badge-primary inline-flex items-center gap-1.5 hover:bg-primary hover:text-white"
              >
                <Icon name="lucide:external-link" size="14" />
                {{ outlet.label }}
              </a>
            </li>
          </ul>

          <h2 v-if="reputationIntro" id="reputation" class="mt-10 text-2xl font-bold text-ink">
            {{ reputationIntro.heading }}
          </h2>
          <p v-if="reputationIntro" class="whitespace-pre-line text-base text-slate-custom">
            {{ reputationIntro.body }}
          </p>
          <table v-if="tiersTable.length" class="my-6 w-full text-sm">
            <thead class="bg-surface-cool">
              <tr>
                <th class="px-3 py-2 text-left">Modo</th>
                <th class="px-3 py-2 text-left">Umbral</th>
                <th class="px-3 py-2 text-left">Requisitos típicos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in tiersTable" :key="t.slug">
                <td class="border-t px-3 py-2 font-semibold" :class="t.slug === 'coral' ? 'text-coral-dark' : ''">
                  {{ t.label }}
                </td>
                <td class="border-t px-3 py-2">{{ formatTierRange(t) }}</td>
                <td class="border-t px-3 py-2">{{ t.requirements ?? '—' }}</td>
              </tr>
            </tbody>
          </table>

          <h2 id="validation" class="mt-10 text-2xl font-bold text-ink">Cómo se valida un aporte</h2>
          <ol class="text-base text-slate-custom">
            <li v-for="(item, idx) in validation" :key="idx">
              <strong>{{ item.title }}</strong> — {{ item.description }}
            </li>
          </ol>

          <h2 v-if="licenses" id="licenses" class="mt-10 text-2xl font-bold text-ink">
            {{ licenses.heading }}
          </h2>
          <p v-if="licenses" class="whitespace-pre-line text-base text-slate-custom">{{ licenses.body }}</p>

          <h2 v-if="contact" id="contact" class="mt-10 text-2xl font-bold text-ink">
            {{ contact.heading }}
          </h2>
          <p v-if="contact" class="whitespace-pre-line text-base text-slate-custom">
            {{ contact.body }}
            <NuxtLink to="/contribute" class="text-primary underline-offset-2 hover:underline">
              contribuir
            </NuxtLink>.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useTiersStore } from '~/stores/tiers'

const cms = useCmsContent('about')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')
const mission = cms.one<{ heading: string; body: string }>('mission')
const vision = cms.one<{ heading: string; body: string }>('vision')
const objective = cms.one<{ heading: string; body: string }>('objective')
const inspirations = cms.list<{ title: string; description: string }>('inspirations')
const sources = cms.list<{ title: string; description: string }>('sources')
const team = cms.list<{ name: string; role?: string; credentials?: string; bio?: string }>('team')
const mediaCoverageIntro = cms.one<{ heading: string; body: string }>('mediaCoverageIntro')
const mediaCoverage = cms.list<{ label: string; href: string }>('mediaCoverage')
const reputationIntro = cms.one<{ heading: string; body: string }>('reputationIntro')
const validation = cms.list<{ title: string; description: string }>('validation')
const licenses = cms.one<{ heading: string; body: string }>('licenses')
const contact = cms.one<{ heading: string; body: string }>('contact')

// La tabla de rangos se genera del store de tiers (editable en /admin/tiers).
const tiersStore = useTiersStore()
const tiersTable = computed(() => tiersStore.visibleTiers)

const formatTierRange = (t: { minScore: number; maxScore?: number | null }): string => {
  if (t.maxScore === null || t.maxScore === undefined) return `${t.minScore}+ pts`
  return `${t.minScore}–${t.maxScore} pts`
}
</script>

<style scoped>
.prose h2 {
  scroll-margin-top: 80px;
}
</style>
