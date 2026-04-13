// cypress/support/commands.js

// ─────────────────────────────────────────────────────────────────────────────
// cy.login()
//
// Login via API langsung (bypass UI) — dipakai di test yang tidak sedang
// menguji alur login itu sendiri. Jauh lebih cepat daripada mengisi form.
// ─────────────────────────────────────────────────────────────────────────────

Cypress.Commands.add('login', () => {
  cy.request({
    method: 'POST',
    url: 'https://forum-api.dicoding.dev/v1/login',
    body: {
      email: Cypress.env('email'),
      password: Cypress.env('password'),
    },
  }).then(({ body }) => {
    // Simpan token ke localStorage seperti yang dilakukan aplikasi
    window.localStorage.setItem('token', body.data.token);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// cy.clearAuth()
//
// Bersihkan sesi — dipanggil di beforeEach untuk isolasi antar test.
// ─────────────────────────────────────────────────────────────────────────────

Cypress.Commands.add('clearAuth', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});
