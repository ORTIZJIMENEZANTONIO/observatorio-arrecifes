<template>
  <div>
    <CommonHeroSection compact>
      <div class="max-w-3xl">
        <span class="badge-coral mb-3 bg-white/15 text-white">Red de colaboradores</span>
        <h1 class="font-display text-3xl font-extrabold text-white md:text-5xl">Quienes alimentan la plataforma</h1>
        <p class="mt-3 text-base text-white/80 md:text-lg">
          Pescadores, buzos, investigadoras, comunidades costeras. Sistema de reputación
          inspirado en marketplaces: tu rango sube con cada aporte validado.
        </p>
      </div>
    </CommonHeroSection>

    <!-- Tier ladder -->
    <section class="section-padding-sm">
      <div class="container-wide">
        <CommonSectionTitle
          tag="Reputación"
          title="Cómo escalas en la red"
          subtitle="Cada validación de un revisor suma puntos. La calidad y la consistencia (meses activos) pesan más que el volumen."
        />
        <div class="grid gap-3 md:grid-cols-5">
          <article
            v-for="(t, key) in tierConfig"
            :key="key"
            :class="['card p-4 border', `tier-${key}`]"
          >
            <Icon :name="tierIcon(key)" size="20" />
            <h3 class="mt-2 text-base font-bold">{{ t.label }}</h3>
            <p class="mt-1 text-xs leading-relaxed">{{ t.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Filters + Leaderboard -->
    <section class="section-padding-sm">
      <div class="container-wide">
        <div class="card mb-6 p-4 md:p-5">
          <div class="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div class="input-icon-wrapper">
              <Icon name="lucide:search" size="16" class="input-icon" />
              <input v-model="store.search" type="search" class="input" placeholder="Buscar por nombre, handle o afiliación…" />
            </div>
            <select v-model="store.filterRole" class="select">
              <option value="all">Todos los roles</option>
              <option value="researcher">Investigador/a</option>
              <option value="student">Estudiante</option>
              <option value="diver">Buzo</option>
              <option value="fisher">Pescador/a</option>
              <option value="tour_operator">Operador turístico</option>
              <option value="citizen">Ciudadano/a</option>
              <option value="ngo">ONG</option>
              <option value="institution">Institución</option>
              <option value="government">Gobierno</option>
            </select>
            <select v-model="store.filterTier" class="select">
              <option value="all">Todos los rangos</option>
              <option value="bronze">Bronce</option>
              <option value="silver">Plata</option>
              <option value="gold">Oro</option>
              <option value="platinum">Platino</option>
              <option value="coral">Coral</option>
            </select>
          </div>
        </div>

        <CommonSectionTitle title="Top de la red" subtitle="Ordenado por reputación." />
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ContributorsContributorCard v-for="c in sorted" :key="c.id" :contributor="c" />
        </div>

        <div v-if="!sorted.length" class="py-16 text-center">
          <Icon name="lucide:user-x" size="40" class="mx-auto text-ink-muted/40" />
          <p class="mt-3 text-sm text-ink-muted">No se encontraron colaboradores con esos filtros.</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section-padding-sm">
      <div class="container-wide">
        <div class="card-glass relative overflow-hidden p-8 md:p-12">
          <div class="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 class="text-2xl font-bold text-ink md:text-3xl">¿Quieres formar parte de la red?</h2>
              <p class="mt-3 text-sm text-slate-custom">
                Registra una observación, aporta una imagen satelital, sube un transecto o reporta una problemática.
                Tu primer aporte validado abre tu perfil público.
              </p>
            </div>
            <div class="flex flex-wrap gap-3 md:justify-end">
              <NuxtLink to="/contribute" class="btn-coral btn-lg">
                <Icon name="lucide:plus" size="18" />
                Empezar a contribuir
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useContributorsStore } from '~/stores/contributors'
import { tierConfig } from '~/data/contributors'
import type { ContributorTier } from '~/types'

const store = useContributorsStore()

const sorted = computed(() => [...store.filtered].sort((a, b) => b.reputationScore - a.reputationScore))

const tierIcon = (key: ContributorTier | string): string => {
  const map: Record<string, string> = {
    bronze: 'lucide:medal',
    silver: 'lucide:award',
    gold: 'lucide:trophy',
    platinum: 'lucide:crown',
    coral: 'lucide:sparkles',
  }
  return map[key] ?? 'lucide:shield'
}
</script>
