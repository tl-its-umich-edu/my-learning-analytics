import createProgressBar from '../../components/d3/createProgressBar'
import { assignmentData } from '../testData/assignmentProgressBarData'

describe('createProgressBar', () => {
  test('should build a Progress Bar using percentage data', () => {
    const div = document.createElement('div')
    createProgressBar({
      data: assignmentData.progress,
      gradeType: 'PERC',
      totalPoints: assignmentData.total_points,
      aspectRatio: 0.12
    })
    expect(div).toMatchSnapshot()
  })

})
