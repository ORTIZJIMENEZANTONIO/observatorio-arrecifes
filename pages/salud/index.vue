<template>
  <div>
    <CommonHeroSection compact :eyebrow="hero?.eyebrow" :title="hero?.title" :subtitle="hero?.subtitle" />

    <section class="section-padding-sm">
      <div class="container-wide space-y-8">
        <!-- Semáforo: indicadores generales ── mobile-first 2 cols → 4 -->
        <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <article
            v-for="indicator in indicators"
            :key="indicator.key"
            class="card p-4 md:p-5"
          >
            <div class="flex items-start justify-between">
              <div :class="['flex h-10 w-10 items-center justify-center rounded-xl', kpiIconBg(indicator.color)]">
                <Icon :name="indicator.icon" size="20" :class="kpiColor(indicator.color)" />
              </div>
              <span :class="['badge-' + indicator.color, 'text-[10px]']">{{ indicator.tag }}</span>
            </div>
            <p class="mt-3 text-2xl font-bold text-ink">{{ indicator.value }}</p>
            <p class="mt-0.5 text-xs font-medium uppercase tracking-wider text-ink-muted">
              {{ indicator.label }}
            </p>
            <p class="mt-2 text-xs text-slate-custom">{{ indicator.hint }}</p>
          </article>
        </div>

        <!-- Sub-páginas: cards grandes con narrativa por dominio -->
        <div>
          <SectionTitle eyebrow="Dimensiones" title="Salud por dominio" subtitle="Cada tarjeta abre un tablero con datos por arrecife, contexto y vínculo con la red." />
          <div class="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <NuxtLink
              v-for="dim in dimensions"
              :key="dim.to"
              :to="dim.to"
              class="card-interactive group block p-5"
              :data-track="`salud-${dim.slug}`"
            >
              <div :class="['mb-4 flex h-12 w-12 items-center justify-center rounded-xl', kpiIconBg(dim.color)]">
                <Icon :name="dim.icon" size="24" :class="kpiColor(dim.color)" />
              </div>
              <h3 class="font-display text-lg font-bold text-ink group-hover:text-primary">
                {{ dim.title }}
              </h3>
              <p class="mt-2 text-sm text-slate-custom">{{ dim.description }}</p>
              <div class="mt-4 flex items-center justify-between text-xs">
                <span class="text-ink-muted">{{ dim.metric }}</span>
                <span class="inline-flex items-center gap-1 font-medium text-primary">
                  Abrir
                  <Icon name="lucide:arrow-right" size="14" />
                </span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Banda explicativa ── por qué importa -->
        <article class="card-glass p-6 md:p-8">
          <div class="grid gap-6 md:grid-cols-3">
            <div>
              <Icon name="lucide:activity" size="28" class="text-coral" />
              <h4 class="mt-3 font-display text-base font-semibold text-ink">¿Por qué este tablero?</h4>
              <p class="mt-2 text-sm text-slate-custom">
                La salud de un arrecife no se reduce a un número. Esta sección integra los frentes
                que están actuando hoy y traduce el dato a una decisión accionable.
              </p>
            </div>
            <div>
              <Icon name="lucide:layers" size="28" class="text-primary" />
              <h4 class="mt-3 font-display text-base font-semibold text-ink">Cómo se construye</h4>
              <p class="mt-2 text-sm text-slate-custom">
                Combina NOAA Coral Reef Watch (térmico), NASA POWER (climatología), reportes
                validados de la red y registros institucionales (CONANP, CONAGUA).
              </p>
            </div>
            <div>
              <Icon name="lucide:scale" size="28" class="text-eco" />
              <h4 class="mt-3 font-display text-base font-semibold text-ink">A quién va dirigido</h4>
              <p class="mt-2 text-sm text-slate-custom">
                Buzos, pescadoras, tomadores de decisión y comunidades costeras. Cada tarjeta
                vincula con su <NuxtLink to="/policy" class="text-primary underline-offset-2 hover:underline">policy brief</NuxtLink>
                y con la red de colaboradores.
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useReefsStore } from '~/stores/reefs'
import { sctldReports, diseaseReports } from '~/data/disease-reports'
import { activeSites } from '~/data/restoration-sites'
import { invasiveReports } from '~/data/invasive-reports'
import { species } from '~/data/species'

