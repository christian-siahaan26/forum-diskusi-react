Cypress.Commands.add('login', () => {
  cy.request({
    method: 'POST',
    url: 'https://forum-api.dicoding.dev/v1/login',
    body: {
      email: Cypress.env('email'),
      password: Cypress.env('password'),
    },
  }).then(({ body }) => {
    window.localStorage.setItem('token', body.data.token);
  });
});

Cypress.Commands.add('clearAuth', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});
