import path from 'node:path';
import { test } from '../../src/fixtures/test.fixture';
import { runFeature } from '../../src/bdd/BDDRunner';

// Imported for its side effect only: registers this domain's step
// definitions into the shared step registry before the feature runs.
import '../../src/steps/authentication/login.steps';

runFeature(test, path.join(__dirname, '../../features/authentication/login.feature'));
