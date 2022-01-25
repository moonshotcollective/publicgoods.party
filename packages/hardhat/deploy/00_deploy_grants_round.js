// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

const sleep = (ms) =>
  new Promise((r) =>
    setTimeout(() => {
      console.log(
        `waited for ${(ms / 1000).toFixed(3)} seconds before moving on`
      );
      r();
    }, ms)
  );

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const grants = [
    {
      owner: "0x34f4E532a33EB545941e914B25Efe348Aea31f0A",
      payee: "0x06c94663E5884BE4cCe85F0869e95C7712d34803",
      metaPtr: {
        protocol: 1,
        pointer: "QmaHTgor7GhetW3nmev3UqabjrzbKJCe7q1v8Wfg3aZyV4",
      },
    },
  ];

  const GrantRegistry = await deploy("GrantRegistry", {
    from: deployer,
    log: true,
  });

  const Weth = await deploy("Weth", {
    from: deployer,
    args: [ethers.utils.parseEther("10000")],
    log: true,
  });

  const MockToken = await deploy("MockToken", {
    from: deployer,
    args: [ethers.utils.parseEther("1.5")],
    log: true,
  });

  const DonationToken = await deploy("DonationToken", {
    from: deployer,
    args: [ethers.utils.parseEther("1.5")],
    log: true,
  });

  const GrantRound = await deploy("GrantRound", {
    from: deployer,
    args: [
      // meta admin address
      "0x807a1752402D21400D555e1CD7f175566088b955",
      // payout admin address
      "0x807a1752402D21400D555e1CD7f175566088b955",
      // Grant Registry Address
      GrantRegistry.address,
      // Donation Token
      DonationToken.address,
      // Mock Token
      MockToken.address,
      // start time EPOCH
      16400185890,
      // end time EPOCH
      16400185900,
      // metadata pointer
      (grants[0].metaPtr = {
        protocol: 1,
        pointer: "QmTQMgoxDRj8gfNn5Cvznt5CoEE6cz9MQeZrQsNb36BMdm",
      }),
    ],
    log: true,
  });

  await deploy("GrantRoundManager", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [
      // Registry Address
      GrantRegistry.address,
      // Donation Token
      DonationToken.address,
      // UNI v2 Factory Address - for chain we are deploying to.
      "0x807a1752402D21400D555e1CD7f175566088b955",
      // Weth Address
      Weth.address,
    ],
    log: true,
  });

  // Verify your contracts with Etherscan
  // You don't want to verify on localhost
  if (chainId !== localChainId) {
    sleep(5000);
    await run("verify:verify", {
      address: GrantRound.address,
      contract: "contracts/GrantRound.sol:GrantRound",
      contractArguments: [],
    });
  }
};

module.exports.tags = [
  "GrantRegistry",
  "Weth",
  "MockToken",
  "DonationToken",
  "GrantRound",
  "GrantRoundManager",
];
