// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Backdrop,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { ScenarioParameters } from '../../components';
import { useTranslation } from 'react-i18next';
import {
  CreateScenarioButton,
  HierarchicalComboBox,
  ScenarioValidationStatusChip,
  SimplePowerBIReportEmbed,
} from '@cosmotech/ui';
import { sortScenarioList } from '../../utils/SortScenarioListUtils';
import { LOG_TYPES } from '../../services/scenarioRun/ScenarioRunConstants.js';
import { SCENARIO_VALIDATION_STATUS } from '../../services/config/ApiConstants.js';
import { SCENARIO_RUN_LOG_TYPE } from '../../services/config/FunctionalConstants';
import {
  USE_POWER_BI_WITH_USER_CREDENTIALS,
  SCENARIO_VIEW_IFRAME_DISPLAY_RATIO,
  SCENARIO_DASHBOARD_CONFIG,
} from '../../config/PowerBI';
import ScenarioService from '../../services/scenario/ScenarioService';
import ScenarioRunService from '../../services/scenarioRun/ScenarioRunService';
import { STATUSES } from '../../state/commons/Constants';
import { AppInsights } from '../../services/AppInsights';
import { PERMISSIONS } from '../../services/config/Permissions';
import { PermissionsGate } from '../../components/PermissionsGate';
import { getCreateScenarioDialogLabels, getReportLabels } from './labels';
import { useNavigate, useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  content: {
    paddingTop: '16px',
    paddingLeft: '8px',
    paddingRight: '8px',
  },
  rightButton: {
    marginLeft: '8px',
  },
  alignRight: {
    textAlign: 'right',
  },
  runTemplate: {
    color: theme.palette.text.secondary,
  },
}));

const appInsights = AppInsights.getInstance();

