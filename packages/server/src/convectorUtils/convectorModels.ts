import { BaseStorage } from '@worldsibu/convector-core';
import { CouchDBStorage } from '@worldsibu/convector-storage-couchdb';
// import { FinancialController } from 'financial-cc';
import { Env } from './env';
import {
  CHAINCODE, COUCHDB_HOST,
  COUCHDB_PROTOCOL, COUCHDB_PORT, CHANNEL, identity
} from '../utils';

/**
 * Route to the CouchDB
 */
BaseStorage.current = new CouchDBStorage({
  host: COUCHDB_HOST,
  protocol: COUCHDB_PROTOCOL,
  port: COUCHDB_PORT
}, `${CHANNEL}_${CHAINCODE}`);

export async function couchQueryAll(view: string, type: any, queryOptions?: {},
  col?: string, userId?: string) {
  const channel = CHANNEL;
  const cc = CHAINCODE;
  const dbName = `${channel}_${cc}${col ? `$$p${col}` : ''}`;
  const viewUrl = `_design/${cc}/_view/${view}`;

  const identityToQuery = identity(userId);
  console.log(`calling couch to ${identityToQuery.couch.port} in db ${dbName}`);


  BaseStorage.current = new CouchDBStorage({
    host: identityToQuery.couch.host,
    protocol: identityToQuery.couch.protocol,
    port: identityToQuery.couch.port,
  });

  try {
    const results = <any[]>(await type.query(type, dbName, viewUrl, queryOptions));
    return results.map(result => result.toJSON());
  } catch (err) {
    console.log(err);
    if (err.code === 'EDOCMISSING') {
      return [];
    } else {
      throw err;
    }
  }
}

export {
  Patient, CreateClaim, AdjudicateClaim,
  Organization,
  FeeExtensionsConfig
} from 'financial-cc';
