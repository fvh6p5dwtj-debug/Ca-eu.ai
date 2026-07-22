'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { characters } from '@/lib/characters';
import { MessageSquare, ImageIcon, Video, Crown, ArrowRight, Sparkles, Zap } from 'lucide-react';

interface User {
  name: string;
  email: string;
  plan: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const userName = user?.name || 'Guest';

  const stats = [
    { label: 'Chats Started', value: 0, icon: MessageSquare, color: 'from-purple-500 to-violet-500' },
    { label: 'Images Generated', value: 0, icon: ImageIcon, color: 'from-fuchsia-500 to-pink-500' },
    { label: 'Videos Created', value: 0, icon: Video, color: 'from-cyan-500 to-blue-500' },
  ];

  const quickActions = [
    { title: 'Start New Chat', desc: 'Begin a conversation with an AI companion', href: '/', icon: MessageSquare, color: 'from-purple-500 to-violet-500' },
    { title: 'Generate Image', desc: 'Create AI-powered images in chat', href: '/chat/sophia', icon: ImageIcon, color: 'from-fuchsia-500 to-pink-500' },
    { title: 'Create Video', desc: 'Turn your ideas into stunning videos', href: '/video', icon: Video, color: 'from-cyan-500 to-blue-500' },
    { title: 'Upgrade Plan', desc: 'Unlock premium features and more', href: '/#pricing', icon: Crown, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-purple-500/8 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[250px] h-[250px] rounded-full bg-fuchsia-500/6 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
                <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Welcome back, {userName}
                </span>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                {user ? 'Here\'s what\'s happening with your account.' : 'Sign in to track your activity and continue conversations.'}
              </p>
            </div>
            {!user && (
              <Link
                href="/auth/signup"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-semibold text-sm hover:from-purple-400 hover:to-fuchsia-400 transition-all shadow-lg shadow-purple-500/20"
              >
                <Sparkles size={16} />
                Get Started
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="card-glow rounded-2xl p-6 bg-[#120a24] border border-purple-500/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 rounded-2xl" />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20 flex items-center justify-center mb-4 border border-purple-500/20`}>
                  <stat.icon size={22} className="text-white" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
              <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-[40px] ${stat.color.split(' ')[0].replace('from-', 'bg-')}/15`} />
            </div>
          ))}
        </div>
      </section>

      {/* Recent Chats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <h2 className="text-xl font-bold mb-5">
          <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Recent Chats
          </span>
        </h2>
        <div className="space-y-3">
          {characters.slice(0, 6).map((char) => (
            <Link
              key={char.id}
              href={`/chat/${char.id}`}
              className="flex items-center justify-between p-4 rounded-xl bg-[#120a24] border border-purple-500/20 hover:border-purple-500/40 transition-all group card-glow"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${char.gradient} flex items-center justify-center text-lg shrink-0`}>
                  {char.emoji}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{char.name}</p>
                  <p className="text-gray-400 text-xs">{char.specialty}</p>
                </div>
              </div>
              <span className="text-purple-400 text-sm font-medium flex items-center gap-1 group-hover:text-fuchsia-400 transition-colors">
                Continue Chat
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="text-xl font-bold mb-5">
          <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Quick Actions
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="card-glow rounded-2xl p-6 bg-[#120a24] border border-purple-500/20 relative overflow-hidden group hover:border-purple-500/40 transition-all"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 rounded-2xl" />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 border border-purple-500/20`}>
                  <action.icon size={22} className="text-white" />
                </div>
                <h3 className="text-white font-bold text-sm mb-1">{action.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{action.desc}</p>
              </div>
              <div className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-[40px] ${action.color.split(' ')[0].replace('from-', 'bg-')}/10`} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
