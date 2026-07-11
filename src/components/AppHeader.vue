<template>
    <header class="px-edge mx-auto flex w-full items-center justify-between gap-2 bg-gray-100 py-4">
        <h1>
            <Link route="home" class="text-2xl font-semibold tracking-tight">
                {{ $t('app.title') }}
            </Link>
        </h1>
        <div class="grow" />
        <ErrorLogs />
    </header>
</template>
