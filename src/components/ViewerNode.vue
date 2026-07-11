<template>
  <circle :r="config.radius * scale * extraScale" :fill="config.color" :class="className" />
  <text v-if="subject">{{ subject.value }}</text>
</template>

<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue';
import type { CircleShapeStyle } from 'v-network-graph';
import type { NamedNode } from '@rdfjs/types';

const {
  scale,
  config,
  subject,
  class: className,
} = defineProps<{
  nodeId: string;
  scale: number;
  subject: NamedNode;
  config: CircleShapeStyle;
  class: HTMLAttributes['class'];
}>();

const extraScale = computed(() => subject.value === '#it' ? 2 : 1);
</script>
