import React from "react";
import * as d3 from "d3";
import isEqual from "lodash/isEqual";

const RATIO = window.devicePixelRatio || 1;

class MedBrainChartD3 extends React.Component {
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
      .force("link", d3.forceLink().id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(cvsWidth / 2, cvsHeight / 2));


    // const transform = d3.zoomIdentity;

    const drawN = ele => {
      this.drawNode(context, ele);
    };
    const drawL = ele => {
      this.drawLink(context, ele);
    };

    const onTicked = () => {
      context.clearRect(0, 0, cvsWidth, cvsHeight);

      context.beginPath();
      data.links.forEach(drawL);
      context.strokeStyle = "#aaa";
      context.stroke();

      context.beginPath();
      data.nodes.forEach(drawN);
      context.fill();
      context.strokeStyle = "#fff";
      context.stroke();

      console.log("draw end");
    };

    this.simulation.nodes(data.nodes).on("tick", onTicked);
    this.simulation.force("link").links(data.links);
    d3.select(this.chartCanvas).call(
      d3
        .drag()
        .container(this.chartCanvas)
        .subject(this.getDragSubject)
        .on("start", this.onDragStart)
        .on("drag", this.onDragged)
        .on("end", this.onDragEnd)
    );
  };
  drawLink = (context, d) => {
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
  };

  drawNode = (context, d) => {
    context.moveTo(d.x + 6, d.y);
    context.arc(d.x, d.y, 6, 0, 2 * Math.PI);
  };

  getDragSubject = () => {
    console.log(d3.event.x, d3.event.y)
    return this.simulation.find(d3.event.x * RATIO, d3.event.y * RATIO);
  };
  onDragStart = () => {
    console.log('ssss', d3.event.x, d3.event.y)
    if (!d3.event.active) {
      this.simulation.alphaTarget(0.3).restart();
    }
    d3.event.subject.fx = d3.event.subject.x; // * RATIO;
    d3.event.subject.fy = d3.event.subject.y; // * RATIO;
  };
  onDragged = () => {
    console.log(d3.event.x, d3.event.y)
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
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
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  }
}

export default MedBrainChartD3;
