describe('Produtos API', () => {
  beforeEach(() => {
    cy.createUser({ administrador: 'true' }).then(({ data }) => {
      cy.login(data.email, data.password)
    })
  })

  context('POST /produtos', () => {
    it('deve cadastrar produto com token admin válido', () => {
      cy.createProduct().then(({ status, body }) => {
        expect(status).to.eq(201)
        expect(body.message).to.eq('Cadastro realizado com sucesso')
        expect(body).to.have.property('_id')
      })
    })

    it('deve impedir cadastro com nome já existente', () => {
      cy.createProduct().then(({ data }) => {
        cy.createProduct({ nome: data.nome }).then(({ status, body }) => {
          expect(status).to.eq(400)
          expect(body.message).to.eq('Já existe produto com esse nome')
        })
      })
    })

    it('deve rejeitar requisição sem token de autenticação', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.expose('apiUrl')}/produtos`,
        body: {
          nome: `Produto ${Date.now()}`,
          preco: 100,
          descricao: 'Teste sem token',
          quantidade: 10
        },
        failOnStatusCode: false
      }).then(({ status, body }) => {
        expect(status).to.eq(401)
        expect(body.message).to.be.a('string')
      })
    })

    it('deve rejeitar requisição com token de usuário não-admin', () => {
      cy.createUser({ administrador: 'false' }).then(({ data }) => {
        cy.login(data.email, data.password)

        cy.createProduct().then(({ status, body }) => {
          expect(status).to.eq(403)
          expect(body.message).to.eq('Rota exclusiva para administradores')
        })
      })
    })

    it('deve impedir cadastro com campos obrigatórios ausentes', () => {
      cy.fixture('products').then((fixture) => {
        cy.createProduct(fixture.missingFields).then(({ status, body }) => {
          expect(status).to.eq(400)
          expect(body).to.have.property('nome')
        })
      })
    })
  })

  context('GET /produtos/{_id}', () => {
    it('deve retornar produto por ID com contrato correto', () => {
      cy.createProduct().then(({ body }) => {
        cy.getProduct(body._id).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('nome').that.is.a('string')
          expect(response.body).to.have.property('preco').that.is.a('number')
          expect(response.body).to.have.property('descricao').that.is.a('string')
          expect(response.body).to.have.property('quantidade').that.is.a('number')
          expect(response.body).to.have.property('_id').that.is.a('string')
        })
      })
    })

    it('deve retornar erro para ID inexistente', () => {
      cy.getProduct('aAbBcCdDeEfFgGhH').then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body.message).to.eq('Produto não encontrado')
      })
    })
  })

  context('PUT /produtos/{_id}', () => {
    it('deve editar produto existente com token admin', () => {
      cy.createProduct().then(({ body }) => {
        cy.updateProduct(body._id, {
          nome: `Produto Editado ${Date.now()}`
        }).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.message).to.eq('Registro alterado com sucesso')
        })
      })
    })

    it('deve criar produto via upsert quando ID não existe', () => {
      cy.updateProduct('aAbBcCdDeEfFgGhH', {
        nome: `Produto Upsert ${Date.now()}`
      }).then(({ status, body }) => {
        expect(status).to.eq(201)
        expect(body.message).to.eq('Cadastro realizado com sucesso')
        expect(body).to.have.property('_id')
      })
    })
  })

  context('DELETE /produtos/{_id}', () => {
    it('deve excluir produto com sucesso', () => {
      cy.createProduct().then(({ body }) => {
        const productId = body._id

        cy.getProduct(productId).then((getResponse) => {
          expect(getResponse.status).to.eq(200)
        })

        cy.deleteProduct(productId).then(({ status, body: deleteBody }) => {
          expect(status).to.eq(200)
          expect(deleteBody.message).to.eq('Registro excluído com sucesso')
        })
      })
    })

    it('deve impedir exclusão de produto em carrinho ativo', () => {
      cy.createProduct({ quantidade: 5 }).then(({ body: prodBody }) => {
        cy.createCart([{ idProduto: prodBody._id, quantidade: 1 }])

        cy.deleteProduct(prodBody._id).then(({ status, body }) => {
          expect(status).to.eq(400)
          expect(body).to.have.property('message')
          expect(body).to.have.property('idCarrinhos')
        })
      })
    })
  })
})
