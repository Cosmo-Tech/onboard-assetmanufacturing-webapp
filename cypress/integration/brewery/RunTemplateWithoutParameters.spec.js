// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import utils from '../../commons/TestUtils';
import { DATASET, RUN_TEMPLATE } from '../../commons/constants/brewery/TestConstants';
import { Scenarios, ScenarioManager, ScenarioParameters, Login } from '../../commons/actions';
import { BreweryParameters } from '../../commons/actions/brewery';

Cypress.Keyboard.defaults({
  keystrokeDelay: 0,
});

describe('Run templates without parameters', () => {
  before(() => {
    Login.login();
  });

  beforeEach(() => {
    Login.relogin();
  });

  const scenarioNamesToDelete = [];
  after(() => {
    ScenarioManager.deleteScenarioList(scenarioNamesToDelete);
  });

  it('can be created and launched', () => {
    const scenarioName = 'Test Cypress - Scenario without parameters - ' + utils.randomStr(7);
    scenarioNamesToDelete.push(scenarioName);
    Scenarios.createScenario(scenarioName, true, DATASET.BREWERY_ADT, RUN_TEMPLATE.WITHOUT_PARAMETERS).then((value) => {
      ScenarioParameters.getParametersEditButton().should('be.disabled');
      BreweryParameters.getDatasetPartsTab().should('not.exist');
      BreweryParameters.getExtraDatasetPartTab().should('not.exist');
      BreweryParameters.getBasicTypesTab().should('not.exist');
      BreweryParameters.getCustomersTab().should('not.exist');
      BreweryParameters.getEventsTab().should('not.exist');
      BreweryParameters.getAdditionalParametersTab().should('not.exist');
      ScenarioParameters.getNoParametersPlaceholder().should('exist');
      ScenarioParameters.launch();
    });
  });
});
