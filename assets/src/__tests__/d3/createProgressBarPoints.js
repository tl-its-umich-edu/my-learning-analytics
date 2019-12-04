import createProgressBar from '../../components/d3/createProgressBar'
import { assignmentData } from '../testData/assignmentProgressBarData'

describe('createProgressBar', () => {
  test('should build a Progress Bar using points data and correctly show points and not percentages', () => {
    const div = document.createElement('div')
    createProgressBar({
      data: assignmentData.progress,
      gradeType: 'PT',
      totalPoints: assignmentData.total_points,
      aspectRatio: 0.12
    })
    expect(div).toMatchSnapshot()
  })

})
