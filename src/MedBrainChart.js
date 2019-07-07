/**
 * MebBrain图像
 */
import React, { Component } from 'react'
import isEqual from 'lodash/isEqual'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/graph'
import 'echarts/lib/component/toolbox'

// eslint-disable-next-line max-len
const locIco = "image://data:image/svg+xml,%3Csvg class='icon' viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cpath d='M377.25 512A135.215 135.215 0 1 0 512 377.25 135.215 135.215 0 0 0 377.25 512z' fill='%2308AEAB'/%3E%3Cpath d='M923.927 478.255h-65.163A349.09 349.09 0 0 0 546.21 166.167v-65.629a7.447 7.447 0 0 0-7.447-7.447H486.4a7.447 7.447 0 0 0-7.447 7.447v65.63a349.09 349.09 0 0 0-312.786 312.087h-65.163a7.447 7.447 0 0 0-7.448 7.447v52.363a7.447 7.447 0 0 0 7.448 7.448h65.163a349.09 349.09 0 0 0 312.553 313.25v64.699a7.447 7.447 0 0 0 7.447 7.447h52.364a7.447 7.447 0 0 0 7.447-7.447v-64.698a349.09 349.09 0 0 0 312.786-313.019h65.163a7.447 7.447 0 0 0 7.448-7.447v-52.596a7.447 7.447 0 0 0-7.448-7.447zM768 620.218a276.48 276.48 0 0 1-221.324 167.098v-62.138a7.447 7.447 0 0 0-7.447-7.447H486.4a7.447 7.447 0 0 0-7.447 7.447v62.138a276.48 276.48 0 0 1-241.338-241.57h61.672a7.447 7.447 0 0 0 7.448-7.448v-52.596a7.447 7.447 0 0 0-7.448-7.447h-61.44a276.48 276.48 0 0 1 240.873-240.64v61.207a7.447 7.447 0 0 0 7.447 7.447h52.364a7.447 7.447 0 0 0 7.447-7.447v-61.207a276.48 276.48 0 0 1 241.106 240.64h-61.44a7.447 7.447 0 0 0-7.448 7.447v52.363a7.447 7.447 0 0 0 7.448 7.448h61.672A273.92 273.92 0 0 1 768 620.218z' fill='%2308AEAB'/%3E%3C/svg%3E"

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

const typeLabel = {
    HasDefined: '助诊因子',
    HasSymptom: '症状体征',
    HasFactor: '检查指标',
    HasDiseaseHistory: '既往史',
    HasFamilyHistory: '家族遗传',
    HasHistoryProduct: '曾用产品',
}

// "vertexes": [
//     {
//         "id": "string",
//         "label": "string",
//         "type": "string",
//         "properties": {
//         "additionalProp1": {},
//         }
//     }
//     ],
//     "edges": [
//     {
//         "id": "string",
//         "from": "string",
//         "to": "string",
//         "label": "string",
//         "type": "string",
//         "properties": {
//         "additionalProp1": {},
//         }
//     }
// ]

function getBarOptions(sourceData, width, height) {
    let data = sourceData || {}
    if (!Array.isArray(data.vertexes)) {
        data = { vertexes: [], edges: [] }
    }

    const categories = []
    const nodes = data.vertexes.map((vertex) => {
        const colors = VertexColors[vertex.type] // 如果不存在实际为数据异常
        const node = {
            text: vertex.label,
            name: vertex.id,
            x: null, // Use random x, y
            y: null,
            // draggable: true, // 可以按需单独控制是否允许拖拽
            symbolSize: 34,
            category: vertex.type,
            itemStyle: {
                normal: {
                    color: colors.background,
                    borderColor: colors.borderColor,
                },
            },
            // value: vertex.properties.value,
            label: {
                normal: {
                    show: true,
                    position: 'inside',
                    color: colors.color,
                    fontSize: 9,
                    formatter: params =>
                        (params.data.text.length > 3 ? `${params.data.text.substr(0, 3)}...` : params.data.text),
                },
            },
        }
        if (categories.indexOf(vertex.type) === -1) {
            categories.push(vertex.type)
        }
        return node
    })
    const links = data.edges.map((edge) => {
        const link = {
            source: edge.from,
            target: edge.to,
            lineStyle: {
                normal: {
                    color: '#cccccc',
                },
            },
            label: {
                normal: {
                    show: true,
                    color: '#999999',
                    position: 'middle',
                    fontSize: 7,
                    formatter: typeLabel[edge.label],
                    align: 'center',
                    verticalAlign: 'top',
                },
            },
        }
        return link
    })

    const option = {
        title: { show: false },
        tooltip: { show: false },
        legend: { show: false },
        toolbox: {
            showTitle: false,
            right: 0,
            top: 0,
            itemSize: 22,
            feature: {
                restore: {
                    icon: locIco,
                },
            },
        },
        animation: false,
        series: [
            {
                name: 'MedBrain',
                type: 'graph',
                layout: 'force',
                data: nodes,
                links,
                categories: categories.map(e => ({ name: e })),
                roam: true,
                zoom: 1,
                center: [width / 2, height / 2],
                draggable: true,
                nodeScaleRatio: 0.05,
                // focusNodeAdjacency: true,
                force: {
                    repulsion: 64,
                    edgeLength: 70, // [60, 80],
                    gravity: 0.01, // 0.05,
                },
                edgeSymbol: ['none', 'arrow'],
                edgeSymbolSize: 5,
            },
        ],
    }

    return option
}

const stop = (e) => {
    e.preventDefault() // 阻止默认的处理方式(阻止下拉滑动的效果)
    e.stopPropagation() // 组织拖动冒泡
}

export default class MedBrainChart extends Component {
    componentDidMount() {
        this.chart = echarts.init(this.chartDom)
        const options = getBarOptions(this.props.data, this.props.width, this.props.height)
        this.chart.setOption(options)
        this.chartDom.addEventListener('touchmove', stop, { passive: false })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.width !== this.props.width || prevProps.height || this.props.height) {
            this.chartResize()
        }
        if (!isEqual(prevProps.data, this.props.data)) {
            const options = getBarOptions(this.props.data, this.props.width, this.props.height)
            this.chart.setOption(options)
        }
    }

    chartResize = () => {
        this.chart && this.chart.resize()
    }

    render() {
        const { className, width, height } = this.props
        console.log(width, 'x', height)
        return (
            <div
                className={className}
                ref={(ref) => {
                    this.chartDom = ref
                }}
                style={{ width, height }}
            />
        )
    }
}
