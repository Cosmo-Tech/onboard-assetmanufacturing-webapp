// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import 'cypress-file-upload';
import utils from '../../commons/TestUtils';

import { DATASET, RUN_TEMPLATE } from '../../commons/constants/brewery/TestConstants';
import { Downloads, Login, Scenarios, ScenarioManager, ScenarioParameters } from '../../commons/actions';
import { BreweryParameters } from '../../commons/actions/brewery';
import { EXPECTED_CUSTOMERS_BASIC_EDITION } from '../../fixtures/TableParametersData';

Cypress.Keyboard.defaults({
  keystrokeDelay: 0,
});

const SCENARIO_DATASET = DATASET.BREWERY_ADT;
const SCENARIO_RUN_TEMPLATE = RUN_TEMPLATE.BASIC_TYPES;
const VALID_FILE_PATH_EMPTY = 'customers_empty.csv';
const VALID_FILE_PATH_WITH_SPACES = 'customers_with_spaces.csv';
const VALID_FILE_PATH = 'customers.csv';
const INVALID_FILE_PATH = 'customers_invalid.csv';
const COL_NAMES = ['name', 'age', 'canDrinkAlcohol', 'favoriteDrink', 'birthday', 'height'];
const ENUM_VALUES = ['AppleJuice', 'OrangeJuice', 'Wine', 'Beer'];

function forgeScenarioName() {
  const prefix = 'Scenario with table - ';
  return `${prefix}${utils.randomStr(7)}`;
}

