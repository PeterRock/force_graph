import React from "react";
import smallDemoData from "./smallDemo.json";
import demoData from "./demo.json";
// import MedBrainChart from "./MedBrainChart";
import MedBrainChartD3 from "./MedBrainChartD3";
import "./App.css";

class App extends React.Component {
  state = { data: null };
  componentDidMount() {
    setTimeout(() => {
      const converted = this.convert2D3(demoData);
      this.setState({ data: converted });
    }, 1);
  }
  convert2D3 = data => {
    if (!data.vertexes) return null;
    const converted = {
      nodes: data.vertexes.map(e => {
        const { type, ...rest } = e
        return { ...rest, group: type}
      }),
      links: data.edges.map(e => {
        const { from, to, ...rest } = e;
        return { ...rest, source: e.from, target: e.to };
      })
    };
    return converted;
  };

  render() {
    const { data } = this.state;
    return (
      <div className="App">
        {/* <header className="App-header">
          <section>
            <MedBrainChart data={data} width={800} height={600} />
          </section>
        </header> */}
        <header className="App-header">
          <section>
            <MedBrainChartD3 data={data} width={800} height={600} />
          </section>
        </header>
      </div>
    );
  }
}
export default App;
