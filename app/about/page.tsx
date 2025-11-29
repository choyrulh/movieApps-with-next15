// pages/about.js or app/about/page.js (depending on your Next.js version)
import Head from 'next/head'
import Image from 'next/image'

export default function About() {
  return (
    <>
      <Head>
        <title>About | Filmmaker Portfolio</title>
        <meta name="description" content="Learn more about my filmmaking journey and creative process" />
      </Head>

      <div className="min-h-screen text-white">

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              About Me
            </h1>
            <p className="text-xl text-gray-300 mb-12">
              to my portofolio
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Profile Image */}
              {/* <div className="relative">
                <div className="w-80 h-80 mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full blur-xl opacity-30"></div>
                  <Image
                    src="/profile.jpg" // Replace with your profile image
                    alt="Filmmaker Profile"
                    width={320}
                    height={320}
                    className="rounded-full object-cover relative z-10"
                  />
                </div>
              </div> */}

              {/* Bio */}
              <div>
                <h2 className="text-3xl font-bold mb-6">Siapa saya?</h2>
                <div className="space-y-4 text-gray-300">
  <p>
    Saya adalah seorang pengembang web yang sedang membangun portofolio pribadi menggunakan 
    <span className="text-white font-semibold"> TMDB API</span>, <span className="text-white font-semibold">Next.js</span>, dan <span className="text-white font-semibold">TailwindCSS</span> 
     sebagai bagian dari perjalanan saya mencari peluang kerja di industri teknologi.
  </p>
  <p>
    Proyek ini saya rancang untuk menampilkan kemampuan saya dalam membangun aplikasi berbasis React, 
    pengelolaan data API eksternal, dan desain antarmuka pengguna yang responsif serta modern. 
    Melalui portofolio ini, saya ingin menunjukkan tidak hanya keterampilan teknis, tetapi juga pendekatan 
    saya dalam membangun aplikasi yang fungsional, efisien, dan mudah digunakan.
  </p>
  <p>
    Portofolio ini mencerminkan dedikasi saya terhadap pembelajaran berkelanjutan dan kecintaan saya terhadap 
    teknologi. Saya percaya bahwa kombinasi antara kemampuan teknis, rasa ingin tahu, dan kerja keras adalah 
    kunci untuk memberikan solusi yang bermakna dan berdampak di dunia digital.
  </p>
  <p>
    Terima kasih telah mengunjungi portofolio saya — saya sangat terbuka untuk peluang kerja, kolaborasi, 
    atau sekadar berdiskusi seputar pengembangan web dan teknologi.
  </p>
</div>

              </div>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        {/* <section className="py-20 px-6 bg-gray-800/50">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-16">My Creative Philosophy</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gray-900/50 rounded-lg">
                <div className="w-12 h-12 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🎬</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Authentic Storytelling</h3>
                <p className="text-gray-400">
                  Creating genuine narratives that reflect real human experiences and emotions.
                </p>
              </div>
              <div className="text-center p-6 bg-gray-900/50 rounded-lg">
                <div className="w-12 h-12 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">👁️</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Visual Poetry</h3>
                <p className="text-gray-400">
                  Crafting each frame with intention, using light, composition, and movement to enhance the narrative.
                </p>
              </div>
              <div className="text-center p-6 bg-gray-900/50 rounded-lg">
                <div className="w-12 h-12 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Collaborative Spirit</h3>
                <p className="text-gray-400">
                  Believing that the best films are born from diverse perspectives and shared creative vision.
                </p>
              </div>
            </div>
          </div>
        </section> */}

      </div>
    </>
  )
}