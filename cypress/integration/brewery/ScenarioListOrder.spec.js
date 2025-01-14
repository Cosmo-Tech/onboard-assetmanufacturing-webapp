import { Login, ScenarioManager, Scenarios } from '../../commons/actions';
import { ALL_ROOT_SCENARIOS, PARENT_AND_CHILD_SCENARIOS } from '../../fixtures/stubbing/ScenarioListOrder/scenarios';
import { USER_EXAMPLE } from '../../fixtures/stubbing/default';
import { stub } from '../../commons/services/stubbing';
import { routeUtils as route } from '../../commons/utils';

Cypress.Keyboard.defaults({
  keystrokeDelay: 0,
});

describe('check scenario sorted list after reload', () => {
  before(() => {
    stub.start({
      GET_SCENARIOS: true,
    });
    stub.setScenarios(ALL_ROOT_SCENARIOS);
    Login.login();
  });

  beforeEach(() => {
    Login.relogin();
  });

  after(() => {
    stub.stop();
  });

  it('checks first scenario in the list after reload', () => {
    Scenarios.selectScenario(ALL_ROOT_SCENARIOS[1].name, ALL_ROOT_SCENARIOS[1].id);
    route.browse('/scenario');
    Scenarios.getScenarioSelectorInput().should('have.value', ALL_ROOT_SCENARIOS[0].name);
  });
});

describe('check the list of sorted scenarios after deleting the current scenario', () => {
  before(() => {
    stub.start({
      AUTHENTICATION: true,
      GET_SCENARIOS: true,
      CREATE_AND_DELETE_SCENARIO: true,
    });
    stub.setFakeUser(USER_EXAMPLE);
    stub.setFakeRoles(['Organization.Collaborator']);
    stub.setScenarios(PARENT_AND_CHILD_SCENARIOS);
    Login.login();
  });

  beforeEach(() => {
    Login.relogin();
  });

  after(() => {
    stub.stop();
  });

  it('deletes current scenario and checks sorted list', () => {
    Scenarios.getScenarioSelectorInput().should('have.value', PARENT_AND_CHILD_SCENARIOS[0].name);
    ScenarioManager.switchToScenarioManager();
    ScenarioManager.deleteScenario(PARENT_AND_CHILD_SCENARIOS[0].name);
    Scenarios.switchToScenarioView();
    Scenarios.getScenarioSelectorInput().should('have.value', PARENT_AND_CHILD_SCENARIOS[1].name);
    ScenarioManager.switchToScenarioManager();
    ScenarioManager.deleteScenario(PARENT_AND_CHILD_SCENARIOS[1].name);
    Scenarios.switchToScenarioView();
    Scenarios.getScenarioSelectorInput().should('have.value', PARENT_AND_CHILD_SCENARIOS[2].name);
    ScenarioManager.switchToScenarioManager();
    ScenarioManager.deleteScenario(PARENT_AND_CHILD_SCENARIOS[2].name);
  });
});
