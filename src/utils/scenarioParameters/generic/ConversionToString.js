// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import { DATASET_ID_VARTYPE } from '../../../services/config/ApiConstants';

function _convertEnumToString(parameterValue) {
  return parameterValue; // Already a string
}

function _convertStringToString(parameterValue) {
  return parameterValue; // Already a string
}

function _convertIntToString(parameterValue) {
  return parameterValue.toString();
}

function _convertNumberToString(parameterValue) {
  return parameterValue.toString();
}

function _convertBoolToString(parameterValue) {
  return parameterValue.toString();
}

function _convertDateToString(parameterValue) {
  return parameterValue.toISOString();
}

function _convertDatasetIdToString(parameterValue) {
  return parameterValue; // Already a string
}

export const GENERIC_VAR_TYPES_TO_STRING_FUNCTIONS = {
  enum: _convertEnumToString,
  string: _convertStringToString,
  int: _convertIntToString,
  number: _convertNumberToString,
  bool: _convertBoolToString,
  date: _convertDateToString,
  [DATASET_ID_VARTYPE]: _convertDatasetIdToString, // "%DATASETID%" varType
};
