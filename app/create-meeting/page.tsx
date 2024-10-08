"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { logSupabaseError } from '@/lib/supabase'

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  participants: z.string().optional(),
})

export default function CreateMeeting() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      participants: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data, error } = await supabase
        .from('meetings')
        .insert([
          { 
            title: values.title, 
            description: values.description, 
            date: values.date,
            user_id: user.id
          },
        ])
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error("Failed to create meeting")
      }

      const newMeeting = data[0]

      if (values.participants) {
        const participantEmails = values.participants.split(',').map(email => email.trim())
        for (const email of participantEmails) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single()

          if (userError) {
            console.error(`User not found for email: ${email}`)
            continue
          }

          const { error: participantError } = await supabase
            .from('meeting_participants')
            .insert([
              {
                meeting_id: newMeeting.id,
                user_id: userData.id
              }
            ])

          if (participantError) {
            console.error(`Error adding participant: ${email}`, participantError)
          }
        }
      }

      router.push(`/meeting?id=${newMeeting.id}`)
    } catch (error) {
      logSupabaseError(error)
      // Here you would typically show an error message to the user
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create a New Meeting</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Meeting title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Meeting description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="participants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Participants (comma-separated emails)</FormLabel>
                <FormControl>
                  <Input placeholder="email1@example.com, email2@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the email addresses of participants you want to invite, separated by commas.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Meeting'}
          </Button>
        </form>
      </Form>
    </div>
  )
}