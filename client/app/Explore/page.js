'use client'
import React, { useContext, useState, useEffect } from 'react';
import Navbar from '../navbar';
import { useQuery } from '@apollo/react-hooks';
import { GET_ALL_DATA } from '../Collection/collection-query';
import client from '../../apollo-client';
import { BlockchainConfig } from '../Context/AppConfig';
import { ethers } from 'ethers';

const Explore = () => {
  // Fetch NFT data using GraphQL query
  const { buyingNFT } = useContext(BlockchainConfig);
  const { loading, error, data } = useQuery(GET_ALL_DATA, {
    client,
  });
  const [nftDataforcard, setnftDataforcard] = useState([]);

  const nftTransfers = data?.nfttransfers || [];

  useEffect(() => {
    async function fetchNFTData() {
      const nftDataArray = [];
      for (const nft of nftTransfers) {
        try {
          const response = await fetch(nft.tokenURI);
          if (response.ok) {
            const data = await response.json();
            const NFtID = nft.id;
            const fromAddress = nft.from;
            const price = nft.price;
            const toAddress = nft.to;
            const imageURL = data.image;
            const imageData = { ...data, image: imageURL };
            const jsonString = Object.values(imageData).join('');
            const dataObject = JSON.parse(jsonString);
            dataObject.from = fromAddress;
            dataObject.to = toAddress;
            dataObject.price = price;
            dataObject.id = NFtID;
            nftDataArray.push(dataObject);
          } else {
            console.error('Error fetching data:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
      setnftDataforcard(nftDataArray);
    }

    fetchNFTData();
  }, [nftTransfers]);

  // console.log(nftDataforcard);

  if (loading) {
    return (
      <div class="flex flex-col items-center justify-center h-screen">
        <div class="mb-6">
          <div class="text-center text-2xl mt-2">
            <p class="animate-blink inline-block">Loading<span class="animate-dots"></span></p>
          </div>
        </div>
        <div class="text-center text-xs md:text-base">
          <p>Why was the Ethereum developer always calm during network congestion?</p>
          <p>Because they knew patience is a gas fee virtue!</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const BuyNFT = async (id, price) => {
    try {
      const correctedValue = price/1e18;
      const correctedValueString = correctedValue.toString();
      const parsedValue = ethers.utils.parseEther(correctedValueString);
      // console.log(parsedValue);
      // console.log(correctedValueString);
      await buyingNFT(id, parsedValue);
      // console.log(id);
      window.alert("NFT has been brought successfully!!");
    } catch (error) {
      console.error("Error With Buying: ", error);
      // window.alert("Error With Buying");
    }
  }

  return (
    <div>
      <Navbar />
      <div>
        <h1 className="text-3xl md:text-6xl text-center mt-20">Explore</h1>
        <div className="flex flex-wrap justify-center mt-10 mb-10">
          {nftDataforcard.map((row) => (
            <div
              key={row.id}
              className="w-[75vw] md:w-[70vw] md:h-[40vh] lg:w-[80vw] md:px-1 flex flex-col md:flex-row mb-4 justify-center md:space-x-4"
            >
                <div
                  className="bg-white text-black text-center flex flex-col space-y-3 md:w-1/3 lg:w-1/4 rounded-lg mx-2 my-2 md:mx-0 md:my-0"
                >
                  <img
                    className="w-full h-40 md:h-[25vh] w-full rounded-tl-lg rounded-tr-lg"
                    src={row.image}
                    alt={"image"}
                  />
                  <h2 className="font-bold text-xl md:text-2xl">{row.name}</h2>
                  <div className="flex flex-row justify-center space-x-4">
                    <p>{ethers.utils.formatEther(row.price)} ETH</p>
                    <p>
                      {ethers.utils.formatEther(row.price) !== '0'
                        ? `${row.to.slice(0, 5)}...${row.to.slice(-5)}`
                        : `${row.from.slice(0, 5)}...${row.from.slice(-5)}`}
                    </p>
                  </div>
                  <div
                    className="bg-gray-400 flex flex-row justify-center items-center rounded-bl-lg rounded-br-lg cursor-pointer hover-bg-gray-600 hover-text-white"
                    onClick={() => BuyNFT(row.id, row.price)}
                  >
                    <p className="py-3 text-2xl">Buy</p>
                  </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
