<template>
  <div>
    <CommonHeroSection compact :eyebrow="hero?.eyebrow" :title="hero?.title" :subtitle="hero?.subtitle" />

    <section class="section-padding-sm">
      <div class="container-narrow space-y-8">
        <article class="card p-6 md:p-8">
          <p class="text-xs font-medium uppercase tracking-wider text-coral-dark">APA 7</p>
          <p class="mt-3 text-base text-ink">
            <strong>Observatorio de Arrecifes — México.</strong> ({{ currentYear }}).
            <em>Observatorio de Arrecifes — México: plataforma viva de monitoreo de arrecifes coralinos mexicanos</em>
            [Conjunto de datos y software]. CIIEMAD–IPN.
            <a class="text-primary underline-offset-2 hover:underline" href="https://arrecifes.cercu.com.mx" target="_blank" rel="noopener">https://arrecifes.cercu.com.mx</a>
          </p>
          <button class="btn-outline btn-sm mt-4" :data-track="'cite-apa'" @click="copy(apaText)">
            <Icon name="lucide:clipboard-copy" size="14" /> {{ copyLabels.apa }}
          </button>
        </article>

        <article class="card p-6 md:p-8">
          <p class="text-xs font-medium uppercase tracking-wider text-primary">BibTeX</p>
          <pre class="mt-3 overflow-x-auto rounded-lg bg-surface-cool p-4 text-xs text-ink">{{ bibtex }}</pre>
          <button class="btn-outline btn-sm mt-4" :data-track="'cite-bibtex'" @click="copy(bibtex)">
            <Icon name="lucide:clipboard-copy" size="14" /> {{ copyLabels.bib }}
          </button>
        </article>

        <article class="card-glass p-6 md:p-8">
          <h3 class="font-display text-lg font-semibold text-ink">Acerca del DOI</h3>
          <p class="mt-2 text-sm text-slate-custom">
            Cada versión del observatorio se respalda como snapshot reproducible. El DOI
            persistente se asigna al primer release público vía Zenodo y se documenta abajo.
          </p>
          <div class="mt-4 grid gap-3 md:grid-cols-2">
            <div class="card p-4">
              <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">Versión actual</p>
              <p class="mt-1 text-sm font-semibold text-ink">v0.9 — pre-release</p>
              <p class="mt-1 text-xs text-ink-muted">DOI pendiente al cierre del piloto.</p>
            </div>
            <div class="card p-4">
              <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">Licencia</p>
              <p class="mt-1 text-sm font-semibold text-ink">Datos: CC BY 4.0 · Código: Apache 2.0</p>
              <p class="mt-1 text-xs text-ink-muted">Atribución obligatoria al proveedor original de cada capa.</p>
            </div>
          </div>
        </article>

        <article class="card p-6 md:p-8">
          <h3 class="font-display text-lg font-semibold text-ink">Citar una capa o un brief</h3>
          <p class="mt-2 text-sm text-slate-custom">
            Si tu publicación se basa en una capa específica (ej. NOAA CRW) o en un policy brief,
            cita la fuente primaria <em>y</em> al observatorio como compilador. Cada policy brief
            individual incluye su propia cita APA copiable.
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <NuxtLink to="/data-sources" class="btn-outline btn-sm">Catálogo de capas</NuxtLink>
            <NuxtLink to="/policy" class="btn-outline btn-sm">Policy briefs</NuxtLink>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const cms = useCmsContent('citar')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const currentYear = new Date().getFullYear()
const apaText = computed(
  () =>
    `Observatorio de Arrecifes — México. (${currentYear}). Observatorio de Arrecifes — México: plataforma viva de monitoreo de arrecifes coralinos mexicanos [Conjunto de datos y software]. CIIEMAD–IPN. https://arrecifes.cercu.com.mx`,
)
const bibtex = computed(
  () => `@misc{observatorio_arrecifes_mx_${currentYear},
  author       = {{Observatorio de Arrecifes — México}},
  title        = {Observatorio de Arrecifes — México: plataforma viva de monitoreo de arrecifes coralinos mexicanos},
  year         = ${currentYear},
  publisher    = {CIIEMAD–IPN},
  url          = {https://arrecifes.cercu.com.mx}
}`,
)

const copyLabels = reactive({ apa: 'Copiar APA', bib: 'Copiar BibTeX' })
const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    if (text === apaText.value) {
      copyLabels.apa = '¡Copiada!'
      setTimeout(() => (copyLabels.apa = 'Copiar APA'), 1800)
    } else {
      copyLabels.bib = '¡Copiado!'
      setTimeout(() => (copyLabels.bib = 'Copiar BibTeX'), 1800)
    }
  } catch {
    /* noop */
  }
}

useHead({ title: 'Cómo citar · Observatorio de Arrecifes' })
</script>
