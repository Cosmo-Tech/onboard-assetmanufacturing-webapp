// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

// Available scenario actions
export const SCENARIO_ACTIONS_KEY = {
  GET_ALL_SCENARIOS: 'GET_ALL_SCENARIOS',
  SET_ALL_SCENARIOS: 'SET_ALL_SCENARIOS',
  GET_CURRENT_SCENARIO: 'GET_CURRENT_SCENARIO',
  SET_CURRENT_SCENARIO: 'SET_CURRENT_SCENARIO',
  RESET_CURRENT_SCENARIO: 'RESET_CURRENT_SCENARIO',
  FIND_SCENARIO_BY_ID: 'FIND_SCENARIO_BY_ID',
  CREATE_SCENARIO: 'CREATE_SCENARIO',
  DELETE_SCENARIO: 'DELETE_SCENARIO',
  RENAME_SCENARIO: 'RENAME_SCENARIO', // Use to call Saga rename function
  UPDATE_AND_LAUNCH_SCENARIO: 'UPDATE_AND_LAUNCH_SCENARIO',
  LAUNCH_SCENARIO: 'LAUNCH_SCENARIO',
  UPDATE_SCENARIO: 'UPDATE_SCENARIO',
  SET_SCENARIO_VALIDATION_STATUS: 'SET_SCENARIO_VALIDATION_STATUS',
  SET_SCENARIO_NAME: 'SET_SCENARIO_NAME', // Use to update reducer by setting scenario name in scenarios list
  START_SCENARIO_STATUS_POLLING: 'START_SCENARIO_STATUS_POLLING',
  STOP_SCENARIO_STATUS_POLLING: 'STOP_SCENARIO_STATUS_POLLING',
};
