import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import MockV3AggregatorModule from "./MockV3Aggregator"
import { network } from "hardhat"
import { developmentNetwork } from "../../utils/hardhat-config"

const FundMeModule = buildModule("FundMeModule", (m) => {
    const { mockV3Aggregator } = m.useModule(MockV3AggregatorModule)

    const fundMe = m.contract("FundMe", [
        developmentNetwork.includes(network.name)
            ? mockV3Aggregator
            : m.getParameter("priceFeedAddress"),
    ])

    return { fundMe, mockV3Aggregator }
})

export default FundMeModule
