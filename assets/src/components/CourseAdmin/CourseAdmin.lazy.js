import React, { lazy, Suspense } from 'react';

const LazyCourseAdmin = lazy(() => import('./CourseAdmin'));

const CourseAdmin = props => (
  <Suspense fallback={null}>
    <LazyCourseAdmin {...props} />
  </Suspense>
);

export default CourseAdmin;
