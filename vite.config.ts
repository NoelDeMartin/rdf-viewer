import { defineConfig } from 'vite-plus';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import components from 'unplugin-vue-components/vite';
import icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/rdf-viewer/' : '/',
  plugins: [
    vue(),
    tailwindcss(),
    components({
        dts: 'src/types/components.d.ts',
        resolvers: [IconsResolver({ prefix: 'i' })],
    }),
    icons(),
  ],
  fmt: { semi: true, singleQuote: true },
  lint: { options: { typeAware: true, typeCheck: true } },
});
