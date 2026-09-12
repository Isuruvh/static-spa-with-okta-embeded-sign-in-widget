/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


// @ts-nocheck
/* global OktaAuth {{#if signinWidget}}, OktaSignIn{{/if}} */
var config = {
  issuer: `https://integrator-4503275.okta.com/oauth2/default`, //For example, `"https://example.okta.com/oauth2/default"`
  clientId: `0oa17ico0eyd1YA50698`, // for example, `0oa2am3kk1CraJ8xO1d7`
  scopes: ['openid','email'],
  storage: 'sessionStorage',
  useInteractionCodeFlow: true,
  requireUserSession: 'true',
  authMethod: 'form',
  startService: false,
  useDynamicForm: false,
  uniq: Date.now() + Math.round(Math.random() * 1000), // to guarantee a unique state
  idps: '',
};



 function createAuthClient() {
  // The `OktaAuth` constructor can throw if the config is malformed
  try {
    authClient = new OktaAuth({
      issuer: config.issuer,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      scopes: config.scopes,
      useInteractionCodeFlow: true,
      tokenManager: {
        storage: config.storage
      },
      transformAuthState
    });
    if (config.startService) {
      authClient.start();
    }
  } catch (error) {
    return showError(error);
  }
}
function submitStaticSigninForm() {
  const username = document.querySelector('#static-signin-form input[name=username]').value;
  const password = document.querySelector('#static-signin-form input[name=password]').value;

  if (!config.useInteractionCodeFlow) {
    // Authn
    return authClient.signIn({ username, password })
      .then(handleTransaction)
      .catch(showError);
  }

  return authClient.idx.authenticate({ username, password })
    .then(handleTransaction)
    .catch(showError);

}

function handleTransaction(transaction) {
  if (!config.useInteractionCodeFlow) {
    // Authn
    return handleTransactionAuthn(transaction);
  }

  // IDX
  if (transaction.messages) {
    showError(transaction.messages);
  }

  switch (transaction.status) {
    case 'PENDING':
      if (transaction.nextStep.name === 'identify') {
        renderDynamicSigninForm(transaction);
        break;
      }
      hideSigninForm();
      updateAppState({ transaction });
      showMfa();
      break;
    case 'FAILURE':
      showError(transaction.error);
      break;
    case 'SUCCESS':
      hideSigninForm();
      endAuthFlow(transaction.tokens);
      break;
    default:
      throw new Error(transaction.status + ' status');
  }
}

function getUserInfo() {
  return authClient.token.getUserInfo()
    .then(function(value) {
      updateAppState({ userInfo: value });
      renderApp();
    })
    .catch(function (error) {
      // This is expected when Okta SSO does not exist
      showError(error);
    });
}



