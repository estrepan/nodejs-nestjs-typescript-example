export default () => ({
  env: process.env.APP_ENV || 'dev',
  port: +process.env.APP_PORT || 3001,

  maxUploadFileSize: process.env.MAX_UPLOAD_FILE_SIZE || 1073741824,

  aws: {
    accessKeyID: process.env.AWS_ACCESS_KEY_ID,
    accountId: process.env.AWS_ACCOUNT_ID,
    bucketName: process.env.AWS_BUCKET_NAME,
    federatedUserName: process.env.AWS_FEDERATED_USER_NAME,
    region: process.env.AWS_REGION,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

    elasticTranscoder: {
      pipelineId: process.env.AWS_ELASTIC_TRANSCODER_PIPELINE_ID,
    },
  },
  facebook: {
    secret: process.env.FACEBOOK_SECRET,
  },
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    appId: process.env.FIREBASE_APP_ID,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseUrl: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    region: process.env.FIREBASE_REGION,
    serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    serviceAccountKeyPath: process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH,
  },
  firestore: {
    emulatorHost: process.env.FIRESTORE_EMULATOR_HOST,
  },
  hubspot: {
    apiKey: process.env.HUBSPOT_API_KEY,
  },
  s3: {
    fileTokenExpires: process.env.S3_FILE_TOKEN_EXPIRES,
  },
  stripe: {
    apiKey: process.env.STRIPE_API_KEY,
    subscriptionProductId: process.env.STRIPE_SUBSCRIPTION_PRODUCT_ID,
  },
  paypal: {
    environment: process.env.PAYPAL_ENVIRONMENT,
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    urlPlans: process.env.PAYPAL_URL_PLANS || '/v1/billing/plans',
    urlProduct: process.env.PAYPAL_URL_PRODUCT || '/v1/catalogs/products',
  },
  swagger: {
    serverUrl: process.env.SWAGGER_SERVER_URL,
  },
});
