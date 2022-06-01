import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import "./App.css";
import Icons from "./components/Icons";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import abi from "./abi/abi.json";

// Ethers
import { ethers } from "ethers";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: black;
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  cursor: pointer;
  // box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  // -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  // -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: black;
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--accent-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);

  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const description =
    "Goblin vs Elfs is a collection of 1500 Moonies which are ready to moon🚀🚀";

  const [totalSupply, setTotalSupply] = useState(0);
  const [freeTotalSupply, setFreeTotalSupply] = useState(1);
  const [freeRemaining, setFreeRemaining] = useState(0);

  const claimNFTs = () => {
    let cost = 0;
    let freeQuantity = mintAmount;
    let paidQuantity = 0;
    if (totalSupply + mintAmount > freeTotalSupply) {
      const remainingFree = freeTotalSupply - totalSupply;
      console.log(remainingFree);
      if (mintAmount >= remainingFree) {
        freeQuantity = remainingFree;
        paidQuantity = mintAmount - freeQuantity;
      }

      cost = CONFIG.WEI_COST;
    }
    console.log(freeQuantity);
    console.log(paidQuantity);
    // setCostHolder(cost);
    // console.log(web3.fromWei(cost.toNumber()));
    // console.log(ethers.utils.formatEther(cost));
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * paidQuantity);
    let totalGasLimit = String(gasLimit * mintAmount);

    // console.log("Cost: ", totalCostWei);
    // console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
        gasLimit: null,
        maxFee: null,
        maxPriority: null,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getRemaining = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      // "https://mainnet.infura.io/v3/33fcfd92106d4d7abd6f78393cb08093" //Ethereum Mainnet
      "https://rinkeby.infura.io/v3/5fd7bcc223cb4943817b92c7aba83941" //Ethereum Test Rinkeby
    );
    // console.log(CONFIG.CONTRACT_ADDRESS);

    const contract = new ethers.Contract(
      CONFIG.CONTRACT_ADDRESS,
      abi,
      provider
    );
    // console.log(contract);

    const freeTotal = await contract.freeMintTotal();
    // console.log(freeTotal);
    setFreeTotalSupply(await freeTotal.toString());
    // console.log(await contract.freeMintTotal());
    const total = await contract.totalSupply();
    // console.log(await total.toString());
    setTotalSupply(await total.toString());
    if (total < freeTotal) {
      setFreeRemaining(freeTotal - total);
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    // console.log(config);
    SET_CONFIG(config);
  };

  useEffect(async () => {
    getConfig();
  }, []);

  useEffect(() => {
    getRemaining();
  }, [CONFIG]);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  var settings = {
    dots: true,
    arrow: false,
    infinite: true,
    vertical: true,
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    pauseOnHover: false,
    responsive: [
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <>
      <div className="header">
        <div className="logo">
          <p>Goblin vs Elfs</p>
        </div>
        <div className="icons">
          <Icons
            type="twitter"
            link="https://twitter.com/goblinvselfswtf?s=21&t=azVf7WnqiC8UxZQ_U5nBCQ****"
          />
          <Icons
            type="opensea"
            link="https://opensea.io/collection/moonbirds-moonie"
          />
        </div>
      </div>
      <div className="main">
        {/* <div className="info show-sm">
          <p className="text- text-center text-lg">{description}</p>
          <br />
          <p className="text-center text-white visible ">
            © 2022 Goblin vs Elfs
          </p>
        </div> */}
        <div className="inner">
          <div className="slideImage"></div>
          <div className="slideImage">
            <img
              style={{ maxHeight: "516px" }}
              src={`https://cdn.discordapp.com/attachments/923870894311497738/964876589064134676/IMG_2164.gif`}
            />
          </div>
        </div>

        <div className="inner">
          <div className="flex justify-center  sm:block">
            {" "}
            <p className="connectHeader">Goblin vs Elfs</p>
          </div>
          <div>
            <s.Container
              className="innerMint"
              flex={2}
              jc={"center"}
              ai={"center"}
              style={{
                // backgroundColor: "#f5efef",
                padding: "48px 24px",
                borderRadius: 24,
                width: "75%",
                margin: "30px auto",
                // border: "4px solid black",
                // border: "10px inset rgba(0,0,0,1)",
                // boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
              }}
            >
              <div className="info ">
                <p className="text-black text-center text-lg">{description}</p>
                <p className="text-black text-center freeRemaining">
                  Free Remaining: {freeRemaining}
                </p>
                {/* <p className="text-center text-white visible ">
                  © 2022 Goblin vs Elfs
                </p> */}
              </div>
              <s.TextTitle
                style={{
                  textAlign: "center",
                  fontSize: 50,
                  fontWeight: "bold",
                  color: "var(--accent)",
                }}
              >
                {totalSupply == 0 ? "-" : totalSupply} / {CONFIG.MAX_SUPPLY}
              </s.TextTitle>
              <s.TextDescription
                style={{
                  textAlign: "center",
                  color: "var(--primary-text)",
                }}
              >
                <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                  {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
                </StyledLink>
              </s.TextDescription>
              <s.SpacerSmall />
              {Number(totalSupply) >= CONFIG.MAX_SUPPLY ? (
                <>
                  <s.TextTitle
                    style={{ textAlign: "center", color: "var(--accent)" }}
                  >
                    The sale has ended.
                  </s.TextTitle>
                  <s.TextDescription
                    style={{ textAlign: "center", color: "var(--accent)" }}
                  >
                    You can still find {CONFIG.NFT_NAME} on
                  </s.TextDescription>
                  <s.SpacerSmall />
                  <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                    {CONFIG.MARKETPLACE}
                  </StyledLink>
                </>
              ) : (
                <>
                  <s.TextTitle
                    style={{ textAlign: "center", color: "var(--accent)" }}
                  >
                    {/* 1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}{CONFIG.NETWORK.SYMBOL}. */}
                    Price:{" "}
                    {totalSupply >= freeTotalSupply ? CONFIG.DISPLAY_COST : 0}{" "}
                    {CONFIG.NETWORK.SYMBOL}.
                  </s.TextTitle>
                  <s.SpacerXSmall />
                  <s.TextDescription
                    style={{ textAlign: "center", color: "var(--accent)" }}
                  >
                    {/* Excluding gas fees. */}
                  </s.TextDescription>
                  <s.SpacerSmall />
                  {blockchain.account === "" ||
                  blockchain.smartContract === null ? (
                    <s.Container ai={"center"} jc={"center"}>
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent)",
                        }}
                      >
                        Connect to the {CONFIG.NETWORK.NAME} network
                      </s.TextDescription>
                      <s.SpacerSmall />
                      <StyledButton
                        onClick={(e) => {
                          e.preventDefault();
                          dispatch(connect());
                          getData();
                        }}
                      >
                        CONNECT
                      </StyledButton>
                      {blockchain.errorMsg !== "" ? (
                        <>
                          <s.SpacerSmall />
                          <s.TextDescription
                            style={{
                              textAlign: "center",
                              color: "var(--accent)",
                            }}
                          >
                            {blockchain.errorMsg}
                          </s.TextDescription>
                        </>
                      ) : null}
                    </s.Container>
                  ) : (
                    <>
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent)",
                        }}
                      >
                        {feedback}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <s.Container ai={"center"} jc={"center"} fd={"row"}>
                        <StyledRoundButton
                          style={{ lineHeight: 0.4 }}
                          disabled={claimingNft ? 1 : 0}
                          onClick={(e) => {
                            e.preventDefault();
                            decrementMintAmount();
                          }}
                        >
                          -
                        </StyledRoundButton>
                        <s.SpacerMedium />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent)",
                          }}
                        >
                          {mintAmount}
                        </s.TextDescription>
                        <s.SpacerMedium />
                        <StyledRoundButton
                          disabled={claimingNft ? 1 : 0}
                          onClick={(e) => {
                            e.preventDefault();
                            incrementMintAmount();
                          }}
                        >
                          +
                        </StyledRoundButton>
                      </s.Container>
                      <s.SpacerSmall />
                      <s.Container ai={"center"} jc={"center"} fd={"row"}>
                        <StyledButton
                          disabled={claimingNft ? 1 : 0}
                          onClick={(e) => {
                            e.preventDefault();
                            claimNFTs();
                            getData();
                          }}
                        >
                          {claimingNft ? "Minting" : "Mint"}
                        </StyledButton>
                      </s.Container>
                    </>
                  )}
                </>
              )}
              <s.SpacerMedium />
            </s.Container>
          </div>
        </div>
      </div>
      {/* <MainSection/> */}
    </>
  );
}

export default App;