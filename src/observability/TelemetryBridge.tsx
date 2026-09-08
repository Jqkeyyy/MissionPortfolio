import { Fragment, type ReactNode, useEffect } from 'react';
import { installGlobalErrorMonitoring, type ErrorMonitoringTarget } from './installGlobalErrorMonitoring';
import { telemetryClient, type TelemetryClient } from './telemetryClient';

interface TelemetryBridgeProps {
  children?: ReactNode;
  client?: TelemetryClient;
  errorTarget?: ErrorMonitoringTarget;
}

export const TelemetryBridge = ({
  children,
  client = telemetryClient,
  errorTarget,
}: TelemetryBridgeProps) => {
  useEffect(
    () => installGlobalErrorMonitoring(client, errorTarget),
    [client, errorTarget],
  );

  return <Fragment>{children}</Fragment>;
};
