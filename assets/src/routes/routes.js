import { Grade } from '@material-ui/icons'
import { viewHelpURLs } from '../globals'

const routes = (courseId, activeViews, activeOnly = true) => {
  const allViews = [
    {
      path: `/courses/${courseId}/resources`,
      title: 'Resources Accessed',
      icon: Grade,
      description: 'See what resources you and your peers are viewing.',
      image: '/static/images/file_access_trends_icon.png',
      viewCode: 'ra',
      enabled: activeViews.ra,
      helpUrl: viewHelpURLs.ra
    },
    {
      path: `/courses/${courseId}/assignmentsv1`,
      title: 'Assignment Planning',
      icon: Grade,
      description: 'See what assignments have the greatest impact on your grade.',
      image: '/static/images/assignments_planning_icon.png',
      viewCode: 'apv1',
      enabled: activeViews.apv1,
      helpUrl: viewHelpURLs.apv1
    },
    {
      path: `/courses/${courseId}/assignments`,
      title: 'Assignment Planning',
      icon: Grade,
      description: 'See what assignments have the greatest impact on your grade.',
      image: '/static/images/assignments_planning_icon.png',
      viewCode: 'ap',
      enabled: activeViews.ap,
      helpUrl: viewHelpURLs.ap
    },
    {
      path: `/courses/${courseId}/grades`,
      title: 'Grade Distribution',
      icon: Grade,
      description: 'See where your grade sits within the course grade distribution.',
      image: '/static/images/grade_distribution_icon.png',
      viewCode: 'gd',
      enabled: activeViews.gd,
      helpUrl: viewHelpURLs.gd
    }
  ]
  return !activeOnly ? allViews : allViews.filter(view => activeViews[view.viewCode])
}

export default routes
