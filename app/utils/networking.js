import axios from 'axios';
import {
  EXHIBITION_SERVER_GET,
  EXHIBITION_SERVER_POST
} from '../constants/keys';
import type { Configuration } from '../reducers/configuration';

export async function loadConfiguration(
  exhibitionIdentifier: string
): Promise<Configuration> {
  const webConfigurationUrl = EXHIBITION_SERVER_GET + exhibitionIdentifier;
  const response = await axios.get(webConfigurationUrl);

  if (response.status !== 200) {
    throw Error(
      `Network Error: Pulling ${webConfigurationUrl} returned ${
        response.status
      }`
    );
  }
  const configuration = response.data;

  if (!configuration || !configuration.configurationVersion) {
    throw Error(
      `Network Error: Pulling ${webConfigurationUrl} returned illegal configuration:
${JSON.stringify(configuration, null, 2)}`
    );
  }

  return configuration;
}

export async function submitConfiguration(configuration: Configuration) {
  await axios.post(EXHIBITION_SERVER_POST, configuration);
}
