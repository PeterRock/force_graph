import React from "react";
import * as d3 from "d3";
import isEqual from "lodash/isEqual";

const RATIO = 1; // window.devicePixelRatio || 1;
const DOT_RADIUS = 5; // 圆点大小

class MedBrainChartD3 extends React.Component {
  constructor(props) {
    super(props);

    this.transform = d3.zoomIdentity;
  }
  componentDidMount() {
    this.drawData();
  }
  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps.data, this.props.data)) {
      this.drawData();
    }
  }

  drawData = () => {
    const context = this.chartCanvas.getContext("2d");
    const { data } = this.props;
    const cvsWidth = this.chartCanvas.width;
    const cvsHeight = this.chartCanvas.height;
    console.log(cvsWidth, cvsHeight);

    if (!data) return;

    this.simulation = d3
      .forceSimulation()
      .force("center", d3.forceCenter(cvsWidth / 2, cvsHeight / 2))
      .force("x", d3.forceX(cvsWidth / 2).strength(0.1))
      .force("y", d3.forceY(cvsHeight / 2).strength(0.1))
      .force("charge", d3.forceManyBody().strength(-50))
      .force(
        "link",
        d3
          .forceLink()
          .strength(1)
          .id(d => d.id)
      );

    const drawN = ele => {
      this.drawNode(context, ele);
    };
    const drawL = ele => {
      this.drawLink(context, ele);
    };
    const onTicked = () => {
      context.save();
      context.clearRect(0, 0, cvsWidth, cvsHeight);
      context.translate(this.transform.x, this.transform.y);
      context.scale(this.transform.k, this.transform.k);

      context.beginPath();
      data.links.forEach(drawL);
      context.strokeStyle = "#aaa";
      context.stroke();

      context.beginPath();
      data.nodes.forEach(drawN);
      context.fill();
      context.strokeStyle = "#fff";
      context.stroke();

      context.restore();
      console.log("draw end");
    };
    const onZoomed = () => {
      console.log("zooming");
      this.transform = d3.event.transform;
      console.log(this.transform);
      onTicked();
    };

    this.simulation.nodes(data.nodes).on("tick", onTicked);
    this.simulation.force("link").links(data.links);
    const drugSubject = () => this.getDragSubject(data);
    d3.select(this.chartCanvas)
      .call(
        d3
          .drag()
          .container(this.chartCanvas)
          .subject(drugSubject)
          .on("start", this.onDragStart)
          .on("drag", this.onDragged)
          .on("end", this.onDragEnd)
      )
      .call(
        d3
          .zoom()
          .scaleExtent([1 / 5, 5])
          .on("zoom", onZoomed)
      )
      .on("dblclick.zoom", null); // 取消双击放大
  };
  drawLink = (context, d) => {
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
  };

  drawNode = (context, d) => {
    context.moveTo(d.x + DOT_RADIUS, d.y);
    context.arc(d.x, d.y, DOT_RADIUS, 0, 2 * Math.PI);
  };

  getDragSubject = data => {
    // 查找用户实际点击到的点
    let x = this.transform.invertX(d3.event.x);
    let y = this.transform.invertY(d3.event.y);
    let dx;
    let dy;
    for (let i = data.nodes.length - 1; i >= 0; --i) {
      let node = data.nodes[i];
      dx = x - node.x;
      dy = y - node.y;

      if (dx * dx + dy * dy < DOT_RADIUS * DOT_RADIUS) {
        node.x = this.transform.applyX(node.x);
        node.y = this.transform.applyY(node.y);

        return node;
      }
    }
  };
  onDragStart = () => {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0.3).restart();
    }
    d3.event.subject.fx = this.transform.invertX(d3.event.x);
    d3.event.subject.fy = this.transform.invertY(d3.event.y);
  };
  onDragged = () => {
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
      <div style={{ width, height }}>
        <canvas
          width={width * RATIO}
          height={height * RATIO}
          ref={ref => {
            this.chartCanvas = ref;
          }}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  }
}

export default MedBrainChartD3;
