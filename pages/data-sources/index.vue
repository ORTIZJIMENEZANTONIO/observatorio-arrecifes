<template>
  <div>
    <CommonHeroSection compact>
      <div class="max-w-3xl">
        <span class="badge-coral mb-3 bg-white/15 text-white">{{ hero?.eyebrow }}</span>
        <h1 class="font-display text-3xl font-extrabold text-white md:text-5xl">{{ hero?.title }}</h1>
        <p class="mt-3 text-base text-white/80 md:text-lg">{{ hero?.subtitle }}</p>
      </div>
    </CommonHeroSection>

    <section class="section-padding-sm">
      <div class="container-wide">
        <CommonFilterPanel
          v-model:search-query="store.search"
          search-placeholder="Buscar capa, proveedor o tema…"
          :active-count="store.activeFilterCount"
          :total="store.layers.length"
          :filtered="store.filtered.length"
          class="mb-6"
          @clear="store.resetFilters()"
        >
          <div class="form-group !mb-0">
            <label class="form-label">Categoría</label>
            <select v-model="store.filterCategory" class="select">
              <option value="all">Toda categoría</option>
              <option value="thermal_stress">Estrés térmico</option>
              <option value="benthic_habitat">Hábitat bentónico</option>
              <option value="water_quality">Calidad del agua</option>
              <option value="protected_areas">Áreas protegidas</option>
              <option value="bathymetry">Batimetría</option>
              <option value="land_use">Uso de suelo</option>
              <option value="fishing_pressure">Presión pesquera</option>
              <option value="community_observations">Aportes comunidad</option>
            </select>
          </div>
          <div class="form-group !mb-0">
            <label class="form-label">Proveedor</label>
            <select v-model="store.filterProvider" class="select">
              <option value="all">Todos</option>
              <option value="nasa">NASA</option>
              <option value="noaa">NOAA</option>
              <option value="esa_copernicus">ESA Copernicus</option>
              <option value="usgs">USGS</option>
              <option value="conabio">CONABIO</option>
              <option value="conanp">CONANP</option>
              <option value="inegi">INEGI</option>
              <option value="allen_coral_atlas">Allen Coral Atlas</option>
              <option value="global_fishing_watch">Global Fishing Watch</option>
            </select>
          </div>
          <div class="form-group !mb-0">
            <label class="form-label">Formato</label>
            <select v-model="store.filterFormat" class="select">
              <option value="all">Cualquiera</option>
              <option v-for="f in store.formats" :key="f" :value="f">{{ f.toUpperCase() }}</option>
            </select>
          </div>
          <div class="form-group !mb-0">
            <label class="form-label">Cobertura</label>
            <select v-model="store.filterCoverage" class="select">
              <option value="all">Cualquiera</option>
              <option value="global">Global</option>
              <option value="regional">Regional</option>
              <option value="national">Nacional</option>
            </select>
          </div>
          <div class="form-group !mb-0">
            <label class="form-label">Licencia</label>
            <select v-model="store.filterLicense" class="select">
              <option value="all">Cualquiera</option>
              <option v-for="l in store.licenses" :key="l" :value="l">{{ l }}</option>
            </select>
          </div>
          <div class="form-group !mb-0 flex items-end">
            <label class="checkbox-label">
              <input v-model="store.filterLiveOnly" type="checkbox" class="checkbox" />
              Sólo capas Live (con WMS / tile renderizable)
            </label>
          </div>
        </CommonFilterPanel>

        <!-- Layer cards -->
        <div class="grid gap-5 md:grid-cols-2">
          <article v-for="layer in store.filtered" :key="layer.id" class="card p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-primary">{{ layer.providerLabel }}</p>
                <h3 class="mt-1 text-lg font-bold text-ink">{{ layer.title }}</h3>
              </div>
              <span :class="`badge ${layer.active ? 'badge-eco' : 'bg-gray-100 text-ink-muted'}`">
                {{ layer.active ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
            <p class="mt-3 text-sm leading-relaxed text-slate-custom">{{ layer.description }}</p>

            <div class="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-xs sm:grid-cols-4">
              <div>
                <p class="text-[10px] uppercase tracking-wider text-ink-muted">Resolución</p>
                <p class="font-semibold text-ink">{{ layer.resolution ?? '—' }}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wider text-ink-muted">Cadencia</p>
                <p class="font-semibold text-ink">{{ layer.cadence ?? '—' }}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wider text-ink-muted">Formato</p>
                <p class="font-mono font-semibold text-ink">{{ layer.format.toUpperCase() }}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wider text-ink-muted">Cobertura</p>
                <p class="font-semibold text-ink capitalize">{{ layer.coverage }}</p>
              </div>
            </div>

            <div class="mt-4 rounded-xl bg-surface-cool p-3 text-xs">
              <p class="font-bold text-ink-muted">Atribución requerida</p>
              <p class="mt-1 italic leading-relaxed text-ink-light">{{ layer.attribution }}</p>
              <p class="mt-2 text-[10px] font-semibold uppercase tracking-wider text-eco-dark">{{ layer.license }}</p>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <a :href="layer.sourceUrl" target="_blank" rel="noopener noreferrer" class="btn-outline btn-sm">
                <Icon name="lucide:external-link" size="14" />
                Sitio del proveedor
              </a>
              <a v-if="layer.downloadUrl" :href="layer.downloadUrl" target="_blank" rel="noopener noreferrer" class="btn-primary btn-sm">
                <Icon name="lucide:download" size="14" />
                Descargar
              </a>
            </div>
          </article>
        </div>

        <div v-if="!store.filtered.length" class="py-16 text-center">
          <Icon name="lucide:database-off" size="40" class="mx-auto text-ink-muted/40" />
          <p class="mt-3 text-sm text-ink-muted">No se encontraron capas con esos filtros.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useLayersStore } from '~/stores/layers'
const store = useLayersStore()
const cms = useCmsContent('data-sources')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')
</script>
