import { ContractFactory, ethers } from "ethers";

const ethersWeb3Provider = (provider, uiConsole) => {
  const getAddress = async () => {
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      return address;
    } catch (error) {
      uiConsole(error);
      return error.toString();
    }
  };

  const getChainId = async () => {
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      return (await ethersProvider.getNetwork()).chainId.toString(16);
    } catch (error) {
      uiConsole(error);
      return error.toString();
    }
  };

  const getBalance = async () => {
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      const res = ethers.formatEther(
        await ethersProvider.getBalance(address)
      );
      const balance = (+res).toFixed(4);
      return balance;
    } catch (error) {
      uiConsole(error);
      return error.toString();
    }
  };

  const getSignature = async (message) => {
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const signedMessage = await signer.signMessage(message);
      return signedMessage;
    } catch (error) {
      uiConsole(error);
      return error.toString();
    }
  };

  const sendTransaction = async (amount, destination) => {
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const amountBigInt = ethers.parseEther(amount);
      const tx = await signer.sendTransaction({
        to: destination,
        value: amountBigInt,
        maxPriorityFeePerGas: "5000000000",
        maxFeePerGas: "6000000000000",
      });
      return `Transaction Hash: ${tx.hash}`;
    } catch (error) {
      uiConsole(error);
      return error.toString();
    }
  };

  const getPrivateKey = async () => {
    try {
      const privateKey = await provider?.request({
        method: "eth_private_key",
      });
      return privateKey;
    } catch (error) {
      uiConsole(error);
      return error.toString();
    }
  };

  const deployContract = async (contractABI, contractByteCode, initValue) => {
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const factory = new ContractFactory(JSON.parse(contractABI), contractByteCode, signer);
      const contract = await factory.deploy(initValue);
      uiConsole("Contract:", contract);
      uiConsole(`Deploying Contract at Target: ${contract.target}, waiting for confirmation...`);
      const receipt = await contract.waitForDeployment();
      uiConsole("Contract Deployed. Receipt:", receipt);
      return receipt;
    } catch (error) {
      uiConsole(error);
      return error.toString();
    }
  };

  const readContract = async (contractAddress, contractABI) => {
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      uiConsole(contractABI);
      const contract = new ethers.Contract(contractAddress, JSON.parse(contractABI), signer);
      const message = await contract.message();
      return message;
    } catch (error) {
      uiConsole(error);
      return error.toString();
    }
  };

  const writeContract = async (contractAddress, contractABI, updatedValue) => {
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const contract = new ethers.Contract(contractAddress, JSON.parse(JSON.stringify(contractABI)), signer);
      const tx = await contract.update(updatedValue);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      uiConsole(error);
      return error.toString();
    }
  };

  return {
    getAddress,
    getBalance,
    getChainId,
    getSignature,
    sendTransaction,
    getPrivateKey,
    deployContract,
    readContract,
    writeContract,
  };
};

export default ethersWeb3Provider;