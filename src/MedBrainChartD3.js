import React from "react";
import * as d3 from "d3";
import isEqual from "lodash/isEqual";

const DOT_RADIUS = 15; // 圆点大小
const FONT_SIZE_DOT = 8;
const FONT_SIZE_LINK = 6;
const LINE_COLOR = "#ccc";

const Arrow = ({ width, height, color, refDotRadius }) => {
  const arrow_path = `M0,0 L0,${width} L${height},${width / 2} L0,0`; // 宽6高8
  const max = Math.max(width, height); // 取最大边做为ViewBox区域,保证完整显示
  return (
    <marker
      id="arrow"
      markerUnits="strokeWidth"
      markerWidth={max}
      markerHeight={max}
      viewBox={`0 0 ${max} ${max}`}
      refX={height + refDotRadius - 1}
      refY={width / 2}
      orient="auto"
    >
      <path d={arrow_path} fill={color} />
    </marker>
  );
};

class MedBrainChartD3 extends React.Component {
  constructor(props) {
    super(props);

    this.transform = d3.zoomIdentity;
  }
  componentDidMount() {
    this.svg = d3.select(this.svgEl);
    this.chartLayer = d3.select(this.chartLayerEl);
    this.setSize();
    this.drawData();
  }
  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps.data, this.props.data)) {
      requestAnimationFrame(this.drawData);
    }
  }

  drawData = () => {
    const { data, width, height } = this.props;
    if (!data) return;

    // requestAnimationFrame(this.drawData)
    this.simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .distance(70)
          .id(d => d.id)
      )
      .force("collide", d3.forceCollide(DOT_RADIUS + 1).iterations(2)) // 力学碰撞检测
      .force(
        "charge",
        d3
          .forceManyBody()
          .strength(-200)
          .distanceMin(60)
          .distanceMax(500)
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2))
      .force("y", d3.forceY(height / 2));

    const links = this.chartLayer
      .select("#links")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("g");
    const linkLine = links
      .append("path")
      .attr("id", d => `link_path_${d.id}`)
      .attr("stroke", LINE_COLOR)
      .attr("marker-end", "url(#arrow)");
    const linkText = links
      .append("text")
      .attr("font-size", FONT_SIZE_LINK)
      .attr("dominant-baseline", "middle")
      .attr("fill", LINE_COLOR);
    linkText.append("textPath");

    const nodes = this.chartLayer
      .select("#nodes")
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("g")
      .call(
        d3
          .drag()
          .on("start", this.onDragStart)
          .on("drag", this.onDragged)
          .on("end", this.onDragEnd)
      );
    const nodeCircle = nodes
      .append("circle")
      .attr("r", DOT_RADIUS)
      .attr("fill", d => d.background)
      .attr("stroke", d => d.borderColor);
    const nodeText = nodes
      .append("text")
      .attr("font-size", FONT_SIZE_DOT)
      .style("dominant-baseline", "middle")
      .style("text-anchor", "middle")
      .attr("fill", d => d.color)
      .text(d =>
        d.label && d.label.length > 3 ? d.label.substr(0, 3) + "..." : d.label
      );

    const onTicked = function() {
      linkLine.attr("d", d => {
        if (d.source.x < d.target.x) {
          return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
        } else {
          return `M${d.target.x},${d.target.y} L${d.source.x},${d.source.y}`;
        }
      });
      linkText
        .select("textPath")
        .attr("xlink:href", d => `#link_path_${d.id}`)
        .style("text-anchor", "middle")
        .attr("startOffset", "50%")
        .text(d => d.label);

      nodeCircle.attr("cx", d => d.x).attr("cy", d => d.y);
      nodeText.attr("x", d => d.x).attr("y", d => d.y);
    };
    const onZoomed = () => {
      this.chartLayer.attr("transform", d3.event.transform);
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

    // 焦点高亮显示功能
    // 存储点线关联关系
    const adjList = [];
    data.links.forEach(function(d) {
      adjList[d.source.id + "-" + d.target.id] = true;
      adjList[d.target.id + "-" + d.source.id] = true;
    });
    function neigh(a, b) {
      return a === b || adjList[a + "-" + b];
    }

    function focus(d) {
      const { id } = d;
      nodes.style("opacity", o => {
        return neigh(id, o.id) ? 1 : 0.1;
      });
      links.style("opacity", o => {
        return o.source.id === id || o.target.id === id ? 1 : 0.1;
      });
    }
    function unFocus() {
      nodes.style("opacity", 1);
      links.style("opacity", 1);
    }
    nodes.on("mouseover", focus).on("mouseout", unFocus);
  };
  setSize = () => {
    const { width, height } = this.props;
    this.svg.attr("width", width).attr("height", height);

    this.chartLayer.attr("width", width).attr("height", height);
  };

  onDragStart = () => {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0.3).restart(); // 衰减系数
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
      <svg
        ref={ref => {
          this.svgEl = ref;
        }}
        width={width}
        height={height}
      >
        <defs>
          <Arrow
            width={6}
            height={8}
            color={LINE_COLOR}
            refDotRadius={DOT_RADIUS}
          />
        </defs>
        <g
          ref={ref => {
            this.chartLayerEl = ref;
          }}
          id="chartLayer"
        >
          <g id="links" />
          <g id="nodes" />
        </g>
      </svg>
    );
  }
}

export default MedBrainChartD3;
