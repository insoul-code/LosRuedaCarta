describe('template spec', () => {
  it('passes', () => {
    cy.visit('/loginlosrueda')

    cy.get('#email').type('tiago@gmail.com')
    cy.get('#password').type('12345678')
    cy.get('.actions > button').click()

    cy.get('.cont-table > table > tbody > tr > td > a').eq(2).click()

    cy.get('#name').clear().type('Chuzo de cerdo edit')
    cy.get('.actions > .btn-primary').click()

    cy.get('.alert-done', {timeout: 3000}).should(($text)=>{
      expect($text).to.contain('El producto se ha actualizado exitosamente')
    })

  })
})
