const SEL = {
  emailInput: '#login-email',
  passwordInput: '#login-password',
  submitButton: 'button[type="submit"]',
  alertBanner: '[role="alert"]',
  navbar: 'header nav',
};

const VALID_EMAIL = Cypress.env('email');
const VALID_PASSWORD = Cypress.env('password');

describe('Login Page — E2E', () => {
  beforeEach(() => {
    cy.clearAuth();
    cy.visit('/login');
  });

  // Skenario 1: Halaman Login

  describe('Halaman login ditampilkan dengan benar', () => {
    it('harus menampilkan judul halaman, input email, input password, dan tombol submit', () => {
      // Assert
      cy.contains('h1', /selamat datang/i)
        .should('be.visible');

      cy.get(SEL.emailInput)
        .should('be.visible')
        .and('have.attr', 'type', 'email')
        .and('not.be.disabled');

      cy.get(SEL.passwordInput)
        .should('be.visible')
        .and('have.attr', 'type', 'password')
        .and('not.be.disabled');

      cy.get(SEL.submitButton)
        .should('be.visible')
        .and('contain.text', 'Masuk')
        .and('not.be.disabled');
    });

    it('harus menampilkan link navigasi ke halaman Register', () => {
      cy.contains('button', /daftar sekarang/i)
        .should('be.visible');
    });

    it('harus tidak menampilkan error apapun saat halaman pertama kali dibuka', () => {
      cy.get(SEL.alertBanner)
        .should('not.exist');
    });

    it('harus menampilkan error validasi jika form disubmit kosong', () => {
      // Act
      cy.get(SEL.submitButton).click();

      // Assert
      cy.contains(/email tidak boleh kosong/i)
        .should('be.visible');

      cy.contains(/password tidak boleh kosong/i)
        .should('be.visible');

      cy.url().should('include', '/login');
    });

    it('harus menampilkan error validasi format email yang tidak valid', () => {
      // Act
      cy.get(SEL.emailInput).type('bukan-format-email');
      cy.get(SEL.passwordInput).type('password123');
      cy.get(SEL.submitButton).click();

      // Assert
      cy.contains(/format email tidak valid/i)
        .should('be.visible');
    });
  });

  // Skenario 2: Login Gagal
  describe('Login gagal — menampilkan pesan error dari API', () => {
    it('harus menampilkan banner error saat password salah', () => {
      // Act
      cy.get(SEL.emailInput)
        .type(VALID_EMAIL);

      cy.get(SEL.passwordInput)
        .type('password-yang-salah-123!');

      cy.get(SEL.submitButton).click();

      // Assert
      cy.get(SEL.alertBanner, { timeout: 10000 })
        .should('be.visible')
        .and('not.be.empty');

      cy.url().should('include', '/login');
    });

    it('harus menampilkan banner error saat email tidak terdaftar', () => {
      // Act
      cy.get(SEL.emailInput)
        .type('emailyang@tidakterdaftar.com');

      cy.get(SEL.passwordInput)
        .type('sembarangpassword');

      cy.get(SEL.submitButton).click();

      // Assert
      cy.get(SEL.alertBanner, { timeout: 10000 })
        .should('be.visible');

      cy.url().should('include', '/login');
    });

    it('harus tetap berada di halaman login setelah login gagal', () => {
      // Act
      cy.get(SEL.emailInput).type('salah@email.com');
      cy.get(SEL.passwordInput).type('salahpassword');
      cy.get(SEL.submitButton).click();

      // Assert
      cy.url({ timeout: 10000 }).should('include', '/login');

      cy.get(SEL.emailInput).should('be.visible');
      cy.get(SEL.passwordInput).should('be.visible');
    });
  });

  // Skenario 3: Login Berhasil

  describe('Login berhasil — user diarahkan ke homepage', () => {
    it('harus redirect ke homepage setelah login dengan kredensial yang valid', () => {
      // Intercept
      cy.intercept('POST', '**/login').as('loginRequest');

      // Act
      cy.get(SEL.emailInput)
        .type(VALID_EMAIL);

      cy.get(SEL.passwordInput)
        .type(VALID_PASSWORD);

      cy.get(SEL.submitButton).click();

      // Assert 1: request ke API
      cy.wait('@loginRequest').then(({ response }) => {
        expect(response.statusCode).to.eq(200);
        expect(response.body.data).to.have.property('token');
      });

      // Assert 2: redirect ke homepage
      cy.url({ timeout: 10000 })
        .should('eq', `${Cypress.config('baseUrl')}/`);
    });

    it('harus menyimpan token ke localStorage setelah login berhasil', () => {
      // Act
      cy.get(SEL.emailInput).type(VALID_EMAIL);
      cy.get(SEL.passwordInput).type(VALID_PASSWORD);
      cy.get(SEL.submitButton).click();

      // Assert
      cy.url({ timeout: 10000 }).should('not.include', '/login');

      cy.window().then((win) => {
        const token = win.localStorage.getItem('token');
        expect(token).to.be.a('string');
        expect(token).to.have.length.greaterThan(10);
      });
    });

    it('harus menampilkan nama user di navbar setelah login berhasil', () => {
      // Act
      cy.get(SEL.emailInput).type(VALID_EMAIL);
      cy.get(SEL.passwordInput).type(VALID_PASSWORD);
      cy.get(SEL.submitButton).click();

      // Assert
      cy.url({ timeout: 10000 }).should('not.include', '/login');

      cy.get(SEL.navbar)
        .should('be.visible')
        .and('not.contain.text', 'Masuk');
    });

    it('harus redirect langsung ke homepage jika user sudah login saat mengunjungi /login', () => {
      cy.login();

      // Act
      cy.visit('/login');

      // Assert
      cy.url({ timeout: 10000 })
        .should('eq', `${Cypress.config('baseUrl')}/`);
    });

    it('harus menampilkan daftar thread di homepage setelah login berhasil', () => {
      // Act
      cy.get(SEL.emailInput).type(VALID_EMAIL);
      cy.get(SEL.passwordInput).type(VALID_PASSWORD);
      cy.get(SEL.submitButton).click();

      // Assert
      cy.url({ timeout: 10000 }).should('not.include', '/login');

      // Tunggu
      cy.get('article', { timeout: 15000 })
        .should('have.length.greaterThan', 0);
    });
  });

  // Skenario 4: Navigasi dari halaman login

  describe('Navigasi dari halaman login', () => {
    it('harus berpindah ke halaman Register saat link register diklik', () => {
      // Act
      cy.contains('button', /daftar sekarang/i).click();

      // Assert
      cy.url().should('include', '/register');

      cy.contains('h1', /buat akun baru/i)
        .should('be.visible');
    });
  });
});
