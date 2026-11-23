Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.expose('apiUrl')}/login`,
    body: { email, password }
  }).then(({ body }) => {
    Cypress.expose('authToken', body.authorization)
  })
})

Cypress.Commands.add('createUser', (overrides = {}) => {
  const data = {
    nome: 'Usuário Teste',
    email: `user_${Date.now()}@teste.com`,
    password: 'teste123',
    administrador: 'true',
    ...overrides
  }

  cy.request({
    method: 'POST',
    url: `${Cypress.expose('apiUrl')}/usuarios`,
    body: data,
    failOnStatusCode: false
  }).then((response) => ({
    ...response,
    data
  }))
})

Cypress.Commands.add('getUser', (id) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.expose('apiUrl')}/usuarios/${id}`,
    failOnStatusCode: false
  })
})

Cypress.Commands.add('deleteUser', (id) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.expose('apiUrl')}/usuarios/${id}`,
    failOnStatusCode: false
  })
})

Cypress.Commands.add('createProduct', (overrides = {}) => {
  const data = {
    nome: `Produto ${Date.now()}`,
    preco: 100,
    descricao: 'Descrição do produto de teste',
    quantidade: 10,
    ...overrides
  }

  cy.request({
    method: 'POST',
    url: `${Cypress.expose('apiUrl')}/produtos`,
    headers: { Authorization: Cypress.expose('authToken') },
    body: data,
    failOnStatusCode: false
  }).then((response) => ({
    ...response,
    data
  }))
})

Cypress.Commands.add('getProduct', (id) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.expose('apiUrl')}/produtos/${id}`,
    failOnStatusCode: false
  })
})

Cypress.Commands.add('updateProduct', (id, overrides = {}) => {
  const data = {
    nome: `Produto Editado ${Date.now()}`,
    preco: 200,
    descricao: 'Descrição editada',
    quantidade: 20,
    ...overrides
  }

  cy.request({
    method: 'PUT',
    url: `${Cypress.expose('apiUrl')}/produtos/${id}`,
    headers: { Authorization: Cypress.expose('authToken') },
    body: data,
    failOnStatusCode: false
  }).then((response) => ({
    ...response,
    data
  }))
})

Cypress.Commands.add('deleteProduct', (id) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.expose('apiUrl')}/produtos/${id}`,
    headers: { Authorization: Cypress.expose('authToken') },
    failOnStatusCode: false
  })
})

Cypress.Commands.add('createCart', (produtos) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.expose('apiUrl')}/carrinhos`,
    headers: { Authorization: Cypress.expose('authToken') },
    body: { produtos },
    failOnStatusCode: false
  })
})

Cypress.Commands.add('completePurchase', () => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.expose('apiUrl')}/carrinhos/concluir-compra`,
    headers: { Authorization: Cypress.expose('authToken') },
    failOnStatusCode: false
  })
})

Cypress.Commands.add('cancelPurchase', () => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.expose('apiUrl')}/carrinhos/cancelar-compra`,
    headers: { Authorization: Cypress.expose('authToken') },
    failOnStatusCode: false
  })
})
