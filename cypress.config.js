// cypress.config.js
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',
    supportFile: 'cypress/support/commands.js',

    // Timeout lebih panjang untuk antisipasi API Dicoding yang kadang lambat
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,

    // Rekam video hanya saat CI — matikan lokal agar lebih cepat
    video: false,

    // Screenshot otomatis saat test gagal
    screenshotOnRunFailure: true,
  },
});
