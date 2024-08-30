export default function Footer() {
    return (
      <footer className="bg-black text-gray-400 py-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 sm:px-6 lg:px-8 justify-between">
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">About</h2>
            <p className="mb-4">
              The NFT library is a place where one can see all their NFT's in a gallery type view and can also check details for specific NFTs
            </p>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">Quick Links</h2>
            <ul>
              <li>
                <a
                  href="/"
                  className="hover:text-white transition-colors duration-300"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="hover:text-white transition-colors duration-300"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/nfts"
                  className="hover:text-white transition-colors duration-300"
                >
                  NFTs
                </a>
              </li>
            </ul>
          </div>
          </div>
      </footer>
    )
  }
  