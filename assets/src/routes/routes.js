import { Grade } from '@material-ui/icons'
import img1 from "../static/images/grade_distribution_icon.png";

const routes = courseId => [
  {
    path: `/${courseId}/grades`,
    title: 'Grade Distribution',
    icon: Grade,
    description: "See where your grade sits within the course grade distribution.",
    image: img1,
  },
  {
    path: `/${courseId}/assignment`,
    title: 'Assignment Planning',
    icon: Grade,
    description: "See what assignments have the greatest impact on your grade.",
    image: "../static/images/assignments_planning_icon.png",
  },
  {
    path: `/${courseId}/files`,
    title: 'Files Accessed',
    icon: Grade,
    description: "See what files you and your peers are reading.",
    image: "../static/images/file_access_trends_icon.png",
  }
]

export default routes
