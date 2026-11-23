describe('Carrinhos API - Fluxo de compra e estoque', () => {
  context('Criação de carrinho', () => {
    it('deve decrementar estoque do produto ao criar carrinho', () => {
      cy.createUser({ administrador: 'true' }).then(({ data }) => {
        cy.login(data.email, data.password)

        cy.createProduct({ quantidade: 10 }).then(({ body: prodBody }) => {
          cy.createCart([{ idProduto: prodBody._id, quantidade: 3 }]).then(({ status }) => {
            expect(status).to.eq(201)
          })

          cy.getProduct(prodBody._id).then(({ body }) => {
            expect(body.quantidade).to.eq(7)
          })
        })
      })
    })

    it('deve impedir criação com estoque insuficiente', () => {
      cy.createUser({ administrador: 'true' }).then(({ data }) => {
        cy.login(data.email, data.password)

        cy.createProduct({ quantidade: 2 }).then(({ body: prodBody }) => {
          cy.createCart([{ idProduto: prodBody._id, quantidade: 5 }]).then(({ status, body }) => {
            expect(status).to.eq(400)
            expect(body.message).to.eq('Produto não possui quantidade suficiente')
          })
        })
      })
    })

    it('deve impedir criação de segundo carrinho para o mesmo usuário', () => {
      cy.createUser({ administrador: 'true' }).then(({ data }) => {
        cy.login(data.email, data.password)

        cy.createProduct({ quantidade: 10 }).then(({ body: prodBody }) => {
          cy.createCart([{ idProduto: prodBody._id, quantidade: 1 }]).then(({ status }) => {
            expect(status).to.eq(201)
          })

          cy.createProduct({ quantidade: 5 }).then(({ body: prod2Body }) => {
            cy.createCart([{ idProduto: prod2Body._id, quantidade: 1 }]).then(({ status, body }) => {
              expect(status).to.eq(400)
              expect(body.message).to.eq('Não é permitido ter mais de 1 carrinho')
            })
          })
        })
      })
    })

    it('deve impedir produto duplicado no carrinho', () => {
      cy.createUser({ administrador: 'true' }).then(({ data }) => {
        cy.login(data.email, data.password)

        cy.createProduct({ quantidade: 10 }).then(({ body: prodBody }) => {
          cy.createCart([
            { idProduto: prodBody._id, quantidade: 1 },
            { idProduto: prodBody._id, quantidade: 2 }
          ]).then(({ status, body }) => {
            expect(status).to.eq(400)
            expect(body.message).to.eq('Não é permitido possuir produto duplicado')
          })
        })
      })
    })
  })

  context('Concluir compra', () => {
    it('deve excluir carrinho sem restaurar estoque', () => {
      cy.createUser({ administrador: 'true' }).then(({ data }) => {
        cy.login(data.email, data.password)

        cy.createProduct({ quantidade: 10 }).then(({ body: prodBody }) => {
          cy.createCart([{ idProduto: prodBody._id, quantidade: 3 }]).then(({ status }) => {
            expect(status).to.eq(201)
          })

          cy.completePurchase().then(({ status }) => {
            expect(status).to.eq(200)
          })

          cy.getProduct(prodBody._id).then(({ body }) => {
            expect(body.quantidade).to.eq(7)
          })
        })
      })
    })
  })

  context('Cancelar compra', () => {
    it('deve excluir carrinho e restaurar estoque', () => {
      cy.createUser({ administrador: 'true' }).then(({ data }) => {
        cy.login(data.email, data.password)

        cy.createProduct({ quantidade: 10 }).then(({ body: prodBody }) => {
          cy.createCart([{ idProduto: prodBody._id, quantidade: 3 }]).then(({ status }) => {
            expect(status).to.eq(201)
          })

          cy.cancelPurchase().then(({ status }) => {
            expect(status).to.eq(200)
          })

          cy.getProduct(prodBody._id).then(({ body }) => {
            expect(body.quantidade).to.eq(10)
          })
        })
      })
    })
  })
})
