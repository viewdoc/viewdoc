describe('emphasis', () => {
  beforeEach(() => {
    cy.visit('/viewdoc/markdown-demo')
  })
  it('should render ** as strong', () => {
    cy.get('pre').contains('**asterisks**')
    cy.get('strong').contains('asterisks').parent().contains('Bold')
  })
  it('should render __ as strong', () => {
    cy.get('pre').contains('__underscores__')
    cy.get('strong').contains('underscores').parent().contains('Bold')
  })
  it('should render * as em', () => {
    cy.get('pre').contains('*asterisks*')
    cy.get('em').contains('asterisks').parent().contains('Italic')
  })
  it('should render ** _ ** as em inside strong', () => {
    cy.get('pre').contains('**asterisks _AND_ underscores**')
    cy.get('em').contains('AND').parent().contains('asterisks AND underscores')
      .should('have.prop', 'tagName').and('eq', 'STRONG')
  })
  it('should render ~~ as del', () => {
    cy.get('pre').contains('~~tildes~~')
    cy.get('del').contains('tildes').parent().contains('Strikethrough')
  })
})
