import { createApp } from 'vue';
import App from './components/App.vue';
import VNetworkGraph from 'v-network-graph';

createApp(App).use(VNetworkGraph).mount('#app');
