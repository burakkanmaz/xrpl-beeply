import { useEffect, useRef, useState } from 'react'
import * as xrpl from 'xrpl'
import './App.css'
import axios from 'axios';

function App() {
  const PINATA_API_KEY = "e6a6a3f62c60417f883b";
  const PINATA_SECRET_API_KEY = "af5618b87a650073327c5f3a097eb45314d315472f2c1ce6670bd145ffccfdb9";

  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([] as string[]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [logs]);

  const openModal = () => {
    return setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const log = (message: string) => {
    setLogs((logs) => [...logs, message]);
  };

  const run = async () => {
    setIsModalOpen(false);
    setIsRunning(true);
    log("Started.");

    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    log("Connecting to XRPL...");
    await client.connect();
    log("Connected.");

    log("Getting the source wallet info...");
    const sourceWallet = xrpl.Wallet.fromSeed("sEdTST7bgtXjShKFyZ4ErWDUyg5jC9Q");
    log(`Source Wallet: ${JSON.stringify(sourceWallet, null, 2)}`);

    log("Creating the destionation wallet...");
    const destionationWallet = xrpl.Wallet.generate();
    log(`Destionation Wallet: ${JSON.stringify(destionationWallet, null, 2)}`);

    log("Creating IPFS hash...");
    const ipfsHash = await createIpfsHash(new File(["Hello, world!"], "hello.txt"));
    log(`IPFS hash: ${ipfsHash}`);

    // create nft with ipfs hash
    log("Creating NFT...");
    const transactionBlob: xrpl.NFTokenMint = {
      TransactionType: "NFTokenMint",
      Account: sourceWallet.classicAddress,
      URI: xrpl.convertStringToHex(ipfsHash),
      Flags: 1,
      TransferFee: 0,
      NFTokenTaxon: 0
    };
    const tx = await client.submitAndWait(transactionBlob, {
      wallet: sourceWallet,
    });
    log(`NFT: ${JSON.stringify(tx, null, 2)}`);

    const nfts = await client.request({
      method: "account_nfts",
      account: sourceWallet.classicAddress
    });
    log(`NFTs: ${JSON.stringify(nfts, null, 2)}`);

    log("Disconnecting from XRPL...");
    await client.disconnect();

    setIsRunning(false);
    log("Finished.");
  }

  const createIpfsHash = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    return response.data.IpfsHash;
  };

  return (
    <>
      <h1 className='center'>Beeply NFT Certificate Generator with XRPL</h1>
      <div className='container'>

        <div className="container">
          <div className="left-panel">
            <h2>Achievement</h2>
            <div className="card">
              <div className="image-container">
                <label className="image-checkbox">
                  <input type="checkbox" name="nft" value="1" />
                  <img src="/assets/images/a-1.png" className="rounded" alt="Beeply NFT 1" />
                  <span className="checkbox-label"></span>
                </label>
                <label className="image-checkbox">
                  <input type="checkbox" name="nft" value="2" />
                  <img src="/assets/images/a-2.png" className="rounded" alt="Beeply NFT 2" />
                  <span className="checkbox-label"></span>
                </label>
                <label className="image-checkbox">
                  <input type="checkbox" name="nft" value="3" />
                  <img src="/assets/images/a-3.png" className="rounded" alt="Beeply NFT 3" />
                  <span className="checkbox-label"></span>
                </label>
              </div>
            </div>
            <hr />
            <h2>Badges</h2>
            <div className="card">
              <div className="image-container">
                <label className="image-checkbox">
                  <input type="checkbox" name="nft" value="1" />
                  <img src="/assets/images/b-1.png" className="rounded" alt="Beeply NFT 1" />
                  <span className="checkbox-label"></span>
                </label>
                <label className="image-checkbox">
                  <input type="checkbox" name="nft" value="2" />
                  <img src="/assets/images/b-2.png" className="rounded" alt="Beeply NFT 2" />
                  <span className="checkbox-label"></span>
                </label>
                <label className="image-checkbox">
                  <input type="checkbox" name="nft" value="3" />
                  <img src="/assets/images/b-3.png" className="rounded" alt="Beeply NFT 3" />
                  <span className="checkbox-label"></span>
                </label>
              </div>
            </div>
            <hr />
            <h2>Kudos</h2>
            <div className="card">
              <div className="image-container">
                <label className="image-checkbox">
                  <input type="checkbox" name="nft" value="1" />
                  <img src="/assets/images/k-1.png" className="rounded" alt="Beeply NFT 1" />
                  <span className="checkbox-label"></span>
                </label>
                <label className="image-checkbox">
                  <input type="checkbox" name="nft" value="2" />
                  <img src="/assets/images/k-2.png" className="rounded" alt="Beeply NFT 2" />
                  <span className="checkbox-label"></span>
                </label>
                <label className="image-checkbox">
                  <input type="checkbox" name="nft" value="3" />
                  <img src="/assets/images/k-3.png" className="rounded" alt="Beeply NFT 3" />
                  <span className="checkbox-label"></span>
                </label>
              </div>
            </div>
          </div>
          <div className="center-panel">
            <button onClick={openModal} disabled={isRunning} >
              {isRunning ? "Running..." : "Preview the Certificate"}
            </button>
          </div>
          <div className="right-panel">
            <h2>Logs</h2>
            <div className="scrollable-logs">
              <ul>
                {logs.map((log, index) => (
                  <li key={index}>
                    <pre>
                      {log}
                    </pre>
                  </li>
                ))}
                <li ref={messagesEndRef} />
              </ul>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            {/* Modal'ı kapat butonu */}
            <span className="close" onClick={closeModal}>&times;</span>
            {/* iframe ile siteyi yükle */}
            <iframe src="https://preview--merhaba-wonderful-greetings.lovable.app/" title=""></iframe>
            <div className='center'>
            <button
              onClick={run}>
              Create NFT Certificate
            </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
