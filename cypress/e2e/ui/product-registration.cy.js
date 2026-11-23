describe('Cadastro de Produto', () => {
  context('when an admin registers a new product', () => {
    const timestamp = Date.now()
    const user = {
      email: `admin_prod_${timestamp}@qa.com`,
      password: 'teste123',
    }
    const product = {
      nome: `Produto ${timestamp}`,
      preco: '500',
      descricao: 'Descrição do produto de teste',
      quantidade: '10',
    }

    beforeEach(() => {
      cy.createUser({
        nome: `Admin Prod ${timestamp}`,
        email: user.email,
        password: user.password,
        administrador: 'true',
      })
      cy.loginViaAPI(user.email, user.password)
    })

    it('should create a product and display it in the listing', () => {
      cy.intercept('GET', '**/produtos').as('getProducts')
      cy.visit('/admin/cadastrarprodutos')
      cy.getBySel('nome').type(product.nome)
      cy.getBySel('preco').type(product.preco)
      cy.getBySel('descricao').type(product.descricao)
      cy.getBySel('quantity').type(product.quantidade)
      cy.getBySel('cadastarProdutos').click()
      cy.wait('@getProducts')
      cy.contains(product.nome).should('be.visible')
    })
  })
})
