describe('lists', () => {
  beforeEach(() => {
    cy.visit('/viewdoc/markdown-demo')
  })
  it('should render - as ul/li', () => {
    cy.get('pre').contains('- Unordered item 1')
      .should('contain', '- Unordered item 2')
      .and('contain', '- Unordered item 3')
    cy.get('ul li').contains('Unordered item 1')
      .next('li').contains('Unordered item 2')
      .next('li').contains('Unordered item 3')
  })
  it('should render * as ul/li', () => {
    cy.get('pre').contains('* Alternative unordered item 1')
      .should('contain', '* Alternative unordered item 2')
      .and('contain', '* Alternative unordered item 3')
    cy.get('ul li').contains('Alternative unordered item 1')
      .next('li').contains('Alternative unordered item 2')
      .next('li').contains('Alternative unordered item 3')
  })
  it('should render nth as ol/li', () => {
    cy.get('pre').contains('1. Ordered item 1')
      .should('contain', '2. Ordered item 2')
      .and('contain', '3. Ordered item 3')
    cy.get('ol li').contains('Ordered item 1')
      .next('li').contains('Ordered item 2')
      .next('li').contains('Ordered item 3')
  })
})
