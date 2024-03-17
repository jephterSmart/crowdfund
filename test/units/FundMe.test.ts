import { ethers, ignition, network } from "hardhat"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import FundMeModule from "../../ignition/modules/FundMe"
import { FundMe } from "../../typechain-types"
import { developmentNetwork } from "../../utils/hardhat-config"

!developmentNetwork.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
          async function deployFundMeModuleFixture() {
              return ignition.deploy(FundMeModule)
          }

          describe("constructor", () => {
              it("sets the aggregator address directly", async function () {
                  const { fundMe, mockV3Aggregator } = await loadFixture(
                      deployFundMeModuleFixture
                  )
                  const priceFeed = await fundMe.s_priceFeed()

                  expect(mockV3Aggregator).to.equal(priceFeed)
              })
          })
          describe("fund", () => {
              it("Fails if we do not send enough ether", async () => {
                  const { fundMe } = await loadFixture(
                      deployFundMeModuleFixture
                  )
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })

              it("Updates eth amount supplied for each funder", async () => {
                  const [deployer, anotherUser] = await ethers.getSigners()
                  const amountToFund = ethers.parseUnits("1", "ether")
                  const { fundMe } = await loadFixture(
                      deployFundMeModuleFixture
                  )

                  await fundMe.fund({ value: amountToFund })
                  const newFundMe = fundMe.connect(anotherUser) as typeof fundMe
                  await newFundMe.fund({ value: amountToFund })

                  const amountForDeployer =
                      await fundMe.s_addressToAmountFunded(deployer.address)
                  const amountForAnotherUser =
                      await newFundMe.s_addressToAmountFunded(
                          anotherUser.address
                      )

                  expect(amountForDeployer).to.equal(amountToFund)
                  expect(amountForAnotherUser).to.equal(amountToFund)
              })

              it("Adds funder to funders data structure", async () => {
                  const [deployer, anotherUser] = await ethers.getSigners()
                  const amountToFund = ethers.parseUnits("1", "ether")
                  const { fundMe } = await loadFixture(
                      deployFundMeModuleFixture
                  )

                  await fundMe.fund({ value: amountToFund })
                  const newFundMe = fundMe.connect(anotherUser) as typeof fundMe
                  await newFundMe.fund({ value: amountToFund })

                  const addressForDeployer = await fundMe.s_funders(0)
                  const addressForAnotherUser = await newFundMe.s_funders(1)
                  expect(deployer.address).to.equal(addressForDeployer)
                  expect(anotherUser.address).to.equal(addressForAnotherUser)
              })
          })

          describe("withdrawal", () => {
              let fundMe: FundMe
              beforeEach(async () => {
                  const { fundMe: contract } = await loadFixture(
                      deployFundMeModuleFixture
                  )
                  fundMe = contract as any
                  const amountToFund = ethers.parseUnits("1", "ether")
                  await fundMe.fund({ value: amountToFund })
              })
              it("Checks whether anyone, aside the deployer of the contract can withdraw funds", async () => {
                  const [_, anotherUser] = await ethers.getSigners()

                  const newFundMe = fundMe.connect(anotherUser) as FundMe

                  await expect(newFundMe.withdraw()).to.be.reverted
              })

              it("Withdraw Eth from a single founder", async () => {
                  const [deployer] = await ethers.getSigners()
                  const startingAddressBalance =
                      await ethers.provider.getBalance(fundMe.target)
                  const startingFounderBalance =
                      await ethers.provider.getBalance(deployer.address)

                  const resp = await fundMe.withdraw()
                  const { fee: moneySpentByFounderForWithrawal } =
                      (await resp.wait(1))!

                  const endingAddressBalance = await ethers.provider.getBalance(
                      fundMe.target
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
      })
