/* global describe, test, expect */
import createHistogram from '../../../components/d3/createHistogram'
import { histogramDataWithBinning } from '../../testData/d3TestData'

describe('createHistogram', () => {
  test('should build a histogram bar chart binning last five grades with MyGrade line', () => {
    const div = document.createElement('div')
    const gradeSummary = { current_user_grade: 76.8, graph_upper_limit: 100, tot_students: 84, grade_avg: 90.49, median_grade: 93.39, show_number_on_bars: true, show_dash_line: true }
    createHistogram({
      data: histogramDataWithBinning,
      width: 1000,
      height: 500,
      domElement: div,
      myGrade: 76.8,
      gradesSummary: gradeSummary
    })
    expect(div).toMatchSnapshot()
  })
})
