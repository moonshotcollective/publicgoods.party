// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

const sleep = (ms) =>
  new Promise((r) =>
    setTimeout(() => {
      // console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
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
      }
    }
  ];

  const GrantRegistry = await deploy("GrantRegistry", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
  });

  await deploy("GrantRoundManager", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [
      //Registry Address
      GrantRegistry.address,
      //Donation Token
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      //Factory Address
      "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      //Weth Address
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    ],
    log: true,
  });

  /*
  await deploy("MerkleGrantRoundPayout", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
     args: [
         //Mock Token
         MockToken.address,
         //Merkle Root
         "sample"
    ],
    log: true,
  });
  */

  /*
    To take ownership of yourContract using the ownable library uncomment next line and add the
    address you want to be the owner.
    // yourContract.transferOwnership(YOUR_ADDRESS_HERE);

    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */

  // Verify your contracts with Etherscan
  // You don't want to verify on localhost
  if (chainId !== localChainId) {
    // wait for etherscan to be ready to verify
    await sleep(15000);
    await run("verify:verify", {
      address: YourContract.address,
      contract: "contracts/YourContract.sol:YourContract",
      contractArguments: [],
    });
  }
};
module.exports.tags = ["YourContract"];
