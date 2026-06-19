<template>
  <form @submit.prevent="submit()">
    <textarea class="w-full h-full" v-model="text"></textarea>
    <button type="submit">Submit</button>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { turtleToQuads } from '@noeldemartin/solid-utils';
import type { Quad } from '@rdfjs/types';
import { getLocationQueryParameter } from '@noeldemartin/utils';

const text = ref('');
const emits = defineEmits<{
  inspect: [quads: Quad[]];
}>();

// TODO loading & error handling
async function submit() {
  const graph = await turtleToQuads(text.value);

  emits('inspect', graph);
}

onMounted(async () => {
  const base64Graph = getLocationQueryParameter('graph');

  if (base64Graph) {
    const graph = await turtleToQuads(atob(base64Graph));

    emits('inspect', graph);
  }
});
</script>
