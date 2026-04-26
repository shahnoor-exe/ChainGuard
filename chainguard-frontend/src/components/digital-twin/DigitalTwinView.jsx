import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useDisruptions } from '../../hooks/useDisruptions'
import { fetchRouteGraph } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import mockGraph from '../../data/mock_graph.json'

const MAJOR_HUBS = new Set(['Mumbai','Delhi','Bangalore','Chennai','Kolkata'])

export default function DigitalTwinView() {
  const svgRef = useRef(null)
  const { data: disruptions } = useDisruptions()
  const [graph, setGraph]   = useState({ nodes: [], links: [] })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchRouteGraph()
      .then(r => setGraph(r.data.data || mockGraph))
      .catch(() => {
        console.warn('Using mock graph data for Digital Twin')
        setGraph(mockGraph)
      })
      .finally(() => setLoading(false))
  }, [])

  const disruptedCities = new Set(
    disruptions.flatMap(d => Array.isArray(d.affected_cities) ? d.affected_cities : [])
  )

  useEffect(() => {
    if (!graph.nodes.length || !svgRef.current) return

    const el = svgRef.current
    const W = el.clientWidth || 800
    const H = 500
    d3.select(el).selectAll('*').remove()

    const svg = d3.select(el)
      .attr('width', '100%')
      .attr('height', H)
      .style('background', '#0D1117')

    const g = svg.append('g')

    // Zoom
    svg.call(d3.zoom().scaleExtent([0.5, 3]).on('zoom', e => g.attr('transform', e.transform)))

    const nodes = graph.nodes.map(n => ({ ...n }))
    const links = (graph.links || graph.edges || []).map(l => ({ ...l }))

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-250))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collide', d3.forceCollide(30))

    // Links
    const link = g.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', '#30363D')
      .attr('stroke-width', d => Math.max(1, (d.weight || 1) / 200))
      .attr('stroke-opacity', 0.6)

    // Nodes
    const node = g.append('g').selectAll('g').data(nodes).join('g')
      .call(d3.drag()
        .on('start', (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag',  (event, d) => { d.fx = event.x; d.fy = event.y })
        .on('end',   (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
      )
      .on('click', (_, d) => setSelected(d))

    node.append('circle')
      .attr('r', d => MAJOR_HUBS.has(d.city || d.id) ? 14 : 10)
      .attr('fill', d => {
        if (disruptedCities.has(d.city || d.id)) return '#FF5252'
        if (MAJOR_HUBS.has(d.city || d.id)) return '#0F4C81'
        return '#21262D'
      })
      .attr('stroke', d => disruptedCities.has(d.city || d.id) ? '#FF4444' : '#E6EDF3')
      .attr('stroke-width', 1.5)

    node.append('text')
      .text(d => d.city || d.id)
      .attr('text-anchor', 'middle')
      .attr('y', 22)
      .attr('fill', '#8B949E')
      .attr('font-size', 9)
      .style('pointer-events', 'none')

    // Tooltip
    node.append('title').text(d => {
      const isDisrupted = disruptedCities.has(d.city || d.id)
      return `${d.city || d.id}\n${isDisrupted ? 'DISRUPTION ACTIVE' : 'Normal'}`
    })

    sim.on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => sim.stop()
  }, [graph, disruptedCities])

  const nodeDisruptions = selected
    ? disruptions.filter(d => (Array.isArray(d.affected_cities) ? d.affected_cities : []).includes(selected.city || selected.id))
    : []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Digital Twin — Supply Chain Graph</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Live network visualization. Drag nodes, click to inspect. Red = active disruption.</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="h-[500px] flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <svg ref={svgRef} style={{ display: 'block', width: '100%', height: 500 }} />
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-5 text-xs" style={{ color: 'var(--text-secondary)' }}>
        {[
          { color: '#0F4C81', label: 'Major Hub' },
          { color: '#FF5252', label: 'Active Disruption' },
          { color: '#21262D', label: 'Normal City' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: color, borderColor: '#E6EDF3' }} />
            {label}
          </div>
        ))}
      </div>

      {/* City info panel */}
      {selected && (
        <div className="card p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{selected.city || selected.id}</h3>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{selected.state || ''}</p>
            </div>
            <div className="flex gap-2">
              {MAJOR_HUBS.has(selected.city || selected.id) && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(96,165,250,0.15)', color: '#60A5FA' }}>Major Hub</span>
              )}
              {disruptedCities.has(selected.city || selected.id) && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger)' }}>Disrupted</span>
              )}
            </div>
          </div>
          {nodeDisruptions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Active Disruptions</p>
              {nodeDisruptions.map(d => (
                <div key={d.id} className="rounded-lg p-3" style={{ background: 'var(--bg-elevated)' }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{d.title}</p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>{d.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
