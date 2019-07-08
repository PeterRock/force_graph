import React from "react";
import * as d3 from "d3";
import isEqual from "lodash/isEqual";

const RATIO = 1; // window.devicePixelRatio || 1;
const DOT_RADIUS = 20; // 圆点大小
const FONT_SIZE_DOT = 8;
const FONT_SIZE_LINK = 6;
const LINE_COLOR = "#ccc";

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
      .force(
        "link",
        d3
          .forceLink()
          .distance(70)
          .id(d => d.id)
      )
      .force("collide", d3.forceCollide(DOT_RADIUS + 2).iterations(2)) // 力学碰撞检测
      .force(
        "charge",
        d3
          .forceManyBody()
          .strength(-300)
          .distanceMin(60)
          .distanceMax(1000)
      )
      .force("center", d3.forceCenter(cvsWidth / 2, cvsHeight / 2))
      .force("x", d3.forceX(cvsWidth / 2))
      .force("y", d3.forceY(cvsHeight / 2));

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

      data.links.forEach(drawL);

      data.nodes.forEach(drawN);

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
    context.save();
    context.beginPath();
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
    context.strokeStyle = LINE_COLOR;
    context.stroke();
    context.restore();
  };

  drawNode = (context, d) => {
    context.save();
    context.beginPath();
    context.fillStyle = d.background;
    context.moveTo(d.x + DOT_RADIUS, d.y);
    context.arc(d.x, d.y, DOT_RADIUS, 0, 2 * Math.PI);
    context.fill();
    context.strokeStyle = d.borderColor;
    context.stroke();

    context.font=`${FONT_SIZE_DOT}px`
    context.textBaseline = "middle"; //设置文本的垂直对齐方式
    context.textAlign = "center"; //设置文本的水平对齐方式
    context.fillStyle = d.color;
    context.fillText(
      d.label && d.label.length > 3 ? d.label.substr(0, 3) + "..." : d.label,
      d.x,
      d.y
    );

    context.restore();
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
