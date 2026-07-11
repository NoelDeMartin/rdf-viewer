<template>
    <Page class="mx-0 max-w-none! justify-center">
        <Form :form class="mx-auto flex w-full max-w-2xl flex-col gap-4" @submit="submit()">
            <TextArea name="source" rows="10" class="w-full" placeholder="Enter your RDF here" />
            <Button submit class="w-full">Inspect</Button>
        </Form>

        <div v-if="$sessions.all.length > 0" class="mx-auto mt-8 flex w-full max-w-2xl flex-col gap-4 text-center">
            <h2 class="text-2xl font-bold">Previous Sessions</h2>
            <ul>
                <li v-for="session in $sessions.all" :key="session.url">
                    <Link route="inspector" :route-params="{ session: session.url }">
                        {{ session.date.toLocaleString() }}
                    </Link>
                </li>
            </ul>
        </div>
    </Page>
</template>

<script setup lang="ts">
import { requiredStringInput, useForm } from '@aerogel/core';
import { Router } from '@aerogel/plugin-routing';

import Session from '@/models/Session';

const form = useForm({
    source: requiredStringInput(),
});

async function submit() {
    const session = await Session.create({
        date: new Date(),
        source: form.source,
    });

    await Router.push({ name: 'inspector', params: { session: session.url } });
}
</script>
