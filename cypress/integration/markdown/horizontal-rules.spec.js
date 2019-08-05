describe('horizontal rules', () => {
  beforeEach(() => {
    cy.visit('/viewdoc/markdown-demo')
  })
  it('should render *** as hr', () => {
    cy.get('pre').contains('***')
    cy.get('p').contains('Three or more asterisks')
      .next().should('have.prop', 'tagName').and('eq', 'HR')
  })
  it('should render --- as hr', () => {
    cy.get('pre').contains('---')
    cy.get('p').contains('Three or more dashes')
      .next().should('have.prop', 'tagName').and('eq', 'HR')
  })
  it('should render ___ as hr', () => {
    cy.get('pre').contains('___')
    cy.get('p').contains('Three or more underscores')
      .next().should('have.prop', 'tagName').and('eq', 'HR')
  })
})
