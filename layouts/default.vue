<template>
  <div class="flex min-h-screen flex-col bg-surface">
    <CommonAppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <CommonAppFooter />
  </div>
</template>

<script setup lang="ts"></script>