const Scenario = (props) => {
  const classes = useStyles();
  const { t, i18n } = useTranslation();

  const {
    setScenarioValidationStatus,
    currentScenario,
    scenarioList,
    findScenarioById,
    datasetList,
    user,
    workspace,
    solution,
    addDatasetToStore,
    createScenario,
    updateCurrentScenario,
    updateAndLaunchScenario,
    launchScenario,
    reports,
    setApplicationErrorMessage,
  } = props;

  const routerParameters = useParams();
  const navigate = useNavigate();
  const workspaceId = workspace.data.id;
  const [editMode, setEditMode] = useState(false);

  const createScenarioDialogLabels = getCreateScenarioDialogLabels(t, editMode);
  const reportLabels = getReportLabels(t);

  // Get the right report for given run template
  const currentScenarioRunTemplateReport = Array.isArray(SCENARIO_DASHBOARD_CONFIG)
    ? SCENARIO_DASHBOARD_CONFIG
    : currentScenario?.data?.runTemplateId in SCENARIO_DASHBOARD_CONFIG
    ? [SCENARIO_DASHBOARD_CONFIG[currentScenario.data.runTemplateId]]
    : [];
  // Add accordion expand status in state
  const [accordionSummaryExpanded, setAccordionSummaryExpanded] = useState(
    localStorage.getItem('scenarioParametersAccordionExpanded') === 'true'
  );

  const handleScenarioChange = (event, scenario) => {
    findScenarioById(workspaceId, scenario.id);
  };

  useEffect(() => {
    localStorage.setItem('scenarioParametersAccordionExpanded', accordionSummaryExpanded);
  }, [accordionSummaryExpanded]);

  useEffect(() => {
    if (sortedScenarioList.length !== 0) {
      if (routerParameters.id === undefined) {
        navigate(`/scenario/${currentScenario.data.id}`);
      } else if (currentScenario.data.id !== routerParameters.id) {
        const scenarioFromUrl = { id: routerParameters.id };
        handleScenarioChange(event, scenarioFromUrl);
        navigate(`/scenario/${scenarioFromUrl.id}`);
      }
    } else {
      navigate('/scenario');
    }
    // eslint-disable-next-line
  }, []);

  // this function enables backwards navigation between scenario's URLs
  window.onpopstate = (e) => {
    const scenarioFromUrl = scenarioList.data.find((el) => el.id === routerParameters.id);
    if (scenarioFromUrl) handleScenarioChange(event, scenarioFromUrl);
  };

  useEffect(() => {
    if (sortedScenarioList.length > 0) {
      if (currentScenario.data === null) {
        handleScenarioChange(event, sortedScenarioList[0]);
        navigate(`/scenario/${sortedScenarioList[0].id}`);
      } else if (currentScenario.data.id !== routerParameters.id) {
        navigate(`/scenario/${currentScenario.data.id}`);
        updateCurrentScenario({ status: STATUSES.SUCCESS });
      }
    }
    // eslint-disable-next-line
  }, [currentScenario]);

  const expandParametersAndCreateScenario = (workspaceId, scenarioData) => {
    createScenario(workspaceId, scenarioData);
    setAccordionSummaryExpanded(true);
  };

  const currentScenarioRenderInputTooltip = editMode
    ? t(
        'views.scenario.dropdown.scenario.tooltip.disabled',
        'Please save or discard current modifications before selecting another scenario'
      )
    : '';

  useEffect(() => {
    appInsights.setScenarioData(currentScenario.data);
  }, [currentScenario]);

  const sortedScenarioList = sortScenarioList(scenarioList.data.slice());
  const noScenario = currentScenario.data === null;
  const scenarioListDisabled = editMode || scenarioList === null || noScenario;
  const scenarioListLabel = noScenario ? null : t('views.scenario.dropdown.scenario.label', 'Scenario');
  const showBackdrop = currentScenario.status === STATUSES.LOADING;

  let filteredRunTemplates = solution?.data?.runTemplates || [];
  const solutionRunTemplates = workspace.data?.solution?.runTemplateFilter;
  if (solutionRunTemplates) {
    filteredRunTemplates = filteredRunTemplates.filter(
      (runTemplate) => solutionRunTemplates.indexOf(runTemplate.id) !== -1
    );
  }
  const downloadLogsFile = () => {
    return ScenarioRunService.downloadLogsFile(currentScenario.data?.lastRun, LOG_TYPES[SCENARIO_RUN_LOG_TYPE]);
  };
  const resetScenarioValidationStatus = async () => {
    const currentStatus = currentScenario.data.validationStatus;
    try {
      setScenarioValidationStatus(currentScenario.data.id, SCENARIO_VALIDATION_STATUS.LOADING);
      await ScenarioService.resetValidationStatus(workspaceId, currentScenario.data.id);
      findScenarioById(workspaceId, currentScenario.data.id);
    } catch (error) {
      setApplicationErrorMessage(
        error,
        t('commoncomponents.banner.resetStatusValidation', 'A problem occurred during validation status reset.')
      );
      setScenarioValidationStatus(currentScenario.data.id, currentStatus);
    }
  };
  const validateScenario = async () => {
    try {
      setScenarioValidationStatus(currentScenario.data.id, SCENARIO_VALIDATION_STATUS.LOADING);
      await ScenarioService.setScenarioValidationStatusToValidated(workspaceId, currentScenario.data.id);
      findScenarioById(workspaceId, currentScenario.data.id);
    } catch (error) {
      setApplicationErrorMessage(
        error,
        t('commoncomponents.banner.validateScenario', 'A problem occurred during scenario validation.')
      );
      setScenarioValidationStatus(currentScenario.data.id, SCENARIO_VALIDATION_STATUS.DRAFT);
    }
  };
  const rejectScenario = async () => {
    try {
      setScenarioValidationStatus(currentScenario.data.id, SCENARIO_VALIDATION_STATUS.LOADING);
      await ScenarioService.setScenarioValidationStatusToRejected(workspaceId, currentScenario.data.id);
      findScenarioById(workspaceId, currentScenario.data.id);
    } catch (error) {
      setApplicationErrorMessage(
        error,
        t('commoncomponents.banner.rejectScenario', 'A problem occurred during scenario rejection.')
      );
      setScenarioValidationStatus(currentScenario.data.id, SCENARIO_VALIDATION_STATUS.DRAFT);
    }
  };

  const scenarioValidationStatusLabels = {
    rejected: t('views.scenario.validation.rejected', 'Rejected'),
    validated: t('views.scenario.validation.validated', 'Validated'),
  };
  const currentScenarioValidationStatus = currentScenario?.data?.validationStatus || SCENARIO_VALIDATION_STATUS.UNKNOWN;
  const showValidationChip =
    [SCENARIO_VALIDATION_STATUS.DRAFT, SCENARIO_VALIDATION_STATUS.UNKNOWN].includes(currentScenarioValidationStatus) ===
    false;

  const validateButton = (
    <Button
      className={classes.rightButton}
      data-cy="validate-scenario-button"
      disabled={editMode}
      variant="outlined"
      color="primary"
      onClick={(event) => validateScenario()}
    >
      {t('views.scenario.validation.validate', 'Validate')}
    </Button>
  );
  const rejectButton = (
    <Button
      className={classes.rightButton}
      data-cy="reject-scenario-button"
      disabled={editMode}
      variant="outlined"
      color="primary"
      onClick={(event) => rejectScenario()}
    >
      {t('views.scenario.validation.reject', 'Reject')}
    </Button>
  );

  const validateButtonTooltipWrapper = editMode ? (
    <Tooltip
      title={t(
        'views.scenario.validation.disabledTooltip',
        'Please save or discard current modifications before changing the scenario validation status'
      )}
    >
      <span>{validateButton}</span>
    </Tooltip>
  ) : (
    validateButton
  );

  const rejectButtonTooltipWrapper = editMode ? (
    <Tooltip
      title={t(
        'views.scenario.validation.disabledTooltip',
        'Please save or discard current modifications before changing the scenario validation status'
      )}
    >
      <span>{rejectButton}</span>
    </Tooltip>
  ) : (
    rejectButton
  );

  const validationStatusButtons = (
    <PermissionsGate authorizedPermissions={[PERMISSIONS.canChangeScenarioValidationStatus]}>
      {validateButtonTooltipWrapper}
      {rejectButtonTooltipWrapper}
    </PermissionsGate>
  );

  const scenarioValidationStatusChip = (
    <PermissionsGate
      authorizedPermissions={[PERMISSIONS.canChangeScenarioValidationStatus]}
      RenderNoPermissionComponent={ScenarioValidationStatusChip}
      noPermissionProps={{
        status: currentScenarioValidationStatus,
        labels: scenarioValidationStatusLabels,
        onDelete: null,
      }}
    >
      <ScenarioValidationStatusChip
        status={currentScenarioValidationStatus}
        onDelete={resetScenarioValidationStatus}
        labels={scenarioValidationStatusLabels}
      />
    </PermissionsGate>
  );

  const scenarioValidationArea = showValidationChip ? scenarioValidationStatusChip : validationStatusButtons;

  const hierarchicalComboBoxLabels = {
    label: scenarioListLabel,
    validationStatus: scenarioValidationStatusLabels,
  };
  return (
    <>
      <Backdrop open={showBackdrop} style={{ zIndex: '10000' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <div data-cy="scenario-view" className={classes.content}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={4}>
            <PermissionsGate authorizedPermissions={[PERMISSIONS.canCreateScenario]}>
              <CreateScenarioButton
                solution={solution}
                workspaceId={workspaceId}
                createScenario={expandParametersAndCreateScenario}
                currentScenario={currentScenario}
                runTemplates={filteredRunTemplates}
                datasets={datasetList.data}
                scenarios={scenarioList.data}
                user={user}
                disabled={editMode}
                labels={createScenarioDialogLabels}
              />
            </PermissionsGate>
          </Grid>
          <Grid item xs={4}>
            <Grid container direction="column">
              <HierarchicalComboBox
                value={currentScenario.data}
                values={sortedScenarioList}
                labels={hierarchicalComboBoxLabels}
                handleChange={handleScenarioChange}
                disabled={scenarioListDisabled}
                renderInputToolType={currentScenarioRenderInputTooltip}
              />
              {currentScenario.data && (
                <Typography
                  data-cy="run-template-name"
                  variant="caption"
                  align="center"
                  className={classes.runTemplate}
                >
                  {t('views.scenario.text.scenariotype')}: {currentScenario.data.runTemplateName}
                </Typography>
              )}
            </Grid>
          </Grid>
          <Grid item xs={4} className={classes.alignRight}>
            {currentScenario.data && scenarioValidationArea}
          </Grid>
          <Grid item xs={12}>
            <Card component={Paper} elevation={2}>
              {currentScenario.data && (
                <ScenarioParameters
                  editMode={editMode}
                  changeEditMode={setEditMode}
                  addDatasetToStore={addDatasetToStore}
                  updateAndLaunchScenario={updateAndLaunchScenario}
                  launchScenario={launchScenario}
                  accordionSummaryExpanded={accordionSummaryExpanded}
                  onChangeAccordionSummaryExpanded={setAccordionSummaryExpanded}
                  workspaceId={workspaceId}
                  solution={solution.data}
                  datasets={datasetList.data}
                  currentScenario={currentScenario}
                  scenarioId={currentScenario.data.id}
                  scenarioList={scenarioList.data}
                  userRoles={user.roles}
                />
              )}
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card component={Paper} elevation={2}>
              <CardContent>
                <SimplePowerBIReportEmbed
                  // key is used here to assure the complete re-rendering of the component when scenario changes ; we
                  // need to remount it to avoid errors in powerbi-client-react which throws an error if filters change
                  key={currentScenario?.data?.id}
                  reports={reports}
                  reportConfiguration={currentScenarioRunTemplateReport}
                  scenario={currentScenario.data}
                  lang={i18n.language}
                  downloadLogsFile={currentScenario.data?.lastRun ? downloadLogsFile : null}
                  labels={reportLabels}
                  useAAD={USE_POWER_BI_WITH_USER_CREDENTIALS}
                  iframeRatio={SCENARIO_VIEW_IFRAME_DISPLAY_RATIO}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

Scenario.propTypes = {
  setScenarioValidationStatus: PropTypes.func.isRequired,
  scenarioList: PropTypes.object.isRequired,
  datasetList: PropTypes.object.isRequired,
  currentScenario: PropTypes.object.isRequired,
  findScenarioById: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  workspace: PropTypes.object.isRequired,
  solution: PropTypes.object.isRequired,
  addDatasetToStore: PropTypes.func.isRequired,
  createScenario: PropTypes.func.isRequired,
  updateCurrentScenario: PropTypes.func.isRequired,
  updateAndLaunchScenario: PropTypes.func.isRequired,
  launchScenario: PropTypes.func.isRequired,
  reports: PropTypes.object.isRequired,
  setApplicationErrorMessage: PropTypes.func,
};

export default Scenario;
