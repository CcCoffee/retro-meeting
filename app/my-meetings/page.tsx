"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface Meeting {
  id: string
  title: string
  description: string
  date: string
}

export default function MyMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .order('date', { ascending: false })

        if (error) throw error

        setMeetings(data || [])
      } catch (error) {
        console.error('Error fetching meetings:', error)
        // Here you would typically show an error message to the user
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeetings()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Meetings</h1>
      {meetings.length === 0 ? (
        <p>You don't have any meetings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardHeader>
                <CardTitle>{meeting.title}</CardTitle>
                <CardDescription>{new Date(meeting.date).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{meeting.description || 'No description provided.'}</p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href={`/meeting?id=${meeting.id}`}>View Meeting</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}