import { Grade } from '@material-ui/icons'

const routes = courseId => [
  {
    path: `/${courseId}/grades`,
    title: 'Grade Distribution',
    icon: Grade,
    description: "See where your grade sits within the course grade distribution.",
    image: "/static/images/grade_distribution_icon.png",
  },
  {
    path: `/${courseId}/assignment`,
    title: 'Assignment Planning',
    icon: Grade,
    description: "See what assignments have the greatest impact on your grade.",
    image: "/static/images/assignments_planning_icon.png",
  },
  {
    path: `/${courseId}/files`,
    title: 'Files Accessed',
    icon: Grade,
    description: "See what files you and your peers are reading.",
    image: "/static/images/file_access_trends_icon.png",
  },
  {
    path: `/${courseId}/whatif`,
    title: 'What-If Grade',
    icon: Grade,
    description: "Use this tool to calculate your what-if grade.",
    image: "/static/images/file_access_trends_icon.png",
  }
]

export default routes
