export default function Footer() {
  return (
    <footer className="py-20 px-6 max-w-7xl mx-auto border-t border-border">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary text-white w-8 h-8 flex items-center justify-center font-bold text-lg rounded-lg shadow-lg">X</div>
            <span className="font-bold text-xl tracking-tighter">TrustFundX</span>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">
            The definitive infrastructure for decentralized grant management. Built for transparency, governed by community.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-text-primary">Social</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <a 
                  href="https://github.com/vjlive/trustfundx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Github
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-8 border-t border-border flex justify-between items-center text-xs font-bold text-text-secondary tracking-widest uppercase">
        <span>© 2026 TrustFundX Autonomous Protocol</span>
        <span>DEPLOYED ON ALGORAND TESTNET</span>
      </div>
    </footer>
  );
}
