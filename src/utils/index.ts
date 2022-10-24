import { buildClient, Client } from '@datocms/cma-client-browser';

export const getClient = (apiToken:string) : Client => {
  const client = buildClient({ apiToken });
  return client
}