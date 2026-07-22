import { Check } from "lucide-react";

const plans = [
  {
    name: 'Free',
    price: '$0/month',
    features: ['50 conversations/month', '10 image generations', 'Basic AI chatbot', 'Community support'],
    badge: null,
    popular: false,
  },
  {
    name: 'Starter',
    price: '$99/month',
    features: ['1,000 conversations/month', '50 image generations', 'DALL-E integration', 'Standard support', 'AI voice messages'],
    badge: 'Monthly',
    popular: false,
  },
  {
    name: 'Growth',
    price: '$299/month',
    features: ['5,000 conversations/month', '300+ image generations', '10 video generations', 'Priority support', 'API access', 'Advanced customization'],
    badge: 'Monthly',
    popular: true,
  },
];

export default function PricingSection() {
  return (
    <section className="w-full" id="pricing">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <h2 className="text-center text-3xl sm:text-4xl font-bold gradient-text mb-4 tracking-tight">
          Choose Your Plan
        </h2>
        <p className="text-center text-text-muted mb-14 max-w-xl mx-auto">
          Start free and upgrade as you go. Unlock the full power of AI companionship.
        </p>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card-glow rounded-2xl overflow-hidden ${!plan.popular ? 'card-glow bg-bg-card' : 'bg-gradient-to-b from-[#2a1a4e] to-bg-card border border-magenta-primary/30'}`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-purple-primary to-magenta-primary py-1.5 text-center">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">Most Popular</span>
                </div>
              )}

              <div className={`p-6 sm:p-8 flex flex-col gap-5 ${plan.popular ? '' : 'bg-card-subtle'}`}>
                {/* Plan name + price */}
                <div className="text-center pb-2">
                  {plan.badge && (
                    <span className="inline-block text-xs font-semibold text-purple-light bg-[rgba(147,51,234,0.15)] px-3 py-1 rounded-full mb-3">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-text-primary mb-1">{plan.name}</h3>
                  <p className="text-4xl font-extrabold gradient-text">
                    {plan.price.includes('$') ? (
                      <span>{plan.price.split('/month')[0]}</span>
                    ) : (
                      <span>$0</span>
                    )}
                    <span className="text-lg text-text-muted font-medium ml-1">/{plan.price.split('/')[1]}</span>
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-purple-primary/30 to-transparent" />

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                      <Check size={16} className="text-magenta-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.popular ? (
                  <a
                    href="/auth/signup"
                    className="btn-gradient text-white font-bold py-3 rounded-full text-center w-full mt-auto tracking-wide"
                  >
                    Get Started
                  </a>
                ) : plan.price === '$0/month' ? (
                  <a
                    href="/auth/signup"
                    className="btn-outline text-text-primary font-semibold py-3 rounded-full text-center w-full mt-auto text-sm hover:text-magenta-light border-purple-primary/40 hover:border-magenta-primary/60"
                  >
                    Start Free
                  </a>
                ) : (
                  <a
                    href="/auth/signup"
                    className="btn-gradient text-white font-bold py-3 rounded-full text-center w-full mt-auto tracking-wide"
                  >
                    Get Started
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
