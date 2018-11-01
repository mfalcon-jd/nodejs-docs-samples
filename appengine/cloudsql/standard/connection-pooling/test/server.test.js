/**
 * Copyright 2018, Google, LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const express = require(`express`);
const path = require(`path`);
const proxyquire = require(`proxyquire`).noCallThru();
const request = require(`supertest`);
const sinon = require(`sinon`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const SAMPLE_PATH = path.join(__dirname, `../server.js`);

function getSample () {
  const testApp = express();
  sinon.stub(testApp, `listen`).yields();
  const expressMock = sinon.stub().returns(testApp);
  const mysqlMock = {
    createPool: sinon.stub().returns({
      query: sinon.stub().yields(null, [{now: `0`}], null)
    })
  };

  const app = proxyquire(SAMPLE_PATH, {
    mysql: mysqlMock,
    express: expressMock
  });

  return {
    app: app,
    mocks: {
      express: expressMock,
      mysql: mysqlMock
    }
  };
}

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test.cb(`should return current time`, (t) => {
  const sample = getSample();

  request(sample.app)
    .get(`/`)
    .expect(200)
    .expect(res => {
      t.is(res.text, `Current time: 0`);
    })
    .end(t.end);
});
