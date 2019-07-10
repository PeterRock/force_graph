import React, { Component } from 'react'
import isEqual from 'lodash/isEqual'
import debounce from 'lodash/debounce'
import * as d3 from 'd3'
import * as PIXI from 'pixi.js'

const RATIO = window.devicePixelRatio || 1
const DOT_RADIUS = 24 // 圆点大小
const FONT_SIZE_DOT = 8
const FONT_SIZE_LINK = 6
const LINE_COLOR = 0xcccccc

export default class D3Force extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentDidMount() {
    this.drawData()
  }
  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps.data, this.props.data)) {
      this.drawData()
    }
  }

  drawData() {
    const { data, width, height } = this.props
    if (!data) {
      return
    }
    this.transform = d3.zoomIdentity

    const app = new PIXI.Application({
      width,
      height,
      antialias: true, // 抗锯齿
      backgroundColor: 0xffffff,
      resolution: RATIO,
      autoResize: true,
    })
    this.app = app

    this.dragPointX = 0
    this.dragPointY = 0
    const stage = app.stage
    let transform = this.transform
    const links = new PIXI.Graphics()
    const nodesPosX = []
    const nodesPosY = [] //save the absolute coordinate of nodes

    this.canvas.appendChild(app.view)
    stage.addChild(links)

    const simulation = d3
      .forceSimulation()
      .force(
        'link',
        d3
          .forceLink()
          .distance(60)
          .id(d => d.id)
      )
      .force('collide', d3.forceCollide(DOT_RADIUS + 2).iterations(1)) // 力学碰撞检测
      .force(
        'charge',
        d3
          .forceManyBody()
          .strength(-400)
          .distanceMin(100)
          .distanceMax(1000)
      )
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2))
      .force('y', d3.forceY(height / 2))

    const getDragSubject = () => {
      const { position, scale } = stage
      const { event } = d3
      const x = transform.invertX(event.x)
      const y = transform.invertY(event.y)
      let dx
      let dy
      for (let i = data.nodes.length - 1; i >= 0; i--) {
        let nx = nodesPosX[i],
          ny = nodesPosY[i]
        dx = x - nx
        dy = y - ny
        if (dx * dx + dy * dy < DOT_RADIUS * DOT_RADIUS) {
          this.dragPointX = nx
          this.dragPointY = ny
          return simulation.find(
            (event.x - position.x) / scale.x,
            (event.y - position.y) / scale.y
          )
        }
      }
    }

    const dragStarted = () => {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart()
      let { subject } = d3.event
      subject.fx = subject.x
      subject.fy = subject.y
    }

    const dragged = () => {
      let { subject } = d3.event,
        { k } = transform
      subject.fx = (d3.event.x + this.dragPointX * (k - 1)) / k
      subject.fy = (d3.event.y + this.dragPointY * (k - 1)) / k
    }

    const dragEnded = () => {
      if (d3.event.subject.isLocked) {
        return
      }
      if (!d3.event.active) simulation.alphaTarget(0)
      let { subject } = d3.event
      subject.fx = null
      subject.fy = null
    }

    const bt = debounce(ticked, 120)
    const zoomed = () => {
      transform = d3.event.transform
      bt()
    }

    const drawNode = node => {
      let { gfx } = node
      gfx.lineStyle(1, node.borderColorHex)
        .beginFill(node.backgroundHex)
        .drawCircle(0, 0, DOT_RADIUS)
        .endFill()

      stage.addChild(gfx)
    }

    const nodeLabels = new PIXI.Container()
    data.nodes.forEach(node => {
      node.gfx = new PIXI.Graphics()
      let { gfx } = node
      gfx.interactive = true
      gfx.buttonMode = false
      drawNode(node, 0xffffff)

      // 点上的标签内容
      const label =
        node.label.length > 3
          ? node.label.substring(0, 3) + '...'
          : node.label
      const labelTexture = new PIXI.Text(label, {
        fontSize: FONT_SIZE_DOT,
        fill: node.color,
        align: 'center',
        wordWrap: true,
      })
      labelTexture.resolution = RATIO
      node.labelTexture = labelTexture
      nodeLabels.addChild(labelTexture)
      // gfx.on('mouseover', () => {
      // 鼠标划入
      // }).on('mouseout', () => {
      // 鼠标划过
      // })
    })
    stage.addChild(nodeLabels)

    simulation.nodes(data.nodes).on('tick', ticked)
    simulation.force('link').links(data.links)

    d3.select(this.canvas)
      .call(
        d3
          .drag()
          .container(this.canvas)
          .subject(getDragSubject)
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      )
      .call(
        d3
          .zoom()
          .scaleExtent([1 / 5, 5])
          .on('zoom', zoomed)
      )

    function ticked() {
      const { position, scale } = stage
      position.x = transform.x
      position.y = transform.y
      scale.x = transform.k
      scale.y = transform.k

      data.nodes.forEach((node, i) => {
        let { x, y, gfx } = node
        gfx.position = new PIXI.Point(x, y)
        nodesPosX[i] = x
        nodesPosY[i] = y
        if (node.labelTexture) {
          const rate = RATIO * transform.k
          node.labelTexture.x = x - node.labelTexture.canvas.width /2 / rate
          node.labelTexture.y = y - node.labelTexture.canvas.height / 2/ rate
          node.labelTexture.resolution = rate
        }
      })

      links.clear()
      data.links.forEach((link, k) => {
        let { source, target } = link
        links.lineStyle(1, LINE_COLOR, .5)
        links.moveTo(source.x, source.y)
        links.lineTo(target.x, target.y)
      })
      links.endFill()

      app.render(stage)
    }
  }

  render() {
    const { width, height } = this.props
    return (
      <div style={{ touchAction: 'none', width, height, WebkitTextSizeAdjust: 'none' }}>
        <div
          ref={canvas => {
            this.canvas = canvas
          }}
        />
      </div>
    )
  }
}
