describe('links', () => {
  beforeEach(() => {
    cy.visit('/viewdoc/markdown-demo')
  })
  it('should render []() as a', () => {
    cy.get('pre').contains('[Link text](https://link-url.com)')
    cy.get('a').contains('Link text')
      .should('have.attr', 'href').and('eq', 'https://link-url.com')
  })
})
