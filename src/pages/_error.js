import * as Sentry from '@sentry/nextjs';
import Error from 'next/error';
import ErrorPage500 from './500';

// Replace "YourCustomErrorComponent" with your custom error component!
ErrorPage500.getInitialProps = async (contextData) => {
  await Sentry.captureUnderscoreErrorException(contextData);

  return Error.getInitialProps(contextData);
};
