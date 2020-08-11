import React, { lazy, Suspense } from 'react';

const LazyCourseListCard = lazy(() => import('./CourseListCard'));

const CourseListCard = props => (
  <Suspense fallback={null}>
    <LazyCourseListCard {...props} />
  </Suspense>
);

export default CourseListCard;
