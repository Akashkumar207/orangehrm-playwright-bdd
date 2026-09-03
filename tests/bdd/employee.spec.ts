import path from 'node:path';
import { test } from '../../src/fixtures/test.fixture';
import { runFeature } from '../../src/bdd/BDDRunner';

import '../../src/steps/employee/employee.steps';

runFeature(test, path.join(__dirname, '../../features/employee/employee.feature'));
