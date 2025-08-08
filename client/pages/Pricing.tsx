import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Star,
  Users,
  Calendar,
  Trophy,
  Sparkles,
  Crown,
} from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for small golf trips with friends",
      icon: Users,
      features: [
        "Up to 4 players per trip",
        "1 active trip at a time",
        "Basic themes",
        "Score tracking",
        "Mobile app access",
        "Email support",
      ],
      limitations: ["Limited customization", "TrackTrack branding"],
      cta: "Start Free",
      popular: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "per trip",
      description: "For serious golfers who want the full experience",
      icon: Trophy,
      features: [
        "Up to 16 players per trip",
        "Unlimited active trips",
        "All premium themes",
        "AI trip planning",
        "Custom branding",
        "Private clubhouse",
        "Advanced scoring formats",
        "Photo & video sharing",
        "Priority support",
      ],
      limitations: [],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For golf organizations and large groups",
      icon: Crown,
      features: [
        "Unlimited players",
        "Multiple organizations",
        "White-label solution",
        "Custom integrations",
        "Dedicated support",
        "Advanced analytics",
        "API access",
        "Custom themes",
        "Training & onboarding",
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "How does the pricing work?",
      answer:
        "Our Pro plan is pay-per-trip, so you only pay when you're actively planning and running a golf trip. The Starter plan is completely free forever.",
    },
    {
      question: "Can I upgrade or downgrade anytime?",
      answer:
        "Yes! You can upgrade to Pro for any trip, and there's no commitment. Each trip can use a different plan level based on your needs.",
    },
    {
      question: "What happens after my trip ends?",
      answer:
        "Your trip website and data remain accessible for viewing and memories. You're only charged the Pro fee when actively planning and running a trip.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes, we offer a 30-day money-back guarantee for Pro trips. If you're not satisfied, we'll refund your payment.",
    },
    {
      question: "Is there a setup fee?",
      answer:
        "No setup fees ever. You only pay the trip fee when you upgrade to Pro features.",
    },
    {
      question: "Can I try Pro features before paying?",
      answer:
        "Absolutely! Every Pro trip comes with a 7-day free trial so you can experience all features before committing.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              TrackTrack
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Back to Home
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-emerald-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple, Transparent
            <span className="text-emerald-600 block">Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Start free and only pay when you need advanced features. No monthly
            subscriptions, no hidden fees - just simple per-trip pricing.
          </p>
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>7-day free trial on all Pro features</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <Card
                  key={index}
                  className={`relative border-2 hover:shadow-lg transition-all duration-300 ${
                    plan.popular
                      ? "border-emerald-600 shadow-lg scale-105"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <CardHeader className="text-center pb-6">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 mx-auto ${
                        plan.popular
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl text-gray-900 mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-gray-600 ml-2">
                          /{plan.period}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center space-x-3"
                        >
                          <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {plan.limitations.map((limitation, limitationIndex) => (
                        <div
                          key={limitationIndex}
                          className="flex items-center space-x-3 opacity-60"
                        >
                          <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                          <span className="text-gray-600 text-sm">
                            {limitation}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className={`w-full py-3 ${
                        plan.popular
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                      }`}
                      asChild
                    >
                      <Link to="/signup">
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Compare Plans
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what's included with each plan and choose the one that's right
              for your golf trips.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      Starter
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      Pro
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Players per trip
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Up to 4
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Up to 16
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Active trips
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      1
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Unlimited
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      AI trip planning
                    </td>
                    <td className="px-6 py-4 text-center">❌</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Custom branding
                    </td>
                    <td className="px-6 py-4 text-center">❌</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Private clubhouse
                    </td>
                    <td className="px-6 py-4 text-center">❌</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      API access
                    </td>
                    <td className="px-6 py-4 text-center">❌</td>
                    <td className="px-6 py-4 text-center">❌</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing and plans.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Planning?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of golfers who are already creating unforgettable
            experiences. Start free and upgrade when you're ready.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold bg-white text-emerald-600 hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Free Today <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
