export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/80 backdrop-blur-xl py-12">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-bold text-white mb-4">Product</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-blue-400">Features</a></li>
                        <li><a href="#" className="hover:text-blue-400">Integrations</a></li>
                        <li><a href="#" className="hover:text-blue-400">Pricing</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-white mb-4">Resources</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-blue-400">Documentation</a></li>
                        <li><a href="#" className="hover:text-blue-400">API Reference</a></li>
                        <li><a href="#" className="hover:text-blue-400">Blog</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-white mb-4">Company</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-blue-400">About</a></li>
                        <li><a href="#" className="hover:text-blue-400">Careers</a></li>
                        <li><a href="#" className="hover:text-blue-400">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-white mb-4">Legal</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-blue-400">Privacy</a></li>
                        <li><a href="#" className="hover:text-blue-400">Terms</a></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
                © 2026 ChanceTEK Inc. All rights reserved.
            </div>
        </footer>
    )
}
