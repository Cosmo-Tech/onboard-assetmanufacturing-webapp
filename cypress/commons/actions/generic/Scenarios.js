// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import { GENERIC_SELECTORS } from '../../constants/generic/IdConstants';
import { ScenarioParameters } from './ScenarioParameters';
import { apiUtils as api } from '../../utils';

// From scenario View
// Get elements
function getScenarioViewTab(timeout = 5) {
  return cy.get(GENERIC_SELECTORS.scenario.tabName, { timeout: timeout * 1000 });
}
function getScenarioView() {
  return cy.get(GENERIC_SELECTORS.scenario.view);
}
function getScenarioSelector(timeout = 5) {
  return cy.get(GENERIC_SELECTORS.scenario.selectInput, { timeout: timeout * 1000 });
}
function getScenarioSelectorInput(timeout) {
  return getScenarioSelector(timeout).find('input');
}
function getScenarioSelectorOption(scenarioId) {
  return cy.get(GENERIC_SELECTORS.scenario.scenarioSelectOption.replace('$SCENARIOID', scenarioId));
}
function getScenarioSelectorOptionValidationStatusChip(scenarioId) {
  return getScenarioSelectorOption(scenarioId).find(GENERIC_SELECTORS.scenario.validationStatusChip);
}
function getScenarioSelectorOptionValidationStatusLoadingSpinner(scenarioId) {
  return getScenarioSelectorOption(scenarioId).find(GENERIC_SELECTORS.scenario.validationStatusLoadingSpinner);
}
function checkValidationStatusInScenarioSelector(searchStr, scenarioId, expectedStatus) {
  writeInScenarioSelectorInput(searchStr);
  switch (expectedStatus) {
    case 'Draft':
    case 'Unknown':
      getScenarioSelectorOptionValidationStatusChip(scenarioId).should('not.exist');
      getScenarioSelectorOptionValidationStatusLoadingSpinner(scenarioId).should('not.exist');
      break;
    case 'Validated':
      getScenarioSelectorOptionValidationStatusChip(scenarioId).should('be.visible');
      getScenarioSelectorOptionValidationStatusChip(scenarioId).should('have.text', 'Validated');
      getScenarioSelectorOptionValidationStatusLoadingSpinner(scenarioId).should('not.exist');
      break;
    case 'Rejected':
      getScenarioSelectorOptionValidationStatusChip(scenarioId).should('be.visible');
      getScenarioSelectorOptionValidationStatusChip(scenarioId).should('have.text', 'Rejected');
      getScenarioSelectorOptionValidationStatusLoadingSpinner(scenarioId).should('not.exist');
      break;
    case 'Loading':
      getScenarioSelectorOptionValidationStatusChip(scenarioId).should('not.exist');
      getScenarioSelectorOptionValidationStatusLoadingSpinner(scenarioId).should('be.visible');
      break;
    default:
      throw new Error(
        `Unknown expected scenario status "${expectedStatus}". Please use one of ` +
          'Draft, Unknown, Loading, Validated, Rejected.'
      );
  }
  writeInScenarioSelectorInput('{esc}');
}
function getScenarioValidationStatusChip() {
  return cy.get(GENERIC_SELECTORS.scenario.validationStatusChip);
}
function getScenarioValidationStatusChipDeleteIcon() {
  return getScenarioValidationStatusChip().find(GENERIC_SELECTORS.scenario.validationStatusChipDeleteIcon);
}
function getScenarioValidationStatusLoadingSpinner(timeout = 5) {
  return cy.get(GENERIC_SELECTORS.scenario.validationStatusLoadingSpinner, { timeout: timeout * 1000 });
}
function getScenarioValidateButton() {
  return cy.get(GENERIC_SELECTORS.scenario.validateButton);
}
function getScenarioRejectButton() {
  return cy.get(GENERIC_SELECTORS.scenario.rejectButton);
}
function getScenarioRunTemplate() {
  return cy.get(GENERIC_SELECTORS.scenario.runTemplateName);
}
function getScenarioCreationButton() {
  return cy.get(GENERIC_SELECTORS.scenario.createButton);
}
function getScenarioCreationDialog() {
  return cy.get(GENERIC_SELECTORS.scenario.createDialog.dialog);
}
function getScenarioCreationDialogNameField() {
  return cy.get(GENERIC_SELECTORS.scenario.createDialog.nameTextfield);
}
function getScenarioCreationDialogNameInputErrorLabel() {
  return cy.get(GENERIC_SELECTORS.scenario.createDialog.errorLabel);
}
function getScenarioCreationDialogMasterCheckbox() {
  return cy.get(GENERIC_SELECTORS.scenario.createDialog.masterCheckbox);
}
function getScenarioCreationDialogDatasetSelector() {
  return cy.get(GENERIC_SELECTORS.scenario.createDialog.datasetSelect);
}
function getScenarioCreationDialogDatasetSelectorOptions() {
  return cy.get(GENERIC_SELECTORS.scenario.createDialog.datasetSelectorOptions);
}
function getScenarioCreationDialogParentScenarioSelector() {
  return getScenarioCreationDialog().find(GENERIC_SELECTORS.genericComponents.hierarchicalComboBox.selector);
}
function getScenarioCreationDialogParentScenarioSelectorOptions() {
  // ListBox component for selector options is not in its associated selector component in DOM, do not use .find() here
  return cy.get(GENERIC_SELECTORS.genericComponents.hierarchicalComboBox.selectorOptions);
}
function getScenarioCreationDialogRunTypeSelector() {
  return cy.get(GENERIC_SELECTORS.scenario.createDialog.typeSelect);
}
function getScenarioCreationDialogRunTypeSelectorOptions() {
  return cy.get(GENERIC_SELECTORS.scenario.createDialog.typeSelectorOptions);
}
function getScenarioCreationDialogSubmitButton() {
  return cy.get(GENERIC_SELECTORS.scenario.createDialog.submitButton);
}
function getScenarioCreationDialogCancelButton() {
  return cy.get(GENERIC_SELECTORS.scenario.createDialog.cancelButton);
}
function getDashboardPlaceholder() {
  return cy.get(GENERIC_SELECTORS.scenario.dashboard.placeholder);
}

