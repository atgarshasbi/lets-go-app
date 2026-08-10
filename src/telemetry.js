import { ApplicationInsights } from '@microsoft/applicationinsights-web';

// Connection string is public by design (client-side telemetry ingestion only,
// no read/manage access) — safe to hardcode, same as the license API URL.
const CONNECTION_STRING =
  'InstrumentationKey=f19464ea-527c-451a-bbae-1e275649cee6;' +
  'IngestionEndpoint=https://centralus-2.in.applicationinsights.azure.com/;' +
  'LiveEndpoint=https://centralus.livediagnostics.monitor.azure.com/;' +
  'ApplicationId=dde3b604-bf4d-4e76-84a9-f6aacab87ac3';

export const appInsights = new ApplicationInsights({
  config: {
    connectionString: CONNECTION_STRING,
    enableAutoRouteTracking: true,
    disableFetchTracking: false,
  },
});

appInsights.loadAppInsights();
appInsights.trackPageView();
