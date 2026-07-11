import { bindingNotFound, defineRouteBindings, defineRoutes } from '@aerogel/plugin-routing';

import Sessions from '@/services/Sessions.ts';

import Home from './Home.vue';
import Inspector from './Inspector.vue';

export const bindings = defineRouteBindings({
    session(url) {
        return Sessions.all.find((session) => session.url === url) ?? bindingNotFound(url);
    },
});

export default defineRoutes([
    { name: 'home', path: '/', component: Home },
    { name: 'inspector', path: '/:session', component: Inspector },
]);
