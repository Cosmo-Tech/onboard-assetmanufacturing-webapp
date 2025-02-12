// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

export const getScenarioManagerLabels = (t) => ({
  status: t('commoncomponents.scenariomanager.treelist.node.status.label'),
  successful: t('commoncomponents.scenariomanager.treelist.node.status.successful'),
  running: t('commoncomponents.scenariomanager.treelist.node.status.running'),
  failed: t('commoncomponents.scenariomanager.treelist.node.status.failed'),
  created: t('commoncomponents.scenariomanager.treelist.node.status.created'),
  delete: t('commoncomponents.scenariomanager.treelist.node.action.delete'),
  redirect: t('commoncomponents.scenariomanager.treelist.node.action.redirect'),
  scenarioRename: {
    title: t('commoncomponents.dialog.create.scenario.input.scenarioname.label'),
    errors: {
      emptyScenarioName: t('commoncomponents.dialog.create.scenario.input.scenarioname.error.empty'),
      forbiddenCharsInScenarioName: t(
        'commoncomponents.dialog.create.scenario.input.scenarioname.error.forbiddenchars'
      ),
      existingScenarioName: t('commoncomponents.dialog.create.scenario.input.scenarioname.error.existing'),
    },
  },
  deleteDialog: {
    description: t(
      'commoncomponents.dialog.confirm.delete.description',
      'The scenario will be deleted. If this scenario has children, ' +
        'then its parent will become the new parent of all these scenarios.'
    ),
    cancel: t('commoncomponents.dialog.confirm.delete.button.cancel', 'Cancel'),
    confirm: t('commoncomponents.dialog.confirm.delete.button.confirm', 'Confirm'),
  },
  searchField: t('commoncomponents.scenariomanager.treelist.node.text.search'),
  toolbar: {
    expandAll: t('commoncomponents.scenariomanager.toolbar.expandAll', 'Expand all'),
    expandTree: t('commoncomponents.scenariomanager.toolbar.expandTree', 'Expand tree'),
    collapseAll: t('commoncomponents.scenariomanager.toolbar.collapseAll', 'Collapse all'),
  },
  validationStatus: {
    rejected: t('views.scenario.validation.rejected', 'Rejected'),
    validated: t('views.scenario.validation.validated', 'Validated'),
  },
});
