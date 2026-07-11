import { defineSchema } from 'soukai-bis';
import { z } from 'zod';

export default defineSchema({
    fields: {
        date: z.date(),
        source: z.string(),
    },
});
