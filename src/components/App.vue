<template>
  <AppHeader />
  <main class="flex flex-col items-center justify-center h-screen">
    <Welcome v-if="!graph" @inspect="($event) => (graph = $event)" />
    <Viewer v-else :graph />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Quad } from '@rdfjs/types';

const graph = ref<Quad[] | null>(null);
</script>
