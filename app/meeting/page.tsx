"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Meeting {
  id: string
  title: string
  description: string
  date: string
}

interface Feedback {
  id: string
  content: string
  type: 'good' | 'bad' | 'action'
}

export default function Meeting() {
  const supabase = createClientComponentClient()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [newFeedback, setNewFeedback] = useState({ content: '', type: 'good' })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchMeetingAndFeedbacks() {
      if (!id) {
        setIsLoading(false)
        return
      }

      try {
        const { data: meetingData, error: meetingError } = await supabase
          .from('meetings')
          .select('*')
          .eq('id', id)
          .single()

        if (meetingError) {
          console.error("Error fetching meeting:", meetingError);  // 添加错误日志
          throw meetingError
        }

        if (!meetingData) {
          console.warn("No meeting data found for id:", id);  // 添加警告日志
          setMeeting(null)
          setIsLoading(false)
          return
        }

        setMeeting(meetingData)

        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedbacks')
          .select('*')
          .eq('meeting_id', id)

        if (feedbackError) throw feedbackError

        setFeedbacks(feedbackData || [])
      } catch (error) {
        console.error('Error fetching meeting data:', error)
        // 这里你通常会向用户显示一个错误消息
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeetingAndFeedbacks()
  }, [id])

  async function handleSubmitFeedback() {
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .insert([
          { content: newFeedback.content, type: newFeedback.type, meeting_id: id },
        ])
        .select()

      if (error) throw error

      setFeedbacks([...feedbacks, data[0]])
      setNewFeedback({ content: '', type: 'good' })
    } catch (error) {
      console.error('Error submitting feedback:', error)
      // 这里你通常会向用户显示一个错误消息
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!meeting) {
    return <div>Meeting not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{meeting.title}</h1>
      <p className="mb-4">{meeting.description}</p>
      <p className="mb-8">Date: {new Date(meeting.date).toLocaleDateString()}</p>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Add Feedback</h2>
        <div className="flex gap-4 mb-4">
          <Button
            onClick={() => setNewFeedback({ ...newFeedback, type: 'good' })}
            variant={newFeedback.type === 'good' ? 'default' : 'outline'}
          >
            Good
          </Button>
          <Button
            onClick={() => setNewFeedback({ ...newFeedback, type: 'bad' })}
            variant={newFeedback.type === 'bad' ? 'default' : 'outline'}
          >
            Bad
          </Button>
          <Button
            onClick={() => setNewFeedback({ ...newFeedback, type: 'action' })}
            variant={newFeedback.type === 'action' ? 'default' : 'outline'}
          >
            Action Item
          </Button>
        </div>
        <Textarea
          value={newFeedback.content}
          onChange={(e) => setNewFeedback({ ...newFeedback, content: e.target.value })}
          placeholder="Enter your feedback"
          className="mb-4"
        />
        <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Feedbacks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id}>
              <CardHeader>
                <CardTitle>{feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{feedback.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
