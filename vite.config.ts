import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages 把站台放在 https://<user>.github.io/<repo>/ 底下，
  // 打包（與 preview 這份打包結果）時要帶上 repo 名稱；dev server 仍然是根路徑。
  base: command === 'build' || isPreview ? '/where-to-travel/' : '/',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
  },
}));
