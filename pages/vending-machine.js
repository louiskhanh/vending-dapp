import 'bulma/css/bulma.css'
import Head from 'next/head'
import styles from '../styles/VendingMachine.module.css'
import Web3 from 'web3'
import { useState, useEffect } from 'react'
import vendingMachineContract  from '../blockchain/vending'

const VendingMachine = () => {
	const [error, setError] = useState('')
	const [successMsg, setSuccessMsg] = useState('')
	const [inventory, setInventory] = useState('')
	const [donutCount, setDonutCount] = useState('')
	const [buyDonut, setBuyDonut] = useState('')
	const [buyCount, setBuyCount] = useState ('')
	const [donutQty, setDonutQty] = useState('')
	const [web3, setWeb3] = useState(null)
	const [address, setAddress] = useState(null)
	const [vmContract, setVmContract] = useState(null)
	const [purchase, setPurchase] = useState(0)


	useEffect(() => {
		if(vmContract){
			getInventoryHandler();
			console.log("getInventoryHandler")
		}
		if(vmContract && address){ 
			getDonutCountHandler();
			console.log("getDonutCountHandler")
		}
	 
	},[vmContract, address]);

	const getInventoryHandler = async () => {
		const inventory = await vmContract.methods.getVendingMachineBalance().call()
		setInventory(inventory)
	}

	const getDonutCountHandler = async () => {
		const count = await vmContract.methods.donutBalances(address).call()
		setDonutCount(count)
	}

	const buyDonutHandler = async () => {
		try{
			//var estimate = web3.eth.estimateGas(vmContract)
			//console.log(estimate)
			await vmContract.methods.purchase(buyCount).send({
				from: address,
				value: web3.utils.toWei('1','ether') * buyCount,
				gas: 3000000,
          		gasPrice: null

			})
			
			setSuccessMsg(`${buyCount} Donuts purchased!`)

			if (vmContract) getInventoryHandler()
        	if (vmContract && address) getDonutCountHandler()


		}
		catch(err){
			setError(err.message)
		}
		
		//setDonutCount(count)
	}


	const updateDonutQty = event => {
		setBuyCount(event.target.value)
	}
	//WINDOW ETHEREUM
	const connectWalletHandler = async () => {
		if(typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'){
			try {
				await window.ethereum.request({method : "eth_requestAccounts"});
				web3 = new Web3(window.ethereum);
				setWeb3(web3)

				const accounts = await web3.eth.getAccounts()
				setAddress(accounts[0])
				
				const vm = vendingMachineContract(web3)
				setVmContract(vm)
				
			} catch(err){
				setError(err.message);
			}
		}else{
			setError("Please install MetaMask!!");
			//onsole.log("Please install MetaMask!");
		}
	}
	return (
		<div className={styles.main}>
			<Head>
				<title> Vending Machine app </title>
				<meta name="description" content="Blockchain Dapp  next app" />

			</Head> 
			<nav className="navbar mt-4">
				<div className="container">
					<div className="navbar-brand">
						<h1> Vending Machine</h1> 
		 			</div> 
		 			<div className="navbar-end">
		 				<button className="button is-primary" onClick={connectWalletHandler} > Connect Wallet </button>
		 			</div>
		 		</div>
		 	</nav>
		 	<section>
		 		<div className="container">
		 			<h2>Vending Machine Inventory: {inventory} </h2></div>
		 	</section> 
		 	<section>
		 		<div className="container">
		 			<h2>My Donuts : {donutCount} </h2>
		 		</div>
		 	</section> 
		 	<section className="mt-4">
		 		<div className="container">
		 			<div className="field">
		 				<label className="label">BUY</label>
		 				<div className="control">
		 					<input onChange={updateDonutQty} className="input" type="text" placeholder="Enter amount ..." />
		 				</div> 
		 				<button onClick={buyDonutHandler} className="button is-primary mt-2" > BUY </button>

		 			</div>
		 		</div>
		 	</section> 
		 	<section>
		 		<div className="container has-text-danger"><p> {error}</p></div>
		 	</section>
		 	<section>
		 		<div className="container has-text-success"><p> {successMsg}</p></div>
		 	</section>
		</div>
	);

}
export default VendingMachine