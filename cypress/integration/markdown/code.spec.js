describe('code', () => {
  beforeEach(() => {
    cy.visit('/viewdoc/markdown-demo')
  })
  it('should render `` as code', () => {
    cy.get('pre').contains('`backticks`')
    cy.get('code').contains(/^backticks$/)
  })
  it('should render ``` ``` as pre/code', () => {
    cy.get('pre').contains('```')
      .should('contain', 'This is a code block.')
    cy.get('pre code').contains(/^This is a code block/)
  })
})
