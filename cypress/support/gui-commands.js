Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-testid=${selector}]`, ...args)
})

Cypress.Commands.add('loginViaUI', (email, password) => {
  cy.session(['loginUI', email, password], () => {
    cy.visit('/login')
    cy.getBySel('email').type(email)
    cy.getBySel('senha').type(password)
    cy.getBySel('entrar').click()
    cy.url().should('include', '/admin/home')
  })
})

Cypress.Commands.add('loginViaAPI', (email, password) => {
  cy.session(['loginAPI', email, password], () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.expose('apiUrl')}/login`,
      body: { email, password }
    }).then(({ body }) => {
      window.localStorage.setItem('serverest/userToken', body.authorization)
    })
  })
})
