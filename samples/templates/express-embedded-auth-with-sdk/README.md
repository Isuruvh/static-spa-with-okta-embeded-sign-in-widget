# Okta Auth JS - Static Single Page Application (Static SPA) Sample

This sample demonstrates how to integrate the `@okta/okta-auth-js` SDK and the **Okta Embedded Sign-In Widget** into a plain/static HTML & JavaScript Single Page Application (SPA) to establish authentication with an Okta Authorization Server.

---

## Overview & Architecture

This application showcases client-side authentication flows using Okta Identity Engine (IDX) / Interaction Code Flow and classic authentication (`authn`).

Key components include:
* **Okta Auth JS SDK (`@okta/okta-auth-js`)**: Client-side library managing authentication tokens, session states, and Okta Identity Engine (IDX) APIs.
* **Okta Sign-In Widget (`@okta/okta-signin-widget`)**: Embedded widget component providing pre-built UI flows for login, MFA, and self-service password recovery.
* **Express Development Server**: Serves static HTML/JS assets and proxies OAuth2 endpoints to prevent CORS issues during local development.

---


## Prerequisites

* **Node.js**: `>=20.11.0`
* **Package Manager**: **Yarn 1.22.x** (`1.22.22` recommended)
* An active **Okta Developer Org** with a Single-Page Application (SPA) integration configured.

---

## Configuration

The application reads configuration parameters from the URL query parameters or falls back to standard inline defaults in `app.js`.

### Key Configuration Options

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `issuer` | `string` | Okta Org Authorization Server URL (e.g., `https://{yourOktaDomain}/oauth2/default`) |
| `clientId` | `string` | Client ID from your Okta SPA application settings |
| `redirectUri` | `string` | Redirect callback URL (default: `http://localhost:8080/login/callback`) |
| `scopes` | `Array<string>` | Requested OIDC scopes (e.g., `['openid', 'email', 'profile']`) |
| `authMethod` | `string` | Authentication method: `"form"` (custom form), `"widget"` (embedded sign-in widget), or `"redirect"` |
| `storage` | `string` | Token storage location (`"sessionStorage"`, `"localStorage"`, `"memory"`, or `"cookie"`) |
| `useInteractionCodeFlow` | `boolean` | Set to `true` to enable Okta Identity Engine (IDX) Interaction Code Flow |

---

## Installation & Running

### 1. Build the Root SDK

Before starting the sample application, compile the parent Okta Auth JS SDK:

```bash
# Install workspace dependencies
yarn install

# Build the SDK artifacts (CommonJS, ESM, and browser bundles)
yarn build

. Start the Static SPA Server
Run the static-spa workspace command:

yarn workspace @okta/samples.static-spa start
Or start the Express server directly from the workspace root:

yarn start
The application will launch at http://localhost:8080.

Features & Auth Flow Implementation
1. Initializing OktaAuth Client
The OktaAuth client instance is instantiated with the issuer, client ID, and storage configuration:
const authClient = new OktaAuth({
  issuer: config.issuer,
  clientId: config.clientId,
  redirectUri: config.redirectUri,
  scopes: config.scopes,
  useInteractionCodeFlow: true,
  tokenManager: {
    storage: config.storage
  }
});

2. Embedded Authentication Flow (Custom Form / IDX)
Credentials collected via the embedded login form trigger authClient.idx.authenticate:

authClient.idx.authenticate({ username, password })
  .then(handleTransaction)
  .catch(showError);
3. Handling Transactions & MFA
The handleTransaction function evaluates the response status:

PENDING: Renders additional MFA or step-up authentication prompts.
SUCCESS: Stores OIDC tokens in session storage and concludes authentication.
FAILURE: Renders error messages.