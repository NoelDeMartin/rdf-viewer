import { defineServiceState } from '@aerogel/core';

import type Session from '@/models/Session';

export default defineServiceState({
    name: 'sessions',
    initialState: () => ({
        all: [] as Session[],
    }),
});
