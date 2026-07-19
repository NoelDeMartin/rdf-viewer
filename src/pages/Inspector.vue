<template>
    <Page class="max-w-[1200px]! justify-center">
        <Select v-model="resource" :options="resources" :render-option="renderResourceLabel" />

        <template v-if="resource">
            <JsonLDTable :jsonld="resource.data" class="mt-8" />

            <h2 v-if="resource.metadata || resource.operations" class="mt-8 text-3xl font-bold">History</h2>

            <template v-if="resource.metadata">
                <p v-if="resource.metadata.createdAt" class="mt-2">
                    Created at: {{ formatDate(resource.metadata.createdAt) }}
                </p>
                <p v-if="resource.metadata.updatedAt">Updated at: {{ formatDate(resource.metadata.updatedAt) }}</p>
            </template>

            <template v-if="resource.operations">
                <div v-for="{ date, operations } in resource.operations" :key="date.getTime()">
                    <h3 class="mt-6 text-lg font-bold">{{ formatDate(date) }}</h3>
                    <OperationsTable :operations="operations" class="mt-4" />
                </div>
            </template>
        </template>
    </Page>
</template>

<script setup lang="ts">
import { computedAsync } from '@aerogel/core';
import { expandIRI, formatJsonLD, quadsToJsonLD, SolidStore, turtleToQuads } from '@noeldemartin/solid-utils';
import { arrayFrom, arraySorted, arrayUnique, isTruthy, objectFromEntries, required } from '@noeldemartin/utils';
import { Metadata, SetPropertyOperation, UnsetPropertyOperation } from 'soukai-bis';
import { ref, watch } from 'vue';

import type Session from '@/models/Session';
import { formatDate } from '@/utils/formatting';

const { session } = defineProps<{ session: Session }>();
const store = computedAsync(async () => {
    const quads = await turtleToQuads(session.source, { baseIRI: 'solid://anonymous' });

    return quads && new SolidStore(quads);
});
const resource = ref<NonNullable<typeof resources.value>[number] | undefined>();
const resources = computedAsync(async () => {
    const computedStore = store.value;

    if (!computedStore) {
        return;
    }

    const subjects = arrayUnique(computedStore.getQuads().map((quad) => quad.subject.value));
    const allResources = await Promise.all(
        subjects.map(async (subject) => {
            const jsonld = await quadsToJsonLD(
                computedStore.getQuads().filter((quad) => quad.subject.value === subject),
            );

            return formatJsonLD(jsonld, { resourceId: subject });
        }),
    );
    const resourcesMap = objectFromEntries(allResources.map((resource) => [required(resource['@id']), resource]));

    return await Promise.all(
        subjects
            .filter(
                (subject) =>
                    !computedStore.statement(subject, 'rdf:type', 'crdt:Metadata') &&
                    !computedStore.statement(subject, 'rdf:type', 'crdt:SetPropertyOperation') &&
                    !computedStore.statement(subject, 'rdf:type', 'crdt:UnSetPropertyOperation'),
            )
            .map(async (subject) => {
                const data = required(resourcesMap[subject]);
                const metadataJsonLD = allResources.find(
                    (resource) =>
                        resource['@type'] === expandIRI('crdt:Metadata') &&
                        Object(resource[expandIRI('crdt:resource')])['@id'] === subject,
                );
                const operationsJsonLD = allResources.filter(
                    (resource) =>
                        (resource['@type'] === expandIRI('crdt:SetPropertyOperation') ||
                            resource['@type'] === expandIRI('crdt:UnSetPropertyOperation')) &&
                        Object(resource[expandIRI('crdt:resource')])['@id'] === subject,
                );

                const metadata = metadataJsonLD && (await Metadata.createFromJsonLD(metadataJsonLD));
                const operations = (
                    await Promise.all(
                        operationsJsonLD.map((operation) => {
                            switch (operation['@type']) {
                                case expandIRI('crdt:SetPropertyOperation'):
                                    return SetPropertyOperation.createFromJsonLD(operation);
                                case expandIRI('crdt:UnSetPropertyOperation'):
                                    return UnsetPropertyOperation.createFromJsonLD(operation);
                            }
                        }),
                    )
                ).filter(isTruthy);

                const operationsByDate = {} as Record<number, Array<SetPropertyOperation | UnsetPropertyOperation>>;

                for (const operation of operations) {
                    const date = operation.date.getTime();

                    operationsByDate[date] ??= [];
                    operationsByDate[date].push(operation);
                }

                return {
                    data,
                    metadata,
                    operations: arraySorted(
                        Object.entries(operationsByDate).map(([date, operations]) => ({
                            date: new Date(Number(date)),
                            operations,
                        })),
                        'date',
                    ),
                };
            }),
    );
});

function renderResourceLabel(resource: NonNullable<typeof resources.value>[number]) {
    const id = (Object(resource.data)['@id'] ?? '').replace('solid://anonymous', '');
    const types = arrayFrom(Object(resource.data)['@type'])?.join(', ') ?? '';

    return `${id} (${types})`;
}

watch(resources, () => {
    if (resource.value || !resources.value) {
        return;
    }

    resource.value = resources.value.find((resource) => resource.data['@id']?.endsWith('#it')) ?? resources.value[0];
});
</script>
