'use client'
import React, { useEffect, useState, useRef, useContext } from 'react';
import Navbar from '../navbar';
import { ethers } from 'ethers';
import { useQuery } from '@apollo/react-hooks';
import { GET_DATA, LIST_DATA } from './collection-query';
import client from '../../apollo-client';
import { BlockchainConfig } from '../Context/AppConfig';

const Collection = () => {
  const [selectedButton, setSelectedButton] = useState('unlisted');
  const [showAmountCardMap, setShowAmountCardMap] = useState(null);
  const popupRef = useRef();
  const [ethereumAddress, setEthereumAddress] = useState(null);
  const [datas, setDatas] = useState([]);
  const inputRef = useRef(null);
  const { listNFT, cancelListing } = useContext(BlockchainConfig);
  const [nftDataforcard, setnftDataforcard] = useState([]);
  useEffect(() => {
    async function fetchEthereumAddress() {
      try {
        if (window.ethereum) {
          await window.ethereum.enable();
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setEthereumAddress(address);
        } else {
          throw new Error('Ethereum wallet not detected');
        }
      } catch (error) {
        console.error('Error fetching Ethereum address:', error.message);
      }
    }

    fetchEthereumAddress();
  }, []);

  const { loading, error, data } = useQuery(GET_DATA, {
    client,
    variables: { owner: ethereumAddress },
  });

  const { data: data2 } = useQuery(LIST_DATA, {
    client,
    variables: { owner: ethereumAddress },
  });

  const nftData = selectedButton === 'listed' ? data2 : data;
  const nftTransfers = nftData?.nfttransfers || [];

  useEffect(() => {
    nftTransfers.forEach((nft) => {
      fetch(nft.tokenURI)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            console.log("Raw Data: " + typeof data);
            setnftDataforcard((prevData) => [...prevData, data])
          };
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    });

  }, [nftTransfers]);

  if (nftDataforcard.length >= 4) {
    console.log("Refined Sexy Data: " + typeof nftDataforcard[3]);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-6">
          <div className="text-center text-2xl mt-2">
            <p className="animate-blink inline-block">Loading<span className="animate-dots"></span></p>
          </div>
        </div>
        <div className="text-center text-xs md:text-base">
          <p>What did the crypto enthusiast say when asked about their love life?</p>
          <p>"I'm HODLing out for the right one!"</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const cancelListingFunc = async (id) => {
    try {
      await cancelListing(id);
      window.alert('NFT has been Unlisted successfully!!');
    } catch (error) {
      console.error('Error With Cancelling: ', error);
      window.alert('Error With Cancelling');
    }
  };

  const givePrice = async (nft) => {
    // Get the input value if inputRef.current is defined
    const inputValue = inputRef.current ? inputRef.current.value : '';

    // Validate the input (e.g., check if it's a valid number)

    try {
      // Assuming input validation is successful, call listNFT once
      await listNFT(nft.id, inputValue);

      // Create a new data object with the updated value for the specific card
      const updatedData = { id: nft.id, value: inputValue };

      // Update the datas state by replacing the specific card's data or adding it if it doesn't exist
      setDatas((prevData) => {
        const existingIndex = prevData.findIndex((item) => item.id === nft.id);

        if (existingIndex !== -1) {
          // Replace the existing card's data
          prevData[existingIndex] = updatedData;
          return [...prevData]; // Return a new array to trigger a state update
        } else {
          // Add the new card's data to the existing data
          return [...prevData, updatedData];
        }
      });

      // Log the updated datas
      console.log(datas);

      // Close the popup by resetting showAmountCardMap to null
      setShowAmountCardMap(null);
    } catch (error) {
      // Handle errors, e.g., display an error message to the user
      console.error('Error listing NFT:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div>
        <h1 className="text-3xl md:text-6xl text-center mt-20">Your Collection</h1>
        <div className="flex flex-row justify-center mt-5 space-x-5">
          <button
            className={`w-40 lg:w-auto bg-gray-400 p-2 px-6 lg:px-10 rounded-full lg:rounded-[25px] hover:bg-gray-500 ${selectedButton === 'unlisted' ? 'bg-gray-500' : ''}`}
            onClick={() => setSelectedButton('unlisted')}
          >
            <p className="text-center lg:text-left">Unlisted NFTs</p>
          </button>
          <button
            className={`w-40 lg:w-auto bg-gray-400 p-2 px-6 lg:px-10 rounded-full lg:rounded-[25px] hover:bg-gray-500 ${selectedButton === 'listed' ? 'bg-gray-500' : ''}`}
            onClick={() => setSelectedButton('listed')}
          >
            <p className="text-center lg:text-left">Listed NFTs</p>
          </button>
        </div>

        <div className="flex flex-col justify-center mt-10 mb-10">
          {nftTransfers.length === 0 && (
            <div className="absolute pl-[35%] md:pl-[32%] lg:pl-[40%] pt-[5%]">
              <p>Oopsie!! No NFTs to display or Loading</p>
            </div>
          )}
          {nftTransfers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-10 md:px-20">
              {nftTransfers.map((nft) =>
              (
                <div key={nft.id} className="flex flex-row justify-center items-center mb-5 rounded-lg">
                  <div
                    className={`bg-white text-black text-center flex flex-col w-[80vw] md:w-[20vw] space-y-3 rounded-lg`}
                  >
                    <img
                      className="h-40 md:h-[25vh] w-full rounded-tl-lg rounded-tr-lg"
                      src={nft}
                      alt={"Image"}
                    />
                    {/* {console.log(nftDataforcard[0])} */}
                    <h2 className="font-bold text-xl md:text-2xl">{`NFT#${nft.id}`}</h2>
                    <div className="flex flex-row justify-center space-x-4">
                      <p>{ethers.utils.formatEther(nft.price)} ETH</p>
                      <p>{ethers.utils.formatEther(nft.price) !== '0' ? `${nft.to.slice(0, 5)}...${nft.to.slice(-5)}` : `${nft.from.slice(0, 5)}...${nft.from.slice(-5)}`}</p>
                    </div>
                    {selectedButton === 'listed' ? (
                      <div
                        className={"bg-gray-400 flex flex-row justify-center items-center rounded-bl-lg rounded-br-lg cursor-pointer hover:bg-gray-600 hover:text-white hover:cursor-pointer"}
                        onClick={() => cancelListingFunc(nft.id)}
                      >
                        <p className="py-3 text-2xl">Unlisted</p>
                      </div>
                    ) : (
                      <div
                        className={"bg-gray-400 flex flex-row justify-center items-center rounded-bl-lg rounded-br-lg cursor-pointer hover:bg-gray-600 hover:text-white hover:cursor-pointer"}
                        onClick={() => setShowAmountCardMap(nft.id)}
                      >
                        <p className="py-3 text-2xl">List</p>
                      </div>
                    )}
                    {showAmountCardMap === nft.id && (
                      <div
                        ref={popupRef}
                        className="amount-popup fixed top-0 left-0 flex justify-center items-center w-full h-full backdrop-blur-sm"
                      >
                        <div className="bg-gray-100 p-4 rounded-lg">
                          <div>
                            <div className="flex flex-row">
                              <p className="text-md md:text-lg py-1 px-2 md:py-2 md:px-5 rounded-tl-lg rounded-bl-lg text-black bg-gray-500 bg-opacity-80">
                                Enter Amount
                              </p>
                              <input
                                className="py-1 px-2 w-[110px] md:py-2 md:px-3 md:w-[210px] rounded-tr-lg bg-gray-300 rounded-br-lg bg-white bg-opacity-60"
                                type="text"
                                ref={inputRef}
                              />
                            </div>
                            <button className="mt-5 py-3 px-8 bg-gray-200 hover:bg-gray-400 text-black font-[1.5rem] rounded-lg" onClick={() => givePrice(nft)}>
                              List
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;