function switchToScenarioView() {
  getScenarioViewTab().click();
}

// Select the scenario with the provided name and id
function selectScenario(scenarioName, scenarioId) {
  const getScenarioAlias = api.interceptGetScenario(scenarioId);
  writeInScenarioSelectorInput(scenarioName);
  getScenarioSelectorOption(scenarioId).should('be.visible').should('not.be.disabled');
  getScenarioSelectorOption(scenarioId).click();

  api
    .waitAlias(getScenarioAlias)
    .its('response')
    .its('body')
    .then((req) => {
      expect(req.name).equal(scenarioName);
      if (req.state === 'Running') {
        ScenarioParameters.getParametersEditButton().should('be.disabled');
      } else {
        ScenarioParameters.getParametersEditButton().should('not.be.disabled');
      }
    });
}

function writeInScenarioSelectorInput(searchStr) {
  return getScenarioSelector()
    .click()
    .should('not.be.disabled')
    .type('{selectAll}{backspace}' + searchStr); // clear() does not always work, use "{selectAll}{backspace}" instead
}

// Open scenario creation dialog
function openScenarioCreationDialog() {
  getScenarioCreationButton().click();
}

// From scenario creation dialog
// Select a parent scenario
function selectParentScenario(scenarioName) {
  getScenarioCreationDialogMasterCheckbox().uncheck();
  getScenarioCreationDialogParentScenarioSelector().clear().type(scenarioName);
  // Try to prevent "detached from DOM" cypress error with these 2 instructions
  getScenarioCreationDialogParentScenarioSelectorOptions().contains(scenarioName).should('be.visible');
  getScenarioCreationDialogParentScenarioSelectorOptions().contains(scenarioName).click();
}

// Select a dataset
function selectDataset(dataset) {
  getScenarioCreationDialogMasterCheckbox().check();
  getScenarioCreationDialogDatasetSelector().clear().type(dataset);
  // Try to prevent "detached from DOM" cypress error with these 2 instructions
  getScenarioCreationDialogDatasetSelectorOptions().contains(dataset).should('be.visible');
  getScenarioCreationDialogDatasetSelectorOptions().contains(dataset).click();
}

