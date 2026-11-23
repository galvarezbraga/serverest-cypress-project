describe('Usuários API', () => {
  context('POST /usuarios', () => {
    it('deve cadastrar usuário com dados válidos', () => {
      cy.createUser().then(({ status, body }) => {
        expect(status).to.eq(201)
        expect(body.message).to.eq('Cadastro realizado com sucesso')
        expect(body).to.have.property('_id')
      })
    })

    it('deve impedir cadastro com email já existente', () => {
      cy.createUser().then(({ data }) => {
        cy.createUser({ email: data.email }).then(({ status, body }) => {
          expect(status).to.eq(400)
          expect(body.message).to.eq('Este email já está sendo usado')
        })
      })
    })

    it('deve impedir cadastro com email em formato inválido', () => {
      cy.fixture('users').then((fixture) => {
        cy.createUser({
          email: fixture.invalidEmail.email
        }).then(({ status, body }) => {
          expect(status).to.eq(400)
          expect(body.email).to.be.a('string')
        })
      })
    })

    it('deve impedir cadastro com campos obrigatórios ausentes', () => {
      cy.fixture('users').then((fixture) => {
        cy.createUser(fixture.missingFields).then(({ status, body }) => {
          expect(status).to.eq(400)
          expect(body).to.have.property('nome')
          expect(body).to.have.property('email')
          expect(body).to.have.property('password')
          expect(body).to.have.property('administrador')
        })
      })
    })
  })

  context('GET /usuarios/{_id}', () => {
    it('deve retornar usuário por ID com contrato correto', () => {
      cy.createUser().then(({ body }) => {
        cy.getUser(body._id).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('nome').that.is.a('string')
          expect(response.body).to.have.property('email').that.is.a('string')
          expect(response.body).to.have.property('password').that.is.a('string')
          expect(response.body).to.have.property('administrador').that.is.a('string')
          expect(response.body).to.have.property('_id').that.is.a('string')
        })
      })
    })

    it('deve retornar erro para ID inexistente', () => {
      cy.getUser('aAbBcCdDeEfFgGhH').then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body.message).to.eq('Usuário não encontrado')
      })
    })
  })

  context('DELETE /usuarios/{_id}', () => {
    it('deve excluir usuário com sucesso', () => {
      cy.createUser().then(({ body }) => {
        const userId = body._id

        cy.getUser(userId).then((getResponse) => {
          expect(getResponse.status).to.eq(200)
        })

        cy.deleteUser(userId).then(({ status, body: deleteBody }) => {
          expect(status).to.eq(200)
          expect(deleteBody.message).to.eq('Registro excluído com sucesso')
        })
      })
    })

    it('deve impedir exclusão de usuário com carrinho ativo', () => {
      cy.createUser({ administrador: 'true' }).then(({ body: userBody, data }) => {
        cy.login(data.email, data.password)

        cy.createProduct({ quantidade: 5 }).then(({ body: prodBody }) => {
          cy.createCart([{ idProduto: prodBody._id, quantidade: 1 }])

          cy.deleteUser(userBody._id).then(({ status, body }) => {
            expect(status).to.eq(400)
            expect(body).to.have.property('message')
            expect(body).to.have.property('idCarrinho')
          })
        })
      })
    })
  })
})
