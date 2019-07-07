import React from "react";
import * as d3 from "d3";
import isEqual from "lodash/isEqual";

const DOT_RADIUS = 12; // 圆点大小
const LINE_COLOR = "#ccc";

const TypeLabel = {
  HasDefined: '助诊因子',
  HasSymptom: '症状体征',
  HasFactor: '检查指标',
  HasDiseaseHistory: '既往史',
  HasFamilyHistory: '家族遗传',
  HasHistoryProduct: '曾用产品',
}
const VertexColors = {
  // 疾病
  Disease: {
      background: '#f16667',
      color: '#fff',
      borderColor: '#ec2f31',
  },
  // 症状
  Symptom: {
      background: '#ffc454',
      color: '#333',
      borderColor: '#d8a014',
  },
  // 既往史
  HistoryDisease: {
      background: '#d9c8ae',
      color: '#333',
      borderColor: '#c0a378',
  },
  // 家族遗传
  FamilyHistory: {
      background: '#8dcc93',
      color: '#333',
      borderColor: '#5eb665',
  },
  // 曾用产品
  HistoryProduct: {
      background: '#4c8eda',
      color: '#fff',
      borderColor: '#2870c2',
  },
  // 检查指标
  InspectionElementFactor: {
      background: '#ecb5c9',
      color: '#333',
      borderColor: '#da7298',
  },
}

function makerArrowForSvg(svg, width, height, color, refDotRadius) {
  // 定义箭头
  const arrow_path = `M0,0 L0,${width} L${height},${width / 2} L0,0`; // 宽6高8
  const max = Math.max(width, height); // 取最大边做为ViewBox区域,保证完整显示
  svg
    .append("defs")
    .append("marker")
    .attr("id", "arrow")
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", max)
    .attr("markerHeight", max)
    .attr("viewBox", `0 0 ${max} ${max}`)
    .attr("refX", height + refDotRadius - 1)
    .attr("refY", width / 2)
    .attr("orient", "auto")
    .append("path")
    .attr("d", arrow_path)
    .attr("fill", color);
}

class MedBrainChartD3 extends React.Component {
  constructor(props) {
    super(props);

    this.transform = d3.zoomIdentity;
  }
  componentDidMount() {
    this.svg = d3.select(this.dom).append("svg");
    this.chartLayer = this.svg.append("g").classed("charLayer", true);
    this.setSize();
    this.drawData();
  }
  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps.data, this.props.data)) {
      this.drawData();
    }
  }

  drawData = () => {
    const { data, width, height } = this.props;
    if (!data) return;
    console.log(data.nodes.length, data.links.length)

    this.simulation = d3
      .forceSimulation()
      .force("link", d3.forceLink().distance(100).id(d => d.id))
      .force("collide", d3.forceCollide(DOT_RADIUS + 2).iterations(2)) // 力学碰撞检测
      .force("charge", d3.forceManyBody().distanceMin(DOT_RADIUS * 3))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(0))
      .force("y", d3.forceY(0));

    // 定义箭头
    makerArrowForSvg(this.svg, 6, 8, LINE_COLOR, DOT_RADIUS);

    const link = this.svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke", LINE_COLOR)
      .attr("marker-end", "url(#arrow)");

    const node = this.svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", DOT_RADIUS)
      .attr("fill", d => VertexColors[d.group].background)
      .attr("stroke", d => VertexColors[d.group].borderColor)
      .exit()
      .enter()
      .append("text", d => TypeLabel[d.label])
      .attr("dx", d => { console.log(d); return DOT_RADIUS })
      .attr("dy", ".35em")
      .text("")
      .call(
        d3
          .drag()
          .on("start", this.onDragStart)
          .on("drag", this.onDragged)
          .on("end", this.onDragEnd)
      );

    const onTicked = function() {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("cx", d => d.x).attr("cy", d => d.y);
    };
    const onZoomed = () => {
      this.svg.selectAll("g").attr("transform", d3.event.transform);
      onTicked();
    };

    // 处理放大事件
    this.svg
      .call(
        d3
          .zoom()
          .scaleExtent([1 / 5, 5])
          .on("zoom", onZoomed)
      )
      .on("dblclick.zoom", null); // 取消双击放大

    // 绑定力学仿真
    this.simulation.nodes(data.nodes).on("tick", onTicked);
    this.simulation.force("link").links(data.links);
  };
  setSize = () => {
    const { width, height } = this.props;
    this.svg.attr("width", width).attr("height", height);

    this.chartLayer.attr("width", width).attr("height", height);
  };

  onDragStart = () => {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0.3).restart();
    }
    d3.event.subject.fx = this.transform.invertX(d3.event.x);
    d3.event.subject.fy = this.transform.invertY(d3.event.y);
  };
  onDragged = d => {
    d3.event.subject.fx = this.transform.invertX(d3.event.x);
    d3.event.subject.fy = this.transform.invertY(d3.event.y);
  };
  onDragEnd = () => {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0);
      d3.event.subject.fx = null;
      d3.event.subject.fy = null;
    }
  };

  render() {
    const { width, height } = this.props;
    return (
      <div
        style={{ width, height }}
        ref={ref => {
          this.dom = ref;
        }}
      />
    );
  }
}

export default MedBrainChartD3;
