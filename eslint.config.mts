import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
// import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  // Configuração básica de arquivos e globais
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Adicione node se estiver usando no backend
      },
    },
  },

  // Regras recomendadas do JavaScript
  js.configs.recommended,

  // Regras recomendadas do TypeScript
  ...tseslint.configs.recommended,

  // 2. Adicione o Prettier por último
  // Isso ativa o eslint-plugin-prettier e o eslint-config-prettier ao mesmo tempo
  eslintPluginPrettierRecommended,

  // Se você precisar customizar alguma regra específica, faça aqui:
  {
    rules: {
      'prettier/prettier': 'error', // Força erros de formatação a aparecerem no ESLint
      // "no-unused-vars": "warn"
    },
  },
];