const cms = useCmsContent('salud')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const { kpiColor, kpiIconBg, formatNumber } = useFormatters()
const reefs = useReefsStore()

const reefsWithSCTLD = computed(() => new Set(sctldReports.map((r) => r.reefId)).size)
const reefsWithRestoration = computed(() => new Set(activeSites.map((s) => s.reefId)).size)
const totalCaptured = computed(() => invasiveReports.reduce((acc, r) => acc + r.captured, 0))
const speciesCount = computed(() => species.filter((s) => (s.visible ?? true) && !(s.archived ?? false)).length)

const indicators = computed(() => [
  {
    key: 'sctld',
    icon: 'lucide:biohazard',
    color: 'alert',
    tag: 'SCTLD',
    value: `${reefsWithSCTLD.value} / ${reefs.totalCount}`,
    label: 'Arrecifes con reportes',
    hint: 'Casos verificados de pérdida de tejido coralino activos en el SAM y golfo.',
  },
  {
    key: 'bleach',
    icon: 'lucide:thermometer-sun',
    color: 'coral',
    tag: 'NOAA CRW',
    value: formatNumber(reefs.publicReefs.filter((r) => r.bleachingAlert && r.bleachingAlert !== 'no_stress').length),
    label: 'Bajo vigilancia térmica',
    hint: 'Arrecifes en watch / warning / alert según el último DHW reportado.',
  },
  {
    key: 'restoration',
    icon: 'lucide:sprout',
    color: 'eco',
    tag: 'Activos',
    value: `${reefsWithRestoration.value} sitios`,
    label: 'Programas de restauración',
    hint: 'Viveros y outplanting activos en operación documentada.',
  },
  {
    key: 'lionfish',
    icon: 'lucide:swords',
    color: 'accent',
    tag: '2024',
    value: formatNumber(totalCaptured.value),
    label: 'Pez león removido',
    hint: 'Acumulado en jornadas de cooperativas y CONANP en lo que va del año.',
  },
])

const dimensions = computed(() => [
  {
    to: '/salud/sctld',
    slug: 'sctld',
    icon: 'lucide:biohazard',
    color: 'alert',
    title: 'Enfermedad SCTLD',
    description:
      'Tablero del avance, severidad y tratamiento de la pérdida de tejido coralino por arrecife.',
    metric: `${sctldReports.length} reportes vigentes`,
  },
  {
    to: '/salud/blanqueamiento',
    slug: 'blanqueamiento',
    icon: 'lucide:thermometer-sun',
    color: 'coral',
    title: 'Blanqueamiento térmico',
    description:
      'DHW, SST y nivel NOAA CRW por arrecife, con ventana climatológica de riesgo.',
    metric: 'NOAA Coral Reef Watch · 5 km',
  },
  {
    to: '/salud/restauracion',
    slug: 'restauracion',
    icon: 'lucide:sprout',
    color: 'eco',
    title: 'Restauración coralina',
    description:
      'Viveros, especies producidas, transplante y tasa de supervivencia documentada.',
    metric: `${activeSites.length} sitios activos`,
  },
  {
    to: '/salud/especies',
    slug: 'especies',
    icon: 'lucide:fish',
    color: 'primary',
    title: 'Especies clave',
    description:
      'Corales formadores, peces estructurantes y megafauna con estatus IUCN y NOM-059.',
    metric: `${speciesCount.value} especies catalogadas`,
  },
  {
    to: '/salud/invasoras',
    slug: 'invasoras',
    icon: 'lucide:swords',
    color: 'accent',
    title: 'Especies invasoras',
    description:
      'Densidad, capturas y esfuerzo de control de pez león por arrecife y temporada.',
    metric: 'Datos por cooperativa',
  },
  {
    to: '/salud/sargazo',
    slug: 'sargazo',
    icon: 'lucide:leaf',
    color: 'secondary',
    title: 'Sargazo',
    description:
      'Arribazón, biomasa estimada e impacto cruzado con calidad de agua costera.',
    metric: 'NOAA SaWS · Riviera Maya',
  },
])

useHead({ title: 'Salud del arrecife · Observatorio de Arrecifes — México' })
</script>