// Select a run template
function selectRunTemplate(runTemplate) {
  getScenarioCreationDialogRunTypeSelector().clear().type(runTemplate);
  // Try to prevent "detached from DOM" cypress error with these 2 instructions
  getScenarioCreationDialogRunTypeSelectorOptions().contains(runTemplate).should('be.visible');
  getScenarioCreationDialogRunTypeSelectorOptions().contains(runTemplate).click();
}

function cancelCreateScenario() {
  getScenarioCreationDialogCancelButton().click();
}

function createScenario(scenarioName, isMaster, datasetOrMasterName, runTemplate) {
  const createScenarioAlias = api.interceptCreateScenario();
  const getScenariosAlias = api.interceptGetScenarios();

  openScenarioCreationDialog();
  getScenarioCreationDialog().should('be.visible');
  getScenarioCreationDialogNameField().type(scenarioName);
  if (isMaster === true) {
    selectDataset(datasetOrMasterName);
  } else {
    selectParentScenario(datasetOrMasterName);
  }
  selectRunTemplate(runTemplate);

  getScenarioCreationDialogSubmitButton().click();
  getScenarioCreationDialog().should('not.exist');

  let scenarioCreated;
  api.waitAlias(createScenarioAlias).then((req) => {
    scenarioCreated = req.response.body;
    expect(scenarioCreated.name.toLowerCase()).to.equal(scenarioName.toLowerCase());
    expect(scenarioCreated.runTemplateName.toLowerCase()).to.equal(runTemplate.toLowerCase());
  });

  return api.waitAlias(getScenariosAlias).then((interception) => {
    const nameGet = interception.response.body.find((obj) => obj.id === scenarioCreated.id).name;
    expect(nameGet).to.equal(scenarioCreated.name);

    return {
      scenarioCreatedId: scenarioCreated.id,
      scenarioCreatedName: scenarioCreated.name,
      scenarioCreatedOwnerName: scenarioCreated.ownerName,
      scenarioCreatedCreationDate: scenarioCreated.creationDate,
      scenarioCreatedRunTemplateName: runTemplate,
      scenarioCratedDatasetOrMasterName: datasetOrMasterName,
    };
  });
}

function validateScenario() {
  return getScenarioValidateButton().click();
}
function rejectScenario() {
  return getScenarioRejectButton().click();
}
function resetScenarioValidationStatus() {
  return getScenarioValidationStatusChipDeleteIcon().click();
}

export const Scenarios = {
  getScenarioView,
  getScenarioViewTab,
  getScenarioSelector,
  getScenarioSelectorInput,
  getScenarioSelectorOption,
  getScenarioSelectorOptionValidationStatusChip,
  getScenarioSelectorOptionValidationStatusLoadingSpinner,
  checkValidationStatusInScenarioSelector,
  getScenarioValidationStatusChip,
  getScenarioValidationStatusChipDeleteIcon,
  getScenarioValidationStatusLoadingSpinner,
  getScenarioValidateButton,
  getScenarioRejectButton,
  getScenarioRunTemplate,
  getScenarioCreationButton,
  getScenarioCreationDialog,
  getScenarioCreationDialogNameField,
  getScenarioCreationDialogNameInputErrorLabel,
  getScenarioCreationDialogMasterCheckbox,
  getScenarioCreationDialogDatasetSelector,
  getScenarioCreationDialogDatasetSelectorOptions,
  getScenarioCreationDialogParentScenarioSelector,
  getScenarioCreationDialogParentScenarioSelectorOptions,
  getScenarioCreationDialogRunTypeSelector,
  getScenarioCreationDialogRunTypeSelectorOptions,
  getScenarioCreationDialogSubmitButton,
  getScenarioCreationDialogCancelButton,
  getDashboardPlaceholder,
  switchToScenarioView,
  selectScenario,
  writeInScenarioSelectorInput,
  openScenarioCreationDialog,
  selectParentScenario,
  selectDataset,
  selectRunTemplate,
  createScenario,
  cancelCreateScenario,
  validateScenario,
  rejectScenario,
  resetScenarioValidationStatus,
};
