/* global describe, test, expect */
import createSankeyDiagram from '../../components/d3/createSankeyDiagram'

const sankeyDiagramData = Object.freeze(
  {
    'nodes': [
      {
        'name': 'Agricultural \'waste\''
      },
      {
        'name': 'Bio-conversion'
      },
      {
        'name': 'Liquid'
      },
      {
        'name': 'Losses'
      },
      {
        'name': 'Solid'
      },
      {
        'name': 'Gas'
      },
      {
        'name': 'Biofuel imports'
      },
      {
        'name': 'Biomass imports'
      },
      {
        'name': 'Coal imports'
      },
      {
        'name': 'Coal'
      },
      {
        'name': 'Coal reserves'
      },
      {
        'name': 'District heating'
      },
      {
        'name': 'Industry'
      },
      {
        'name': 'Heating and cooling - commercial'
      },
      {
        'name': 'Heating and cooling - homes'
      },
      {
        'name': 'Electricity grid'
      },
      {
        'name': 'Over generation / exports'
      },
      {
        'name': 'H2 conversion'
      },
      {
        'name': 'Road transport'
      },
      {
        'name': 'Agriculture'
      },
      {
        'name': 'Rail transport'
      },
      {
        'name': 'Lighting & appliances - commercial'
      },
      {
        'name': 'Lighting & appliances - homes'
      },
      {
        'name': 'Gas imports'
      },
      {
        'name': 'Ngas'
      },
      {
        'name': 'Gas reserves'
      },
      {
        'name': 'Thermal generation'
      },
      {
        'name': 'Geothermal'
      },
      {
        'name': 'H2'
      },
      {
        'name': 'Hydro'
      },
      {
        'name': 'International shipping'
      },
      {
        'name': 'Domestic aviation'
      },
      {
        'name': 'International aviation'
      },
      {
        'name': 'National navigation'
      },
      {
        'name': 'Marine algae'
      },
      {
        'name': 'Nuclear'
      },
      {
        'name': 'Oil imports'
      },
      {
        'name': 'Oil'
      },
      {
        'name': 'Oil reserves'
      },
      {
        'name': 'Other waste'
      },
      {
        'name': 'Pumped heat'
      },
      {
        'name': 'Solar PV'
      },
      {
        'name': 'Solar Thermal'
      },
      {
        'name': 'Solar'
      },
      {
        'name': 'Tidal'
      },
      {
        'name': 'UK land based bioenergy'
      },
      {
        'name': 'Wave'
      },
      {
        'name': 'Wind'
      }
    ],
    'links': [
      {
        'source': 0,
        'target': 1,
        'value': 124.729
      },
      {
        'source': 1,
        'target': 2,
        'value': 0.597
      },
      {
        'source': 1,
        'target': 3,
        'value': 26.862
      },
      {
        'source': 1,
        'target': 4,
        'value': 280.322
      },
      {
        'source': 1,
        'target': 5,
        'value': 81.144
      },
      {
        'source': 6,
        'target': 2,
        'value': 35
      },
      {
        'source': 7,
        'target': 4,
        'value': 35
      },
      {
        'source': 8,
        'target': 9,
        'value': 11.606
      },
      {
        'source': 10,
        'target': 9,
        'value': 63.965
      },
      {
        'source': 9,
        'target': 4,
        'value': 75.571
      },
      {
        'source': 11,
        'target': 12,
        'value': 10.639
      },
      {
        'source': 11,
        'target': 13,
        'value': 22.505
      },
      {
        'source': 11,
        'target': 14,
        'value': 46.184
      },
      {
        'source': 15,
        'target': 16,
        'value': 104.453
      },
      {
        'source': 15,
        'target': 14,
        'value': 113.726
      },
      {
        'source': 15,
        'target': 17,
        'value': 27.14
      },
      {
        'source': 15,
        'target': 12,
        'value': 342.165
      },
      {
        'source': 15,
        'target': 18,
        'value': 37.797
      },
      {
        'source': 15,
        'target': 19,
        'value': 4.412
      },
      {
        'source': 15,
        'target': 13,
        'value': 40.858
      },
      {
        'source': 15,
        'target': 3,
        'value': 56.691
      },
      {
        'source': 15,
        'target': 20,
        'value': 7.863
      },
      {
        'source': 15,
        'target': 21,
        'value': 90.008
      },
      {
        'source': 15,
        'target': 22,
        'value': 93.494
      },
      {
        'source': 23,
        'target': 24,
        'value': 40.719
      },
      {
        'source': 25,
        'target': 24,
        'value': 82.233
      }
    ]
  }
)

describe('createSankeyDiagram', () => {
  test('should build a sankey diagram', () => {
    const div = document.createElement('div')
    createSankeyDiagram({ data: sankeyDiagramData, width: 1000, height: 500, el: div })
    expect(div).toMatchSnapshot()
  })
})
