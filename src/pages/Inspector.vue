<template>
    <Page class="mx-0 max-w-none! justify-center">
        <Select v-model="resource" :options="resources" :render-option="renderResourceLabel" />

        <pre v-if="resource">{{ JSON.stringify(resource, null, 2) }}</pre>
    </Page>
</template>

<script setup lang="ts">
import { computedAsync } from '@aerogel/core';
import { expandIRI, formatJsonLD, quadsToJsonLD, SolidStore, turtleToQuads } from '@noeldemartin/solid-utils';
import type { JsonLD } from '@noeldemartin/solid-utils';
import { arrayFrom, arrayUnique, objectFromEntries, required } from '@noeldemartin/utils';
import { ref, toRaw, watch } from 'vue';

import type Session from '@/models/Session';

const { session } = defineProps<{ session: Session }>();
const store = computedAsync(async () => {
    const quads = await turtleToQuads(session.source, { baseIRI: 'solid://anonymous' });

    return quads && new SolidStore(quads);
});
const resource = ref<JsonLD | undefined>();
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

    return subjects
        .filter(
            (subject) =>
                !computedStore.statement(subject, 'rdf:type', 'crdt:Metadata') &&
                !computedStore.statement(subject, 'rdf:type', 'crdt:SetPropertyOperation') &&
                !computedStore.statement(subject, 'rdf:type', 'crdt:UnSetPropertyOperation'),
        )
        .map((subject) => {
            const resource = required(resourcesMap[subject]);
            const metadata = allResources.find(
                (resource) =>
                    resource['@type'] === expandIRI('crdt:Metadata') &&
                    Object(resource[expandIRI('crdt:resource')])['@id'] === subject,
            );
            const operations = allResources.filter(
                (resource) =>
                    (resource['@type'] === expandIRI('crdt:SetPropertyOperation') ||
                        resource['@type'] === expandIRI('crdt:UnSetPropertyOperation')) &&
                    Object(resource[expandIRI('crdt:resource')])['@id'] === subject,
            );

            if (metadata) {
                resource['metadata'] = metadata;
            }

            if (operations.length > 0) {
                resource['operations'] = operations;
            }

            return resource;
        });
});

function renderResourceLabel(resource: JsonLD) {
    const id = (Object(resource)['@id'] ?? '').replace('solid://anonymous', '');
    const types = arrayFrom(Object(resource)['@type'])?.join(', ') ?? '';

    return `${id} (${types})`;
}

watch(resources, () => {
    if (resource.value || !resources.value) {
        return;
    }

    resource.value = resources.value.find((resource) => resource['@id']?.endsWith('#it')) ?? resources.value[0];
});
</script>
