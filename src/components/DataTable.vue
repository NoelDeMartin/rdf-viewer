<template>
    <div class="-mx-4 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg">
        <table class="relative min-w-full divide-y divide-gray-300">
            <thead>
                <tr>
                    <th
                        v-for="(column, index) in columns"
                        :key="column.field"
                        scope="col"
                        :class="
                            index === 0
                                ? 'py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6'
                                : 'px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                        "
                    >
                        {{ column.header }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in rows" :key="row.key">
                    <td
                        v-for="(cell, columnIndex) in row.cells"
                        :key="columnIndex"
                        :class="
                            columnIndex === 0
                                ? [
                                      rowIndex === 0 ? '' : 'border-t border-transparent',
                                      'relative py-4 pr-3 pl-4 text-sm sm:pl-6',
                                  ]
                                : [
                                      rowIndex === 0 ? '' : 'border-t border-gray-200',
                                      'px-3 py-3.5 text-sm text-gray-500',
                                  ]
                        "
                    >
                        <div v-if="columnIndex === 0" class="font-medium text-gray-900">
                            {{ cell }}
                        </div>
                        <template v-else>{{ cell }}</template>
                        <div
                            v-if="rowIndex !== 0 && columnIndex === 0"
                            class="absolute -top-px right-0 left-6 h-px bg-gray-200"
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts" generic="T">
import { computed, useSlots } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import DataTableColumn from './DataTableColumn.vue';

interface DataTableColumn {
    header: string;
    field: keyof T;
}

const { columns: columnsProp, items } = defineProps<{
    columns?: DataTableColumn[];
    items: T[];
}>();

const slots = useSlots();
const columnsSlots = computed(() => {
    const children = slots.default?.() ?? [];

    return children
        .filter((child) => child.type === DataTableColumn)
        .map((child) => {
            const childProps = child.props as ComponentProps<typeof DataTableColumn>;

            return {
                header: childProps.header,
                field: childProps.field,
            };
        });
});

const columns = computed(() => columnsProp ?? columnsSlots.value);
const rows = computed(() => {
    return items.map((item, index) => {
        return {
            key: index,
            cells: columns.value?.map((column) => item[column.field]) ?? [],
        };
    });
});
</script>
