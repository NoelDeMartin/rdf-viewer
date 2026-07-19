<template>
    <DataTable :items="predicates">
        <DataTableColumn header="Predicate" field="predicate" />
        <DataTableColumn header="Value" field="value" />
    </DataTable>
</template>

<script setup lang="ts">
import { SetPropertyOperation, UnsetPropertyOperation } from 'soukai-bis';
import { computed } from 'vue';

const { operations } = defineProps<{ operations: Array<SetPropertyOperation | UnsetPropertyOperation> }>();

const predicates = computed(() => {
    return operations.map((operation) => ({
        predicate: operation.property,
        value: operation instanceof SetPropertyOperation ? operation.value : 'DELETED',
    }));
});
</script>
