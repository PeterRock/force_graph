import React from "react";
import smallDemoData from "./smallDemo.json";
import demoData from "./demo.json";
// import MedBrainChart from "./MedBrainChart";
import MedBrainChartD3 from "./MedBrainChartD3";
import D3Force from "./D3Force";
import "./App.css";

const TypeLabel = {
  HasDefined: "助诊因子",
  HasSymptom: "症状体征",
  HasFactor: "检查指标",
  HasDiseaseHistory: "既往史",
  HasFamilyHistory: "家族遗传",
  HasHistoryProduct: "曾用产品"
};
const VertexColors = {
  // 疾病
  Disease: {
    background: "#f16667",
    backgroundHex: 0xf16667,
    color: "#fff",
    colorHex: 0xfff333,
    borderColor: "#ec2f31",
    borderColorHex: 0xec2f31
  },
  // 症状
  Symptom: {
    background: "#ffc454",
    backgroundHex: 0xffc454,
    color: "#333",
    colorHex: 0x333333,
    borderColor: "#d8a014",
    borderColorHex: 0xd8a014
  },
  // 既往史
  HistoryDisease: {
    background: "#d9c8ae",
    backgroundHex: 0xd9c8ae,
    color: "#333",
    colorHex: 0x333333,
    borderColor: "#c0a378",
    borderColorHex: 0xc0a378
  },
  // 家族遗传
  FamilyHistory: {
    background: "#8dcc93",
    backgroundHex: 0x8dcc93,
    color: "#333",
    colorHex: 0x333333,
    borderColor: "#5eb665",
    borderColorHex: 0x5eb665
  },
  // 曾用产品
  HistoryProduct: {
    background: "#4c8eda",
    backgroundHex: 0x4c8eda,
    color: "#fff",
    colorHex: 0xfff333,
    borderColor: "#2870c2",
    borderColorHex: 0x2870c2
  },
  // 检查指标
  InspectionElementFactor: {
    background: "#ecb5c9",
    backgroundHex: 0xecb5c9,
    color: "#333",
    colorHex: 0x333333,
    borderColor: "#da7298",
    borderColorHex: 0xda7298
  }
};

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
        const { type, ...rest } = e;
        return { ...rest, group: type, ...VertexColors[type] };
      }),
      links: data.edges.map(e => {
        const { from, to, ...rest } = e;
        return {
          ...rest,
          source: e.from,
          target: e.to,
          label: TypeLabel[rest.type]
        };
      })
    };
    return converted;
  };

  render() {
    const { data } = this.state;
    const width = window.innerWidth
    const height = window.innerHeight
    return (
        <D3Force data={data} width={width} height={height} />
      // <div className="App">
      //   {/* <header className="App-header">
      //     <section>
      //       <MedBrainChart data={data} width={800} height={600} />
      //     </section>
      //   </header> */}
      //   <header className="App-header">
      //     <section>
      //     </section>
      //   </header>
      // </div>
    );
  }
}
export default App;
