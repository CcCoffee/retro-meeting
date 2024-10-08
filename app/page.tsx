import { createClient } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return redirect('/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Welcome to Retrospective Meeting App</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Meeting</CardTitle>
            <CardDescription>Start a new retrospective meeting</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Set up a new meeting with your team to reflect on your work.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/create-meeting">Create Meeting</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Join Meeting</CardTitle>
            <CardDescription>Join an existing retrospective meeting</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Enter a meeting code to join an ongoing retrospective.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/join-meeting">Join Meeting</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Meetings</CardTitle>
            <CardDescription>View your retrospective meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Access all your past and upcoming retrospective meetings.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/my-meetings">View Meetings</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}