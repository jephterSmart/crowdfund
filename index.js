// import { ethers } from "https://cdn.ethers.io/lib/ethers-5.2.esm.min.js"
const { ethers } = window.ethers
import { fundMeAbi, fundMeAddress } from "./constants.js"
async function main() {
    console.log(ethers)
    const btnConnect = document.getElementById("btn-connect")
    const btnFund = document.getElementById("btn-fund")
    const btnBalance = document.getElementById("btn-balance")
    const btnWithdraw = document.getElementById("btn-withdraw")
    function initialize() {
        if (window.ethereum?._state?.isConnected) {
            btnConnect.innerText = "Connected"
            getBalance()
        } else {
            btnConnect.innerText = "Connect"
        }
    }

    async function connect() {
        if (!window.ethereum) return
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
            btnConnect.innerText = "Connected"
        } catch (error) {
            console.log(error)
        }
    }
    async function fund() {
        if (!window.ethereum) return
        const amountFunded = document.getElementById("amountFunded").value || 0
        if (!amountFunded || !parseFloat(amountFunded)) {
            alert("Please specify amount to fund")
            return
        }
        document.getElementById("amountFunded").setAttribute("disabled", true)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const fundMeContract = new ethers.Contract(
            fundMeAddress,
            fundMeAbi,
            signer
        )

        const resp = await fundMeContract.fund({
            value: ethers.utils.parseUnits(amountFunded, "ether"),
        })
        await waitForTransactionMining(resp, provider)
        await getBalance()
        document.getElementById("amountFunded").value = ""
        document.getElementById("amountFunded").setAttribute("disabled", false)
    }
    async function withdraw() {
        if (!window.ethereum) return

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const fundMeContract = new ethers.Contract(
            fundMeAddress,
            fundMeAbi,
            signer
        )
        try {
            const resp = await fundMeContract.withdraw()
            await waitForTransactionMining(resp, provider)
            await getBalance()
        } catch (error) {
            console.error(error)
        }
    }
    async function getBalance() {
        if (!window.ethereum) return
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        const balance = await provider.getBalance(fundMeAddress)
        const balanceField = document.getElementById("balance-value")
        balanceField.innerText = ethers.utils.formatEther(balance)
    }
    function waitForTransactionMining(txnResp, provider) {
        return new Promise((resolve) => {
            provider.once(txnResp.hash, (txnRec) => {
                resolve(txnRec)
            })
        })
    }

    initialize()
    btnConnect.addEventListener("click", connect)
    btnFund.addEventListener("click", fund)
    btnBalance.addEventListener("click", getBalance)
    btnWithdraw.addEventListener("click", withdraw)
}

window.addEventListener("DOMContentLoaded", main)
