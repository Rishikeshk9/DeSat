import { ethers } from 'ethers';
import CrowdfundingSatelliteABI from '../../lib/abis/CrowdfundingSatellite.json';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { tokenId } = req.body;

  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.KEY, provider);
    const crowdfundingContract = new ethers.Contract(
      process.env.CROWDFUNDING_CONTRACT_ADDRESS,
      CrowdfundingSatelliteABI,
      wallet
    );

    const tx = await crowdfundingContract.endCampaign(tokenId);
    await tx.wait();

    res.status(200).json({ message: 'Campaign ended successfully', transactionHash: tx.hash });
  } catch (error) {
    console.error('Error ending campaign:', error);
    res.status(500).json({ message: 'Error ending campaign', error: error.message });
  }
}