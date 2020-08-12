import React, { lazy, Suspense } from 'react';

const LazyPreviewBanner = lazy(() => import('./PreviewBanner'));

const PreviewBanner = props => (
  <Suspense fallback={null}>
    <LazyPreviewBanner {...props} />
  </Suspense>
);

export default PreviewBanner;
