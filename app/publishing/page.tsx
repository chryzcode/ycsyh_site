import Image from 'next/image';

export default function PublishingPage() {
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold mb-8">Publishing</h1>
        
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <div className="mb-6">
              <Image
                src="/publishing_company_logo.jpg"
                alt="YCSYH"
                width={300}
                height={120}
                className="h-24 w-auto object-contain"
              />
            </div>
            <h2 className="text-3xl font-semibold mb-4">YOU CAN SAY YOU HEARD (YCSYH)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              YCSYH is the publishing entity for Heard Music productions. We manage mechanical and performance royalties, 
              sync licensing, catalog administration, and protect the rights of our artists and producers.
            </p>
            <p className="text-gray-700 leading-relaxed">
              When you purchase a beat from Heard Music, YCSYH becomes your co-publisher with a standard 50/50 publishing split.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4">Current Structure</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>Writer:</strong> Merrel Carlos Mark Hurd (Heard Music)</li>
              <li><strong>Publisher:</strong> YOU CAN SAY YOU HEARD (YCSYH)</li>
              <li><strong>Publishing Split:</strong> 50% Writer / 50% Publisher (standard)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              All compositions are registered with PRS when songs are released. Beats alone are not registered - 
              only completed songs that have been released.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4">License Types</h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">MP3 Lease - £45</h3>
                <ul className="text-gray-700 space-y-1 mb-3">
                  <li>• MP3 file</li>
                  <li>• Non-exclusive</li>
                  <li>• 50,000 streaming cap</li>
                  <li>• 1 commercial music video</li>
                  <li>• 50/50 publishing split</li>
                </ul>
                <p className="text-sm text-gray-600">Must credit: Produced by Heard Music</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">WAV Lease - £60</h3>
                <ul className="text-gray-700 space-y-1 mb-3">
                  <li>• WAV file</li>
                  <li>• Non-exclusive</li>
                  <li>• 100,000 streaming cap</li>
                  <li>• 2 commercial music videos</li>
                  <li>• 50/50 publishing split</li>
                </ul>
                <p className="text-sm text-gray-600">Must credit: Produced by Heard Music</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">Trackout Lease - £300</h3>
                <ul className="text-gray-700 space-y-1 mb-3">
                  <li>• Full tracked-out stems</li>
                  <li>• Non-exclusive</li>
                  <li>• Unlimited streams</li>
                  <li>• Unlimited music videos</li>
                  <li>• Radio + live performances</li>
                  <li>• 50/50 publishing split</li>
                </ul>
                <p className="text-sm text-gray-600">Must credit: Produced by Heard Music</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">Exclusive License - Contact for Price</h3>
                <ul className="text-gray-700 space-y-1 mb-3">
                  <li>• Exclusive usage rights</li>
                  <li>• Unlimited streams</li>
                  <li>• Unlimited videos</li>
                  <li>• Sync rights allowed</li>
                  <li>• Beat removed from store</li>
                  <li>• Buyer owns 100% master</li>
                  <li>• 50/50 publishing split</li>
                </ul>
                <p className="text-sm text-gray-600">Must credit: Produced by Heard Music</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4">Registration Workflow</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Songs are only registered with PRS when they are <strong>released</strong>. Beats alone are not registered.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              When an artist releases a song using a Heard Music beat:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>The composition is registered with PRS</li>
              <li>Merrel Carlos Mark Hurd (Heard Music) is listed as Writer</li>
              <li>YOU CAN SAY YOU HEARD (YCSYH) is listed as Publisher</li>
              <li>Standard 50/50 publishing split is applied</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4">Contact</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For publishing inquiries, exclusive licenses, or custom production:
            </p>
            <p className="text-gray-700">
              <a href="mailto:heardmusicproductions@gmail.com" className="text-black hover:underline font-medium">
                heardmusicproductions@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
