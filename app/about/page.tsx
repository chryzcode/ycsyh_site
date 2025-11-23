import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold mb-8">About</h1>
        
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4">The Producer</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Merrel Carlos Mark Hurd</strong>, known professionally as <strong>Heard Music</strong>, 
              is a producer creating beats across multiple genres including Drill, UK Rap, Jersey Club, Cinematic, 
              Trap, R&B, and Hip-Hop.
            </p>
            <p className="text-gray-700 leading-relaxed">
              With a focus on quality production and professional service, Heard Music provides artists worldwide 
              with premium beats that inspire creativity and elevate their music.
            </p>
          </section>

          <section className="mb-12">
            <div className="mb-6">
              <Image
                src="/publishing_company_logo.jpg"
                alt="YCSYH"
                width={250}
                height={100}
                className="h-20 w-auto object-contain"
              />
            </div>
            <h2 className="text-3xl font-semibold mb-4">YOU CAN SAY YOU HEARD (YCSYH)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              YCSYH is the publishing company for Heard Music productions. We handle mechanical and performance 
              royalties, sync licensing, catalog administration, and protect the rights of our artists and producers.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Current Structure:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Writer: Merrel Carlos Mark Hurd (Heard Music)</li>
              <li>Publisher: YOU CAN SAY YOU HEARD (YCSYH)</li>
              <li>Standard Publishing Split: 50% Writer / 50% Publisher</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              When you sign with YCSYH, we become your co-publisher and handle all the administrative work 
              including PRS registration, royalty collection, sync licensing, and catalog protection.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              To provide artists worldwide with premium quality beats that inspire creativity and elevate their music. 
              We believe in fair licensing, instant delivery, and building lasting relationships with artists. 
              Every purchase includes automatic license agreements and immediate file delivery.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
