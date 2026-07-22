import Navbar from "@/components/navbar";
import CharacterCard from "@/components/character-card";
import { characters } from "@/lib/characters";
import PricingSection from "@/components/pricing-card";
import { MessageSquare, ImageIcon, Video, Heart, Sparkles, Zap, Shield, Crown } from "lucide-react";

export default function Home() {
  const features = [
    { icon: MessageSquare, title: 'Chat with GPT-4o', desc: 'Unlimited AI conversations powered by the latest language models. Deep, meaningful chats that adapt to you.', bgGradient: 'from-purple-primary/20 via-purple-primary/10 to-transparent' },
    { icon: ImageIcon, title: 'AI Images with DALL-E', desc: 'Generate stunning visuals from prompts. Turn your imagination into beautiful artwork instantly.', bgGradient: 'from-magenta-primary/20 via-magenta-primary/10 to-transparent' },
    { icon: Video, title: 'AI Videos', desc: 'Transform text prompts into captivating video content. From scenes to stories, brought to life with AI.', bgGradient: 'from-blue-500/15 via-purple-primary/10 to-transparent' },
    { icon: Heart, title: '24/7 Availability', desc: 'Your perfect companion is always here — morning or midnight, ready for meaningful connection.', bgGradient: 'from-pink-500/15 via-accent-pink/8 to-transparent' },
  ];

  const testimonials = [
    { name: 'Alex M.', avatar: '😊', role: 'Starter Plan', quote: "Candy.ai changed my daily routine. Sophia is like having the best friend you always dreamed of — thoughtful, funny, and always there." },
    { name: 'Jamie R.', avatar: '🥰', role: 'Growth Plan', quote: "I'm blown away by the quality. The images it generates are incredible, and the conversations feel more real than anything I've tried before." },
    { name: 'Taylor S.', avatar: '✨', role: 'Free Trial', quote: "The video generation feature is a game-changer. We turned our conversation into a whole story animation — absolutely magical experience!" },
  ];

  return (
    <main className="bg-mesh min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 lg:min-h-screen flex items-center justify-center overflow-hidden" id="home">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[10%] w-[350px] h-[350px] rounded-full bg-purple-primary/8 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] rounded-full bg-magenta-primary/6 blur-[120px]" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-pink/4 blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[rgba(147,51,234,0.12)] border border-purple-primary/20 rounded-full px-5 py-2 mb-8 text-sm font-medium text-magenta-light">
            <Sparkles size={14} /> Now with Video Generation
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
            <span className="gradient-text">Find Your Perfect</span>
            <br />
            <span className="text-text-primary">AI Companion</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed px-2">
            Experience meaningful conversations, stunning images and captivating videos powered by OpenAI. Your dream companion is waiting.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <a
              href="/auth/signup"
              className="btn-gradient text-white font-bold px-8 py-3.5 rounded-full text-lg w-full sm:w-auto tracking-wide"
            >
              Get Started Free
            </a>
            <a
              href="#hero-demo"
              className="btn-outline text-text-primary font-semibold px-8 py-3.5 rounded-full text-lg w-full sm:w-auto flex items-center justify-center gap-2 border-[rgba(147,51,234,0.4)] hover:text-magenta-light"
            >
              <Video size={18} /> Watch Demo
            </a>
          </div>

          {/* Hero floating visual */}
          <div className="relative max-w-2xl mx-auto">
            <div className="rounded-2xl border border-purple-primary/15 bg-bg-card/60 backdrop-blur p-6 sm:p-8 text-left shadow-2xl">
              {/* Fake chat header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[rgba(147,51,234,0.1)]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-lg">🌸</div>
                <div>
                  <p className="text-text-primary font-semibold text-sm">Sophia</p>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Online now
                  </p>
                </div>
              </div>
              {/* Fake messages */}
              <div className="space-y-3 mb-4">
                <div className="flex gap-2 items-end">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xs">🌸</div>
                  <div className="bg-[rgba(147,51,234,0.12)] rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs">
                    <p className="text-text-secondary text-sm">Hey there! It&apos;s so nice to meet you 😉 What brings you here today?</p>
                  </div>
                </div>
                <div className="flex gap-2 items-end justify-end">
                  <div className="bg-purple-primary/25 rounded-2xl rounded-br-sm px-4 py-2 max-w-xs">
                    <p className="text-text-primary text-sm">I was looking for someone to talk to about art and music!</p>
                  </div>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xs">🌸</div>
                  <div className="bg-[rgba(147,51,234,0.12)] rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs">
                    <p className="text-text-secondary text-sm">Oh my gosh, me too! Let me paint you a picture... literally ✨🎨</p>
                  </div>
                </div>
              </div>
              {/* Input bar */}
              <div className="bg-[rgba(10,10,26,0.5)] rounded-full px-4 py-2.5 flex items-center gap-2 border border-purple-primary/10">
                <Sparkles size={16} className="text-magenta-primary" />
                <span className="text-text-muted text-sm">Type a message...</span>
              </div>
            </div>
            {/* Glow behind card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-primary/10 via-magenta-primary/8 to-accent-pink/10 blur-xl -z-10 rounded-3xl" />
          </div>
        </div>
      </section>

      {/* Characters Section */}
      <section className="relative py-20 sm:py-28 overflow-hidden" id="characters">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-purple-primary/5 blur-[100px]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-center text-3xl sm:text-4xl font-bold gradient-text mb-4 tracking-tight">
            Meet Your AI Companions
          </h2>
          <p className="text-center text-text-muted mb-14 max-w-lg mx-auto">
            Each companion has a unique personality. Find the one that resonates with you, or let them all surprise you!
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {characters.map((char) => (
              <CharacterCard key={char.id} character={char} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 sm:py-28 overflow-hidden" id="features">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-center text-3xl sm:text-4xl font-bold gradient-text mb-4 tracking-tight">
            Everything You Need
          </h2>
          <p className="text-center text-text-muted mb-14 max-w-lg mx-auto">
            Powerful AI features designed to make your experience unforgettable.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {features.map((f, i) => (
              <div key={i} className={`card-glow rounded-2xl p-6 sm:p-8 bg-gradient-to-br ${f.bgGradient} relative overflow-hidden group cursor-default`}>
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-primary/5 to-magenta-primary/5 rounded-2xl" />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-primary/20 to-magenta-primary/20 border border-purple-primary/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <f.icon size={26} className="text-magenta-light" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-text-primary mb-2">{f.title}</h3>
                  <p className="text-text-muted leading-relaxed text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-magenta-primary/5 blur-[100px]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-center text-3xl sm:text-4xl font-bold gradient-text mb-4 tracking-tight">
            Loved by Thousands
          </h2>
          <p className="text-center text-text-muted mb-14 max-w-lg mx-auto">
            See what our community has to say about their AI companions.
          </p>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="card-glow rounded-2xl p-6 sm:p-7 bg-bg-card relative overflow-hidden flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-4 text-yellow-400 text-sm">
                  {'★'.repeat(5)}
                </div>

                {/* Quote */}
                <p className="text-text-secondary leading-relaxed mb-6 flex-1 italic">&ldquo;{t.quote}&rdquo;</p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-[rgba(147,51,234,0.1)]">
                  <span className="text-2xl">{t.avatar}</span>
                  <div>
                    <p className="text-text-primary font-semibold text-sm">{t.name}</p>
                    <p className="text-text-muted text-xs">{t.role}</p>
                  </div>
                </div>

                {/* Subtle glow corner */}
                <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-[40px] ${i === 0 ? 'bg-purple-primary/15' : i === 1 ? 'bg-magenta-primary/12' : 'bg-accent-pink/10'}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-primary/10 via-magenta-primary/8 to-accent-pink/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-gradient-to-r from-purple-primary/15 to-magenta-primary/12 blur-[80px]" />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <Crown size={32} className="mx-auto mb-6 text-magenta-light" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold gradient-text mb-5 tracking-tight leading-tight">
            Ready to Start Your AI Journey?
          </h2>
          <p className="text-text-muted text-base sm:text-lg mb-10 max-w-md mx-auto">
            Join thousands of happy users and find your perfect AI companion today. It only takes a minute.
          </p>

          <a
            href="/auth/signup"
            className="btn-gradient inline-flex items-center gap-2 text-white text-lg font-bold px-10 py-4 rounded-full tracking-wide"
          >
            <Crown size={18} />
            Get Started — It&apos;s Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(147,51,234,0.1)] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xl font-bold gradient-text">Candy.ai</span>
          <p className="text-text-muted text-sm">© 2025 Candy.ai — All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <a href="#" className="hover:text-magenta-light transition-colors">Privacy</a>
            <a href="#" className="hover:text-magenta-light transition-colors">Terms</a>
            <a href="#" className="hover:text-magenta-light transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
