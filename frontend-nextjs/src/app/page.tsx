import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Users, Vote, BarChart3, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-secondary-900 dark:to-secondary-800">
      {/* Header */}
      <header className="border-b border-secondary-200 dark:border-secondary-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
              Voting System
            </h1>
          </div>
          <div className="flex space-x-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            Secure • Transparent • Reliable
          </Badge>
          <h1 className="text-5xl font-bold text-secondary-900 dark:text-white mb-6">
            Modern Digital Voting
            <span className="text-primary-600"> Platform</span>
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-300 mb-8 max-w-2xl mx-auto">
            Experience the future of democratic voting with our secure, transparent, and user-friendly platform. 
            Built with cutting-edge technology for maximum reliability.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start Voting
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <CardTitle>Secure & Transparent</CardTitle>
              <CardDescription>
                End-to-end encryption and blockchain-like transparency ensure your vote is secure and verifiable.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <CardTitle>Easy to Use</CardTitle>
              <CardDescription>
                Intuitive interface designed for all users, from first-time voters to experienced administrators.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary-600" />
              </div>
              <CardTitle>Real-time Results</CardTitle>
              <CardDescription>
                Live updates and comprehensive analytics provide instant insights into election progress.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary-600 text-white">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Vote?</h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of users who trust our platform for secure digital voting.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-secondary-200 dark:border-secondary-700 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-secondary-600 dark:text-secondary-300">
            © 2024 Voting System. Built with Next.js and NestJS.
          </p>
        </div>
      </footer>
    </div>
  )
} 