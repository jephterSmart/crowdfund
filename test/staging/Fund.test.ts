import { expect } from "chai"
import { ethers, ignition, network } from "hardhat"
import { developmentNetwork } from "../../utils/hardhat-config"
import { FundMe } from "../../typechain-types"
import FundMeModule from "../../ignition/modules/FundMe"

developmentNetwork.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
          let fundContract: FundMe
          const valueToFund = ethers.parseUnits("0.1", "ether")
          //   const [deployer] = await ethers.getSigners()

          it("Check if contract can be funded", async () => {
              const { fundMe } = await ignition.deploy(FundMeModule, {
                  parameters: {
                      FundMeModule: {
                          priceFeedAddress:
                              "0x694AA1769357215DE4FAC081bf1f309aDC325306",
                      },
                  },
              })
              fundContract = fundMe as any
              const resp = await fundContract.fund({ value: valueToFund })
              await resp.wait(1)

              const contractBalance = await ethers.provider.getBalance(
                  fundContract.target
              )
              expect(contractBalance).to.equal(valueToFund)
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
