import { Grade } from '@material-ui/icons'

const routes = courseId => [
  {
    path: `/${courseId}/grades`,
    sidebarName: 'Grade Distribution',
    icon: Grade
  },
  {
    path: `/${courseId}/assignment`,
    sidebarName: 'Assignment Planning',
    icon: Grade
  },
  {
    path: `/${courseId}/files`,
    sidebarName: 'Files Accessed',
    icon: Grade
  }
]

export default routes
