describe('blockquotes', () => {
  beforeEach(() => {
    cy.visit('/viewdoc/markdown-demo')
  })
  it('should render > as blockquote', () => {
    cy.get('pre').contains('> This is a quote.')
    cy.get('blockquote').contains('This is a quote.')
  })
})
