"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  meetingCode: z.string().length(6, {
    message: "Meeting code must be exactly 6 characters.",
  }),
})

export default function JoinMeeting() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meetingCode: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('id')
        .eq('code', values.meetingCode)
        .single()

      if (error) throw error

      if (data) {
        router.push(`/meeting/${data.id}`)
      } else {
        form.setError('meetingCode', {
          type: 'manual',
          message: 'Invalid meeting code. Please try again.',
        })
      }
    } catch (error) {
      console.error('Error joining meeting:', error)
      // Here you would typically show an error message to the user
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Join a Meeting</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="meetingCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter 6-digit meeting code" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the 6-digit code provided by the meeting organizer.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join Meeting'}
          </Button>
        </form>
      </Form>
    </div>
  )
}