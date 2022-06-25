import 'bulma/css/bulma.css'
import Head from 'next/head'
import styles from '../styles/VendingMachine.module.css'
import Web3 from 'web3'
import { useState, useEffect } from 'react'
import vendingMachineContract  from '../blockchain/vending'

const VendingMachine = () => {
	const [web3, setWeb3] = useState(null)
	const [address, setAddress] = useState(null)
	const [vmContract, setVmContract] = useState(null)

	const [error, setError] = useState('')
	const [successMsg, setSuccessMsg] = useState('')
	const [inventory, setInventory] = useState('')
	const [donutCount, setDonutCount] = useState('')
	const [buyDonut, setBuyDonut] = useState('')
	const [buyCount, setBuyCount] = useState ('')
	const [donutQty, setDonutQty] = useState('') 

	const [purchase, setPurchase] = useState(0)
	const [restock, setRestock] = useState(0)
	const [restockAmount, SetRestockAmount] = useState('')

	useEffect(() => {
		connectWalletHandler()
	},[])
	useEffect(() => {
		

		if(vmContract){
			getInventoryHandler();
			console.log("getInventoryHandler")
		}
		if(vmContract && address){ 
			getDonutCountHandler();
			console.log("getDonutCountHandler")
		}
	 
	},[vmContract, address, restockAmount]);

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

    const restockHandler = async () => { 
    	try{
	    	await vmContract.methods.restock(restockAmount).send({ 
	    		from: address,
	    		gas: 3000000,
	    		gasPrice : null
	    	})
			setSuccessMsg(`${restockAmount} donuts has been restocked!`)
			if (vmContract) getInventoryHandler()
		}catch (err){
			setError(err.message)
		}
    }

	const updateDonutQty = event => {
		setBuyCount(event.target.value)
	}

	const updateRestockAmount = event => {
		SetRestockAmount(event.target.value)
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
				<meta name="description" content="Blockchain Dapp next app" />

			</Head>  
			<div className="container">
					<div className="navbar-brand m-3">
						<h1 class="title"> Vending Machine</h1> 

		 			</div> 
		 			<div className="navbar-end m-3">
		 				<button className="button is-primary" onClick={connectWalletHandler} > Connect Wallet </button>
		 			</div>

		 	</div>
		 	<div className="container">
		 		<div className="navbar-end m-4">
		 				<p> Address : </p> {address} 
		 		</div>
		 	</div>
		 	<div class="columns">
		 	    
			 	<div class="column m-6">
			 		<div className="container">
			 			<div className={styles.card}>
			 				<label className="label">Donut Price : 1 ETH</label>
			 				<div className="control">
			 					<input onChange={updateDonutQty} class="input is-rounded" type="text" placeholder="Enter amount ..." />
			 				</div> 
			 				<button onClick={buyDonutHandler} className="button is-primary mt-2" > BUY </button>

			 			</div>
			 			<div className={styles.card}>
			 			    <label className="label">Only owner can restock.</label>
			 				<div className="control">
			 					<input onChange={updateRestockAmount} className="input is-rounded" type="text" placeholder="Enter Restock amount ..." />
			 				</div> 
			 				<button onClick={restockHandler} className="button is-primary mt-2" > RESTOCK </button>

			 			</div>

			 		</div>
			 	</div> 
			 	<div class="column m-6">
			 		<div className="container">
			 			<div className="navbar-end">
				 			<div className={styles.card}>
				 				<h2 class="subtitle is-3">Inventory: {inventory} </h2>
				 				<h2 class="subtitle is-3">My Donuts : {donutCount} </h2> 
				 			</div> 
			 			</div>
			 		</div>
		 	 	</div>
			</div>
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