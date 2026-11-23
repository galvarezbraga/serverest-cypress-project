describe('Cadastro de Usuário', () => {
  context('when registering a new user via the public form', () => {
    const timestamp = Date.now()
    const user = {
      nome: `User ${timestamp}`,
      email: `user_${timestamp}@qa.com`,
      password: 'teste123',
    }

    it('should register successfully and redirect to the login page', () => {
      cy.visit('/cadastrarusuarios')
      cy.getBySel('nome').type(user.nome)
      cy.getBySel('email').type(user.email)
      cy.getBySel('password').type(user.password)
      cy.getBySel('checkbox').check()
      cy.getBySel('cadastrar').click()
      cy.url().should('include', '/admin/home')
      cy.contains(user.nome).should('be.visible')
    })
  })
})
