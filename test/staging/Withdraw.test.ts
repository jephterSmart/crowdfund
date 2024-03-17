import { expect } from "chai"
import { ethers, network } from "hardhat"
import { FundMe } from "../../typechain-types"
import { developmentNetwork } from "../../utils/hardhat-config"

developmentNetwork.includes(network.name)
    ? describe.skip
    : describe("Fund Account", () => {
          let fundContract: FundMe
          //   const valueToFund = ethers.parseUnits("0.1", "ether")
          //   const [deployer] = await ethers.getSigners()
          beforeEach(async () => {
              fundContract = await ethers.getContractAt(
                  "FundMe",
                  "0x39b892B8041da798d977be206cFfAa652e7a1c52"
              )
          })

          it("Withdraw Fund from account", async () => {
              const [deployer] = await ethers.getSigners()
              const startingAddressBalance = await ethers.provider.getBalance(
                  fundContract.target
              )
              const startingFounderBalance = await ethers.provider.getBalance(
                  deployer.address
              )

              const resp = await fundContract.withdraw()
              const { fee: moneySpentByFounderForWithrawal } = (await resp.wait(
                  1
              ))!

              const endingAddressBalance = await ethers.provider.getBalance(
                  fundContract.target
              )
              const endingFounderBalance = await ethers.provider.getBalance(
                  deployer.address
              )

              expect(endingAddressBalance).to.equal(0n)
              expect(
                  endingFounderBalance + moneySpentByFounderForWithrawal
              ).to.equal(startingAddressBalance + startingFounderBalance)
          })
      })
