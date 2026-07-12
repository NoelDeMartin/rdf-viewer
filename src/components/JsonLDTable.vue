<template>
    <DataTable :items="predicates">
        <DataTableColumn header="Predicate" field="predicate" />
        <DataTableColumn header="Value" field="value" />
    </DataTable>
</template>

<script setup lang="ts">
import type { JsonLD } from '@noeldemartin/solid-utils';
import { computed } from 'vue';

const { jsonld } = defineProps<{ jsonld: JsonLD }>();

const predicates = computed(() => {
    const { '@context': _, ...rest } = jsonld;

    return Object.entries(rest).map(([predicate, value]) => ({
        predicate,
        value,
    }));
});
</script>
