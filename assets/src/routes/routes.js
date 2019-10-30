import { Grade } from '@material-ui/icons'

const routes = (courseId, activeViews) => {
  const allViews = [
    {
      path: `/courses/${courseId}/resources`,
      title: 'Resources Accessed',
      icon: Grade,
      description: 'See what resources you and your peers are viewing.',
      image: '/static/images/file_access_trends_icon.png',
      viewCode: 'ra'
    },
    {
      path: `/courses/${courseId}/assignments`,
      title: 'Assignment Planning',
      icon: Grade,
      description: 'See what assignments have the greatest impact on your grade.',
      image: '/static/images/assignments_planning_icon.png',
      viewCode: 'ap'
    },
    {
      path: `/courses/${courseId}/assignmentsv2`,
      title: 'Assignment Planning V2',
      icon: Grade,
      description: 'See what assignments have the greatest impact on your grade.',
      image: '/static/images/assignments_planning_icon.png',
      viewCode: 'ap'
    },
    {
      path: `/courses/${courseId}/resources`,
      title: 'Resources Accessed',
      icon: Grade,
      description: 'See where your grade sits within the course grade distribution.',
      image: '/static/images/grade_distribution_icon.png',
      viewCode: 'gd'
    }
  ]
  return allViews.filter(view => activeViews[view.viewCode])
}

export default routes
