"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Session } from '@supabase/supabase-js';

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session as Session | null);
      setLoading(false);

      if (!session) {
        router.push('/signin');
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session as Session | null);
      if (!session) {
        router.push('/signin');
      }
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null; // 或者显示一个加载指示器
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
  );
}