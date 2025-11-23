import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Image
              src="/publishing_company_logo.jpg"
              alt="YCSYH"
              width={150}
              height={50}
              className="h-12 w-auto object-contain mb-4"
            />
            <p className="text-gray-400 text-sm">
              Premium beats for artists worldwide.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/beats" className="hover:text-white">
                  Beat Store
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="/publishing" className="hover:text-white">
                  Publishing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm text-gray-400">
              For inquiries and licensing:
              <br />
              <a href="mailto:heardmusicproductions@gmail.com" className="hover:text-white">
                heardmusicproductions@gmail.com
              </a>
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} YCSYH Publishing. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

