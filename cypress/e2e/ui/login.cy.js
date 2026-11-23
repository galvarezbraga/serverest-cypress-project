describe('Login', () => {
  context('when an admin user logs in via UI', () => {
    let user

    beforeEach(() => {
      cy.createUser().then(({ data }) => {
        user = data
      })
    })

    it('should redirect to admin home and display the user name', () => {
      cy.visit('/login')
      cy.getBySel('email').type(user.email)
      cy.getBySel('senha').type(user.password)
      cy.getBySel('entrar').click()
      cy.url().should('include', '/admin/home')
      cy.contains(user.nome).should('be.visible')
    })
  })
})
