describe('Admin Dashboard E2E', () => {
    beforeEach(() => {
      // Login as admin
      cy.login('admin@test.com', 'password');
      cy.visit('/admin/dashboard');
    });
  
    it('displays admin information correctly', () => {
      cy.get('h3').contains('Admin Name').should('be.visible');
      cy.get('h3').contains('Admin Email').should('be.visible');
      cy.get('h3').contains('Admin Contact').should('be.visible');
    });
  
    it('navigates through admin menu options', () => {
      cy.get('[data-testid="admin-menu"]').within(() => {
        cy.contains('Dashboard').click();
        // Test navigation and state changes
      });
    });
  });