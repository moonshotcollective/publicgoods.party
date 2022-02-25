// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./SwapRouter.sol";
import "./GrantRegistry.sol";
import "./GrantRound.sol";
import "hardhat/console.sol";

contract GrantRoundManager is SwapRouter {
    // --- Libraries ---
    using Address for address;
    using BytesLib for bytes;
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // --- Data ---
    /// @notice Address of the GrantRegistry
    GrantRegistry public immutable registry;

    address public immutable swapRouter =
        0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45;

    /// @notice Address of the ERC20 token in which donations are made
    IERC20 public immutable donationToken;

    /// @dev Used for saving off swap output amounts for verifying input parameters
    mapping(IERC20 => uint256) internal swapOutputs;

    /// @dev Used for saving off contribution ratios for verifying input parameters
    mapping(IERC20 => uint256) internal donationRatios;

    /// @dev Scale factor on percentages when constructing `Donation` objects. One WAD represents 100%
    uint256 internal constant WAD = 1e18;

    /// --- Types ---
    /// @dev Defines the total `amountIn` of the first token in `path` that needs to be swapped to `donationToken`
    struct SwapSummary {
        uint256 amountIn;
        uint256 amountOutMin; // minimum amount to be returned after swap
        bytes path; // Use `path == donationToken` to indicate no swap is required and just transfer the tokens directly
    }

    struct SwapData {
        IERC20 inputToken;
        uint256 inputAmount;
        bytes data;
        uint256 value;
    }

    /// @dev Donation inputs and Uniswap V3 swap inputs: https://docs.uniswap.org/protocol/guides/swaps/multihop-swaps
    struct Donation {
        uint96 grantId; // grant ID to which donation is being made
        IERC20 token; // address of the token to donate
        uint256 ratio; // ratio of `token` to donate, specified as numerator where WAD = 1e18 = 100%
        GrantRound[] rounds; // rounds against which the donation should be counted
    }

    // --- Events ---
    /// @notice Emitted when a new GrantRound contract is created
    event GrantRoundCreated(address grantRound);

    /// @notice Emitted when a donation has been made
    event GrantDonation(
        uint96 indexed grantId,
        IERC20 indexed tokenIn,
        uint256 donationAmount,
        GrantRound[] rounds,
        uint256 time
    );

    // --- Constructor ---
    constructor(
        GrantRegistry _registry,
        IERC20 _donationToken,
        address _factory,
        address _weth
    ) SwapRouter(_factory, _weth) {
        // Validation
        require(
            _registry.grantCount() >= 0,
            "GrantRoundManager: Invalid registry"
        );
        require(
            _donationToken.totalSupply() > 0,
            "GrantRoundManager: Invalid token"
        );

        // Set state
        registry = _registry;
        donationToken = _donationToken;
    }

    // --- Core methods ---
    /**
     * @notice Creates a new GrantRound
     * @param _owner Grant round owner that has permission to update the metadata pointer
     * @param _payoutAdmin Grant round administrator that has permission to payout the matching pool
     * @param _matchingToken Address for the token used to payout match amounts at the end of a round
     * @param _startTime Unix timestamp of the start of the round
     * @param _endTime Unix timestamp of the end of the round
     * @param _metaPtr URL pointing to the grant round metadata
     */
    function createGrantRound(
        address _owner,
        address _payoutAdmin,
        IERC20 _matchingToken,
        uint256 _startTime,
        uint256 _endTime,
        MetaPtr calldata _metaPtr
    ) external {
        require(
            _matchingToken.totalSupply() > 0,
            "GrantRoundManager: Invalid matching token"
        );
        GrantRound _grantRound = new GrantRound(
            _owner,
            _payoutAdmin,
            registry,
            donationToken,
            _matchingToken,
            _startTime,
            _endTime,
            _metaPtr
        );

        emit GrantRoundCreated(address(_grantRound));
    }

    /*
     * @notice Performs swaps if necessary and donates funds as specified
     * @param _swaps Array of SwapSummary objects describing the swaps required
     * @param _deadline Unix timestamp after which a swap will revert, i.e. swap must be executed before this
     * @param _donations Array of donations to execute
     * @dev `_deadline` is not part of the `_swaps` array since all swaps can use the same `_deadline` to save some gas
     * @dev Caller must ensure the input tokens to the _swaps array are unique
     */
    function donate(
        SwapData[] calldata _swaps,
        Donation[] calldata _donations
    ) external payable {
        // Main logic
        _validateDonations(_donations);
        console.log("Donations validated!");
        _routerSwap(_swaps);
        console.log("Swaps done!");
        _transferDonations(_donations);
        console.log("Donations Transfered!");

        // Clear storage for refunds (this is set in _executeDonationSwaps)
        for (uint256 i = 0; i < _swaps.length; i++) {
            IERC20 _tokenIn = IERC20(_swaps[i].inputToken);
            swapOutputs[_tokenIn] = 0;
            donationRatios[_tokenIn] = 0;
        }
        for (uint256 i = 0; i < _donations.length; i++) {
            donationRatios[_donations[i].token] = 0;
        }
    }

    function _routerSwap(SwapData[] memory _swaps) internal {
        for (uint256 i = 0; i < _swaps.length; i++) {
            require(swapOutputs[_swaps[i].inputToken] == 0,"GrantRoundManager: Swap parameter has duplicate input tokens");
            require(donationRatios[_swaps[i].inputToken] == WAD,"GrantRoundManager: Ratios do not sum to 100%");

            if (_swaps[i].inputToken != donationToken) {

                (bool success, bytes memory data) = swapRouter.delegatecall(_swaps[i].data);

                require(success, "swap failed");

                swapOutputs[_swaps[i].inputToken] = abi.decode(data, (uint256));
            } else {
                swapOutputs[_swaps[i].inputToken] = _swaps[i].inputAmount;
            }
        }
    }

    /**
     * @dev Validates the inputs to a donation call are valid, and reverts if any requirements are violated
     * @param _donations Array of donations that will be executed
     */
    function _validateDonations(Donation[] calldata _donations) internal {
        // TODO consider moving this to the section where we already loop through donations in case that saves a lot of
        // gas. Leaving it here for now to improve readability

        for (uint256 i = 0; i < _donations.length; i++) {
            // Validate grant exists
            require(
                _donations[i].grantId < registry.grantCount(),
                "GrantRoundManager: Grant does not exist in registry"
            );

            // Used later to validate ratios are correctly provided
            donationRatios[_donations[i].token] = donationRatios[
                _donations[i].token
            ].add(_donations[i].ratio);

            // Validate round parameters
            GrantRound[] calldata _rounds = _donations[i].rounds;
            for (uint256 j = 0; j < _rounds.length; j++) {
                require(
                    _rounds[j].isActive(),
                    "GrantRoundManager: GrantRound is not active"
                );
                require(
                    _rounds[j].registry() == registry,
                    "GrantRoundManager: Round-Registry mismatch"
                );
                require(
                    donationToken == _rounds[j].donationToken(),
                    "GrantRoundManager: GrantRound's donation token does not match GrantRoundManager's donation token"
                );
            }
        }
    }

    /**
     * @dev Core donation logic that transfers funds to grants
     * @param _donations Array of donations to execute
     */
    function _transferDonations(Donation[] calldata _donations) internal {
        for (uint256 i = 0; i < _donations.length; i++) {
            // Get data for this donation
            GrantRound[] calldata _rounds = _donations[i].rounds;
            uint96 _grantId = _donations[i].grantId;
            IERC20 _tokenIn = _donations[i].token;
            uint256 _donationAmount = (
                swapOutputs[_tokenIn].mul(_donations[i].ratio)
            ) / WAD;
            require(
                _donationAmount > 0,
                "GrantRoundManager: Donation amount must be greater than zero"
            ); // verifies that swap and donation inputs are consistent

            // Execute transfer
            emit GrantDonation(
                _grantId,
                _tokenIn,
                _donationAmount,
                _rounds,
                block.timestamp
            );
            address _payee = registry.getGrantPayee(_grantId);
            if (_tokenIn == donationToken) {
                _tokenIn.safeTransferFrom(msg.sender, _payee, _donationAmount); // transfer token directly from caller
            } else {
                donationToken.transfer(_payee, _donationAmount); // transfer swap output
            }
        }
    }
}
