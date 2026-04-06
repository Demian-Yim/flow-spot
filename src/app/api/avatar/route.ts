import { NextRequest, NextResponse } from 'next/server'
import { generateAvatarPrompt } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, organization, title } = body

    if (!name || !organization || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: name, organization, title' },
        { status: 400 }
      )
    }

    const avatarDescription = await generateAvatarPrompt(name, organization, title)

    return NextResponse.json({
      success: true,
      description: avatarDescription,
      name,
      organization,
      title,
    })
  } catch (error) {
    console.error('Avatar generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate avatar',
        description: 'A friendly team player ready to go!',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  )
}
