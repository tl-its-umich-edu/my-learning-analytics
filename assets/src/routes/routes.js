import { Grade } from '@material-ui/icons'

const routes = (courseId, activeViews) => {
  const allViews = [
    {
      path: `/courses/${courseId}/files`,
      title: 'Files Accessed',
      icon: Grade,
      description: 'See what files you and your peers are reading.',
      image: '/static/images/file_access_trends_icon.png',
      viewCode: 'fa'
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
      path: `/courses/${courseId}/grades`,
      title: 'Grade Distribution',
      icon: Grade,
      description: 'See where your grade sits within the course grade distribution.',
      image: '/static/images/grade_distribution_icon.png',
      viewCode: 'gd'
    }
  ]
  return allViews.filter(view => activeViews[view.viewCode])
}

export default routes
