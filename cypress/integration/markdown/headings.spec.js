describe('headings', () => {
  beforeEach(() => {
    cy.visit('/viewdoc/markdown-demo')
  })
  it('should render # as h1', () => {
    cy.get('pre').contains('# Heading 1')
    cy.get('h1').contains('Heading 1')
  })
  it('should render ## as h2', () => {
    cy.get('pre').contains('## Heading 2')
    cy.get('h2').contains('Heading 2')
  })
  it('should render ### as h3', () => {
    cy.get('pre').contains('### Heading 3')
    cy.get('h3').contains('Heading 3')
  })
  it('should render #### as h4', () => {
    cy.get('pre').contains('#### Heading 4')
    cy.get('h4').contains('Heading 4')
  })
  it('should render ##### as h5', () => {
    cy.get('pre').contains('##### Heading 5')
    cy.get('h5').contains('Heading 5')
  })
  it('should render ###### as h6', () => {
    cy.get('pre').contains('###### Heading 6')
    cy.get('h6').contains('Heading 6')
  })
  it('should render === as h1', () => {
    cy.get('pre')
      .contains('Alternative heading 1')
      .contains('=====================')
    cy.get('h1').contains('Alternative heading 1')
  })
  it('should render --- as h2', () => {
    cy.get('pre')
      .contains('Alternative heading 2')
      .contains('---------------------')
    cy.get('h2').contains('Alternative heading 2')
  })
})
