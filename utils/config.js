
module.exports = {
  creds: {
    redirectUrl: 'http://localhost:3002/token',
    clientID: 'CLIENT_ID',
    clientSecret: 'CLIENT_SECRET',
    identityMetadata: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
    allowHttpForRedirectUrl: true,
    responseType: 'code',
    validateIssuer: false,
    responseMode: 'query',
    scope: ['User.Read', 'User.ReadBasic.All' , 'Mail.Send', 'Files.ReadWrite']
  }
};
