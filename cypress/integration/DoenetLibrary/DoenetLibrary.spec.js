import { expect } from "chai";

// describe("Course creation in Library", function () {
//   beforeEach(() => {
//     cy.visit('/library');
//   });

//   it('Creating a new course by clicking the create a new course button', function() {
//     cy.get('[data-cy=createNewCourseButton]').click();
//     cy.get(':nth-child(1) > :nth-child(1) > [data-cy=navDriveHeader]').should('exist');
//   });

//   it('Clicking on a course in the NavPanel should select it and open it up in the drive', function() {
//     cy.get(':nth-child(1) > :nth-child(1) > [data-cy=navDriveHeader]').click();

//     // Check for drive label equality across nav panel and breadcrumb
//     cy.get(':nth-child(1) > :nth-child(1) > [data-cy=navDriveHeader]').invoke('text').then(navDriveLabel => {
//       cy.get('[data-cy=breadcrumbDriveColumn]').invoke('text').then(breadcrumbDriveLabel => {
//         expect(navDriveLabel.trim()).equal(breadcrumbDriveLabel.trim());
//       })
//     })
//   });
// });

describe("Library", function () {
  beforeEach(() => {
    cy.visit('/library');

    // Create a new course and select it
    cy.get('[data-cy=createNewCourseButton]').click();
    cy.wait(500);
    cy.get(':nth-child(1) > :nth-child(1) > [data-cy=navDriveHeader]').click();
  });

  // it('Creating a new folder by clicking on the Add Folder button', function() {
  //   cy.get('[data-cy=addFolderButton]').click();

  //   // Verify item existence and type
  //   cy.get(':nth-child(1) > [data-cy=driveItem]').should('exist');
  //   cy.get(':nth-child(1) > [data-cy=driveItem]').within(() => {
  //     cy.get('[data-cy=folderIcon]').should('exist');
  //   });    
  // })

  it('Single-clicking on a folder should select it and displays information about it in the InfoPanel', function() {
    cy.get('[data-cy=addFolderButton]').click();

    // Check for item label equality across Drive and InfoPanel
    let folderLabel = "";
    cy.get('[data-cy=mainPanel]').within(() => {
      cy.get('[data-cy=driveItem]').first().click();
      cy.get('[data-cy=driveItem]').first().within(() => {
        cy.get('[data-cy=folderLabel]').invoke('text').then(label => {
          folderLabel = label;
        })
      })
    }); 
    cy.get('[data-cy=infoPanelItemLabel]').invoke('text').then(infoPanelItemLabel => {
      expect(folderLabel.trim()).equal(infoPanelItemLabel.trim());
    })   
  });

  it('Creating a new DoenetML by clicking on the Add DoenetML button', function() {
    cy.get('[data-cy=addDoenetMLButton]').click();

    // Verify item existence and type
    cy.get(':nth-child(1) > [data-cy=driveItem]').should('exist');
    cy.get(':nth-child(1) > [data-cy=driveItem]').within(() => {
      cy.get('[data-cy=doenetMLIcon]').should('exist');
    });    
  })

  it('Single-clicking on a DoenetML should select it and displays information about it in the InfoPanel', function() {
    cy.get('[data-cy=addDoenetMLButton]').click();

    // Check for item label equality across Drive and InfoPanel
    let doenetMLLabel = "";
    cy.get('[data-cy=mainPanel]').within(() => {
      cy.get('[data-cy=driveItem]').first().click();
      cy.get('[data-cy=driveItem]').first().within(() => {
        cy.get('[data-cy=doenetMLLabel]').invoke('text').then(label => {
          doenetMLLabel = label;
        })
      })
    }); 
    cy.get('[data-cy=infoPanelItemLabel]').invoke('text').then(infoPanelItemLabel => {
      expect(doenetMLLabel.trim()).equal(infoPanelItemLabel.trim());
    })   
  });
});

/*

Double-click a DoenetML item
- should open up editor

Double-click a Folder item
- should toggle open/close
*/