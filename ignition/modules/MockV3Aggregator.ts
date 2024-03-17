import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

const DECIMAL = 8
const INITIAL_VALUE = 2_000_000_000_00

const MockV3AggregatorModule = buildModule("MockV3AggregatorModule", (m) => {
    const mockV3Aggregator = m.contract("MockV3Aggregator", [
        m.getParameter("decimal", DECIMAL),
        m.getParameter("initialValue", INITIAL_VALUE),
    ])

    return { mockV3Aggregator }
})

export default MockV3AggregatorModule
