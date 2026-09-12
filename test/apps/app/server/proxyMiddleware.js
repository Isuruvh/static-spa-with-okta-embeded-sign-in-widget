const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function proxyMiddlewareFactory(options) {
  const issuer = process.env.ISSUER || 'https://example.okta.com/oauth2/default';
  const { origin } = new URL(issuer);
  return createProxyMiddleware(Object.assign({
    target: origin,
    secure: false,
    changeOrigin: true,
  }, options));
};