describe('Table parameters standard operations', () => {
  before(() => {
    Login.login();
  });

  beforeEach(() => {
    Login.relogin();
  });

  const scenarioNamesToDelete = [];
  after(() => {
    Downloads.clearDownloadsFolder();
    // Delete all tests scenarios
    ScenarioManager.switchToScenarioManager();
    for (const scenarioName of scenarioNamesToDelete) {
      ScenarioManager.deleteScenario(scenarioName);
    }
  });

  it('can import an invalid CSV file and display the errors panel', () => {
    const scenarioName = forgeScenarioName();
    scenarioNamesToDelete.push(scenarioName);
    Scenarios.createScenario(scenarioName, true, SCENARIO_DATASET, SCENARIO_RUN_TEMPLATE);
    BreweryParameters.switchToCustomersTab();
    BreweryParameters.getCustomersImportButton().should('be.visible');
    BreweryParameters.getCustomersExportButton().should('be.visible');
    BreweryParameters.getCustomersErrorsPanel().should('not.exist');

    ScenarioParameters.edit();
    BreweryParameters.importCustomersTableDataFromCSV(INVALID_FILE_PATH);
    BreweryParameters.getCustomersTableLabel().should('be.visible').should('have.text', 'Customers');
    BreweryParameters.getCustomersErrorsPanel().should('be.visible');
    BreweryParameters.getCustomersErrorsHeader().should('have.text', 'File load failed. 11 errors occurred:');
    BreweryParameters.getCustomersErrorsAccordions().should('have.length', 11);

    BreweryParameters.getCustomersErrorSummary(0).should('have.text', 'Missing columns');
    BreweryParameters.getCustomersErrorSummary(1).should('have.text', 'Incorrect int value');
    BreweryParameters.getCustomersErrorSummary(2).should('have.text', 'Incorrect bool value');
    BreweryParameters.getCustomersErrorSummary(3).should('have.text', 'Incorrect enum value');
    BreweryParameters.getCustomersErrorSummary(4).should('have.text', 'Incorrect date value');
    BreweryParameters.getCustomersErrorSummary(5).should('have.text', 'Incorrect number value');
    BreweryParameters.getCustomersErrorSummary(6).should('have.text', 'Incorrect int value');
    BreweryParameters.getCustomersErrorSummary(7).should('have.text', 'Incorrect bool value');
    BreweryParameters.getCustomersErrorSummary(8).should('have.text', 'Incorrect enum value');
    BreweryParameters.getCustomersErrorSummary(9).should('have.text', 'Incorrect date value');
    BreweryParameters.getCustomersErrorSummary(10).should('have.text', 'Incorrect number value');

    BreweryParameters.getCustomersErrorLoc(0).should('have.text', 'Line 1');
    BreweryParameters.getCustomersErrorLoc(1).should('have.text', 'Line 2 , Column 1 ("age")');

    ScenarioParameters.discard();
    BreweryParameters.getCustomersErrorsPanel().should('not.exist');
  });

  it('can open the customers scenario parameters tab, and export an empty file', () => {
    const scenarioName = forgeScenarioName();
    scenarioNamesToDelete.push(scenarioName);
    Scenarios.createScenario(scenarioName, true, SCENARIO_DATASET, SCENARIO_RUN_TEMPLATE);
    BreweryParameters.switchToCustomersTab();
    BreweryParameters.getCustomersTable().should('be.visible');
    BreweryParameters.getCustomersTableLabel().should('be.visible').should('have.text', 'Customers');
    BreweryParameters.getCustomersTableGrid().should('be.visible');
    BreweryParameters.getCustomersImportButton().should('be.visible');
    BreweryParameters.getCustomersExportButton().should('be.visible');
    BreweryParameters.getCustomersTableHeader().should('not.exist');
    BreweryParameters.exportCustomersTableDataToCSV();
    Downloads.checkByContent('customers.csv', COL_NAMES.join());
  });

  it('can import an empty CSV file and export the table afterwards', () => {
    const scenarioName = forgeScenarioName();
    scenarioNamesToDelete.push(scenarioName);
    Scenarios.createScenario(scenarioName, true, SCENARIO_DATASET, SCENARIO_RUN_TEMPLATE);
    BreweryParameters.switchToCustomersTab();
    BreweryParameters.getCustomersTableHeader().should('not.exist');
    ScenarioParameters.edit();
    BreweryParameters.importCustomersTableDataFromCSV(VALID_FILE_PATH_EMPTY);
    BreweryParameters.getCustomersTableHeader().should('be.visible');
    COL_NAMES.forEach((col) => {
      BreweryParameters.getCustomersTableHeaderCell(col).should('be.visible');
    });
    BreweryParameters.exportCustomersTableDataToCSV();
    Downloads.checkByContent('customers.csv', COL_NAMES.join());
  });

  it('can import a CSV file with spaces and boolean values to re-format', () => {
    const scenarioName = forgeScenarioName();
    scenarioNamesToDelete.push(scenarioName);
    Scenarios.createScenario(scenarioName, true, SCENARIO_DATASET, SCENARIO_RUN_TEMPLATE);
    BreweryParameters.switchToCustomersTab();
    ScenarioParameters.edit();
    BreweryParameters.importCustomersTableDataFromCSV(VALID_FILE_PATH_WITH_SPACES);
    BreweryParameters.getCustomersTableRows().should('have.length', 4);
    BreweryParameters.getCustomersTableCell('name', 0).should('have.text', 'Bob');
    BreweryParameters.getCustomersTableCell('name', 1).should('have.text', 'Lily');
    BreweryParameters.getCustomersTableCell('name', 2).should('have.text', 'Maria');
    BreweryParameters.getCustomersTableCell('name', 3).should('have.text', 'Howard');
    BreweryParameters.getCustomersTableCell('age', 0).should('have.text', '10');
    BreweryParameters.getCustomersTableCell('age', 1).should('have.text', '8');
    BreweryParameters.getCustomersTableCell('age', 2).should('have.text', '34');
    BreweryParameters.getCustomersTableCell('age', 3).should('have.text', '34');
    BreweryParameters.getCustomersTableCell('canDrinkAlcohol', 0).should('have.text', 'false');
    BreweryParameters.getCustomersTableCell('canDrinkAlcohol', 1).should('have.text', 'false');
    BreweryParameters.getCustomersTableCell('canDrinkAlcohol', 2).should('have.text', 'true');
    BreweryParameters.getCustomersTableCell('canDrinkAlcohol', 3).should('have.text', 'true');
    BreweryParameters.getCustomersTableCell('favoriteDrink', 0).should('have.text', 'AppleJuice');
    BreweryParameters.getCustomersTableCell('favoriteDrink', 1).should('have.text', 'AppleJuice');
    BreweryParameters.getCustomersTableCell('favoriteDrink', 2).should('have.text', 'Wine');
    BreweryParameters.getCustomersTableCell('favoriteDrink', 3).should('have.text', 'Beer');
    BreweryParameters.getCustomersTableCell('birthday', 0).should('have.text', '01/04/2011');
    BreweryParameters.getCustomersTableCell('birthday', 1).should('have.text', '09/05/2013');
    BreweryParameters.getCustomersTableCell('birthday', 2).should('have.text', '19/03/1987');
    BreweryParameters.getCustomersTableCell('birthday', 3).should('have.text', '12/05/1987');
    BreweryParameters.getCustomersTableCell('height', 0).should('have.text', '1.40');
    BreweryParameters.getCustomersTableCell('height', 1).should('have.text', '1.41');
    BreweryParameters.getCustomersTableCell('height', 2).should('have.text', '1.90');
    BreweryParameters.getCustomersTableCell('height', 3).should('have.text', '1.83');
  });

  it('must check the edition mode to accept changes, and let users discards their changes', () => {
    const scenarioName = forgeScenarioName();
    scenarioNamesToDelete.push(scenarioName);
    Scenarios.createScenario(scenarioName, true, SCENARIO_DATASET, SCENARIO_RUN_TEMPLATE);
    BreweryParameters.switchToCustomersTab();
    ScenarioParameters.edit();
    BreweryParameters.importCustomersTableDataFromCSV(VALID_FILE_PATH);
    BreweryParameters.getCustomersTableRows().should('have.length', 4);
    BreweryParameters.getCustomersTableCell('name', 0).should('have.text', 'Bob');
    BreweryParameters.getCustomersTableCell('age', 0).should('have.text', '10');
    BreweryParameters.getCustomersTableCell('canDrinkAlcohol', 1).should('have.text', 'false');
    BreweryParameters.getCustomersTableCell('favoriteDrink', 2).should('have.text', 'Wine');
    BreweryParameters.getCustomersTableCell('birthday', 3).should('have.text', '12/05/1987');
    BreweryParameters.getCustomersTableCell('height', 3).should('have.text', '1.83');
    BreweryParameters.editCustomersTableStringCell('name', 0, 'Bill').should('have.text', 'Bob'); // notEditable
    BreweryParameters.editCustomersTableStringCell('age', 0, '11').should('have.text', '11');
    BreweryParameters.editCustomersTableStringCell('canDrinkAlcohol', 1, 'true').should('have.text', 'true');
    BreweryParameters.editCustomersTableStringCell('favoriteDrink', 2, 'Beer').should('have.text', 'Beer');
    BreweryParameters.editCustomersTableStringCell('birthday', 3, '01/01/1991').should('have.text', '01/01/1991');
    BreweryParameters.editCustomersTableStringCell('height', 3, '2.01').should('have.text', '2.01');
    ScenarioParameters.discard();
    BreweryParameters.getCustomersTableHeader().should('not.exist');
    ScenarioParameters.edit();
    BreweryParameters.importCustomersTableDataFromCSV(VALID_FILE_PATH);
    BreweryParameters.getCustomersTableRows().should('have.length', 4);
    BreweryParameters.getCustomersTableCell('name', 0).should('have.text', 'Bob');
    BreweryParameters.getCustomersTableCell('age', 0).should('have.text', '10');
    BreweryParameters.getCustomersTableCell('canDrinkAlcohol', 1).should('have.text', 'false');
    BreweryParameters.getCustomersTableCell('favoriteDrink', 2).should('have.text', 'Wine');
    BreweryParameters.getCustomersTableCell('birthday', 3).should('have.text', '12/05/1987');
    BreweryParameters.getCustomersTableCell('height', 3).should('have.text', '1.83');
    BreweryParameters.editCustomersTableStringCell('name', 0, 'Bill').should('have.text', 'Bob'); // notEditable
    BreweryParameters.editCustomersTableStringCell('age', 0, '11').should('have.text', '11');
    BreweryParameters.editCustomersTableStringCell('canDrinkAlcohol', 1, 'true').should('have.text', 'true');
    BreweryParameters.editCustomersTableStringCell('favoriteDrink', 2, 'Beer').should('have.text', 'Beer');
    BreweryParameters.editCustomersTableStringCell('birthday', 3, '01/01/1991').should('have.text', '01/01/1991');
    BreweryParameters.editCustomersTableStringCell('height', 3, '2.01').should('have.text', '2.01');
    ScenarioParameters.updateAndLaunch();
    // Check that cells values have been saved
    BreweryParameters.getCustomersTableCell('name', 0).should('have.text', 'Bob');
    BreweryParameters.getCustomersTableCell('age', 0).should('have.text', '11');
    BreweryParameters.getCustomersTableCell('canDrinkAlcohol', 1).should('have.text', 'true');
    BreweryParameters.getCustomersTableCell('favoriteDrink', 2).should('have.text', 'Beer');
    BreweryParameters.getCustomersTableCell('birthday', 3).should('have.text', '01/01/1991');
    BreweryParameters.getCustomersTableCell('height', 3).should('have.text', '2.01');
    // Check that cells are not editable when not in edition mode
    BreweryParameters.editCustomersTableStringCell('name', 0, 'Bill').should('have.text', 'Bob');
    BreweryParameters.editCustomersTableStringCell('age', 0, '12').should('have.text', '11');
    BreweryParameters.editCustomersTableStringCell('canDrinkAlcohol', 1, 'false').should('have.text', 'true');
    BreweryParameters.editCustomersTableStringCell('favoriteDrink', 2, 'Wine').should('have.text', 'Beer');
    BreweryParameters.editCustomersTableStringCell('birthday', 3, '04/04/1994').should('have.text', '01/01/1991');
    BreweryParameters.editCustomersTableStringCell('height', 3, '1.55').should('have.text', '2.01');
  });

  it('can import a CSV file, edit, export and launch a scenario with the modified data', () => {
    const scenarioName = forgeScenarioName();
    scenarioNamesToDelete.push(scenarioName);
    Scenarios.createScenario(scenarioName, true, SCENARIO_DATASET, SCENARIO_RUN_TEMPLATE);
    BreweryParameters.switchToCustomersTab();
    ScenarioParameters.edit();
    BreweryParameters.importCustomersTableDataFromCSV(VALID_FILE_PATH);
    BreweryParameters.getCustomersTableRows().should('have.length', 4);
    BreweryParameters.getCustomersTableCell('name', 0).should('have.text', 'Bob');
    BreweryParameters.getCustomersTableCell('age', 0).should('have.text', '10');
    BreweryParameters.getCustomersTableCell('canDrinkAlcohol', 1).should('have.text', 'false');
    BreweryParameters.getCustomersTableCell('favoriteDrink', 2).should('have.text', 'Wine');
    BreweryParameters.getCustomersTableCell('birthday', 3).should('have.text', '12/05/1987');
    BreweryParameters.getCustomersTableCell('height', 3).should('have.text', '1.83');
    BreweryParameters.editCustomersTableStringCell('name', 0, 'Bill').should('have.text', 'Bob'); // notEditable
    BreweryParameters.editCustomersTableStringCell('age', 0, '11').should('have.text', '11');
    BreweryParameters.editCustomersTableStringCell('canDrinkAlcohol', 1, 'true').should('have.text', 'true');
    BreweryParameters.editCustomersTableStringCell('favoriteDrink', 2, 'Beer').should('have.text', 'Beer');
    BreweryParameters.editCustomersTableStringCell('birthday', 3, '01/01/1991').should('have.text', '01/01/1991');
    BreweryParameters.editCustomersTableStringCell('height', 3, '2.01').should('have.text', '2.01');
    BreweryParameters.exportCustomersTableDataToCSV();
    Downloads.checkByContent('customers.csv', EXPECTED_CUSTOMERS_BASIC_EDITION);
    ScenarioParameters.updateAndLaunch();
    // Check that cells values have been saved
    BreweryParameters.getCustomersTableCell('name', 0).should('have.text', 'Bob');
    BreweryParameters.getCustomersTableCell('age', 0).should('have.text', '11');
    BreweryParameters.getCustomersTableCell('canDrinkAlcohol', 1).should('have.text', 'true');
    BreweryParameters.getCustomersTableCell('favoriteDrink', 2).should('have.text', 'Beer');
    BreweryParameters.getCustomersTableCell('birthday', 3).should('have.text', '01/01/1991');
    BreweryParameters.getCustomersTableCell('height', 3).should('have.text', '2.01');
  });

  it('must accept valid values and reject invalid values based on columns type', () => {
    const scenarioName = forgeScenarioName();
    scenarioNamesToDelete.push(scenarioName);
    Scenarios.createScenario(scenarioName, true, SCENARIO_DATASET, SCENARIO_RUN_TEMPLATE);
    BreweryParameters.switchToCustomersTab();
    ScenarioParameters.edit();
    BreweryParameters.importCustomersTableDataFromCSV(VALID_FILE_PATH);
    // Initial values
    BreweryParameters.getCustomersTableCell('age', 0).should('have.text', '10');
    BreweryParameters.getCustomersTableCell('canDrinkAlcohol', 1).should('have.text', 'false');
    BreweryParameters.getCustomersTableCell('favoriteDrink', 2).should('have.text', 'Wine');
    BreweryParameters.getCustomersTableCell('birthday', 3).should('have.text', '12/05/1987');
    BreweryParameters.getCustomersTableCell('height', 3).should('have.text', '1.83');
    // Invalid values
    BreweryParameters.editCustomersTableStringCell('age', 0, '').should('have.text', '10');
    BreweryParameters.editCustomersTableStringCell('age', 0, '$').should('have.text', '10');
    BreweryParameters.editCustomersTableStringCell('age', 0, 'foo').should('have.text', '10');
    BreweryParameters.editCustomersTableStringCell('age', 0, 'one hundred').should('have.text', '10');
    BreweryParameters.editCustomersTableStringCell('age', 0, '*55').should('have.text', '10');
    BreweryParameters.editCustomersTableStringCell('age', 0, '.36').should('have.text', '10');
    BreweryParameters.editCustomersTableStringCell('canDrinkAlcohol', 1, '').should('have.text', 'false');
    BreweryParameters.editCustomersTableStringCell('canDrinkAlcohol', 1, '$').should('have.text', 'false');
    BreweryParameters.editCustomersTableStringCell('canDrinkAlcohol', 1, 'foo').should('have.text', 'false');
    BreweryParameters.editCustomersTableStringCell('canDrinkAlcohol', 1, '00').should('have.text', 'false');
    BreweryParameters.editCustomersTableStringCell('favoriteDrink', 2, '').should('have.text', 'Wine');
    BreweryParameters.editCustomersTableStringCell('favoriteDrink', 2, '$').should('have.text', 'Wine');
    BreweryParameters.editCustomersTableStringCell('favoriteDrink', 2, 'foo').should('have.text', 'Wine');
    BreweryParameters.editCustomersTableStringCell('favoriteDrink', 2, 'Water').should('have.text', 'Wine');
    BreweryParameters.editCustomersTableStringCell('birthday', 3, '').should('have.text', '12/05/1987');
    BreweryParameters.editCustomersTableStringCell('birthday', 3, '$').should('have.text', '12/05/1987');
    BreweryParameters.editCustomersTableStringCell('birthday', 3, 'foo').should('have.text', '12/05/1987');
    BreweryParameters.editCustomersTableStringCell('birthday', 3, '1991-01-01').should('have.text', '12/05/1987');
    BreweryParameters.editCustomersTableStringCell('birthday', 3, '31/31/1991').should('have.text', '12/05/1987');
    BreweryParameters.editCustomersTableStringCell('birthday', 3, '31/02/1991').should('have.text', '12/05/1987');
    BreweryParameters.editCustomersTableStringCell('height', 3, '').should('have.text', '1.83');
    BreweryParameters.editCustomersTableStringCell('height', 3, '$').should('have.text', '1.83');
    BreweryParameters.editCustomersTableStringCell('height', 3, 'foo').should('have.text', '1.83');
    BreweryParameters.editCustomersTableStringCell('height', 3, 'one').should('have.text', '1.83');
    BreweryParameters.editCustomersTableStringCell('height', 3, '*55').should('have.text', '1.83');
    // Valid values
    BreweryParameters.editCustomersTableStringCell('age', 0, '0').should('have.text', '0');
    BreweryParameters.editCustomersTableStringCell('age', 0, '50abc').should('have.text', '50');
    BreweryParameters.editCustomersTableStringCell('age', 0, '119').should('have.text', '119');
    BreweryParameters.editCustomersTableStringCell('canDrinkAlcohol', 1, '1').should('have.text', 'true');
    BreweryParameters.editCustomersTableStringCell('canDrinkAlcohol', 1, '0').should('have.text', 'false');
    BreweryParameters.editCustomersTableStringCell('canDrinkAlcohol', 1, 'yes').should('have.text', 'true');
    BreweryParameters.editCustomersTableStringCell('canDrinkAlcohol', 1, 'no').should('have.text', 'false');
    BreweryParameters.editCustomersTableStringCell('canDrinkAlcohol', 1, 'truE').should('have.text', 'true');
    BreweryParameters.editCustomersTableStringCell('canDrinkAlcohol', 1, 'falSe').should('have.text', 'false');
    ENUM_VALUES.forEach((enumValue) => {
      BreweryParameters.editCustomersTableStringCell('favoriteDrink', 2, enumValue).should('have.text', enumValue);
    });
    BreweryParameters.editCustomersTableStringCell('birthday', 3, '01/01/1991').should('have.text', '01/01/1991');
    BreweryParameters.editCustomersTableStringCell('birthday', 3, '12/12/2012').should('have.text', '12/12/2012');
    BreweryParameters.editCustomersTableStringCell('height', 3, '0').should('have.text', '0');
    BreweryParameters.editCustomersTableStringCell('height', 3, '0.00').should('have.text', '0');
    BreweryParameters.editCustomersTableStringCell('height', 3, '.15').should('have.text', '0.15');
    BreweryParameters.editCustomersTableStringCell('height', 3, '2.15').should('have.text', '2.15');
    // Min & max values
    BreweryParameters.editCustomersTableStringCell('age', 0, '121').should('have.text', '120');
    BreweryParameters.editCustomersTableStringCell('age', 0, '-1').should('have.text', '0');
    BreweryParameters.editCustomersTableStringCell('birthday', 3, '31/12/1899').should('have.text', '01/01/1900');
    BreweryParameters.editCustomersTableStringCell('birthday', 3, '01/01/3000')
      .should('not.have.text', '01/01/1900')
      .should('not.have.text', '01/01/3000');
    BreweryParameters.editCustomersTableStringCell('height', 3, '-5').should('have.text', '0');
    BreweryParameters.editCustomersTableStringCell('height', 3, '10').should('have.text', '2.5');
  });

  it('can use undo/redo during table edition', () => {
    const scenarioName = forgeScenarioName();
    scenarioNamesToDelete.push(scenarioName);
    Scenarios.createScenario(scenarioName, true, SCENARIO_DATASET, SCENARIO_RUN_TEMPLATE);
    BreweryParameters.switchToCustomersTab();
    ScenarioParameters.edit();
    BreweryParameters.importCustomersTableDataFromCSV(VALID_FILE_PATH);
    BreweryParameters.getCustomersTableCell('canDrinkAlcohol', 1).should('have.text', 'false');
    BreweryParameters.editCustomersTableStringCell('canDrinkAlcohol', 1, 'true')
      .should('have.text', 'true')
      .type('{ctrl}z')
      .should('have.text', 'false');
    for (const i of Array(10).keys()) {
      BreweryParameters.editCustomersTableStringCell('age', 0, '' + i).should('have.text', '' + i);
    }
    BreweryParameters.getCustomersTableCell('age', 0)
      .should('have.text', '9')
      .type('{ctrl}z')
      .should('have.text', '8')
      .type('{ctrl}z')
      .should('have.text', '7')
      .type('{ctrl}z')
      .should('have.text', '6')
      .type('{ctrl}z')
      .should('have.text', '5')
      .type('{ctrl}z')
      .should('have.text', '4')
      .type('{ctrl}z')
      .should('have.text', '3')
      .type('{ctrl}z')
      .should('have.text', '2')
      .type('{ctrl}z')
      .should('have.text', '1')
      .type('{ctrl}z')
      .should('have.text', '0');
  });
});