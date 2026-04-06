import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

export async function generateAvatarPrompt(
  name: string,
  organization: string,
  title: string
): Promise<string> {
  if (!apiKey) return `${name}님, ${organization}의 멋진 팀원!`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `Create a fun, friendly avatar character description for a corporate training game participant.

Participant Details:
- Name: ${name}
- Organization: ${organization}
- Title: ${title}

Generate a creative avatar description that:
1. Incorporates the person's role/title in a fun way
2. Is colorful and engaging for a corporate game setting
3. Includes a fun personality trait
4. Suggests an emoji representation
5. Is 2-3 sentences max

Format: Return only the avatar description, no additional text.`

    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Avatar generation failed:', message)
    return `${name}님, 팀 활동에 참여할 준비 완료!`
  }
}

export async function generateSpotContent(
  spotType: string,
  context: Record<string, unknown>
): Promise<Record<string, unknown>> {
  if (!apiKey) return { title: spotType, description: '활동 콘텐츠를 불러올 수 없습니다' }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `Generate content for a corporate training game activity called a "Spot".

Spot Type: ${spotType}
Context: ${JSON.stringify(context)}

Generate creative, engaging content for this spot activity that:
1. Is suitable for corporate training
2. Promotes team building and good manner
3. Is fun and interactive
4. Returns valid JSON format

Return a JSON object with appropriate fields for this spot type.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    try {
      return JSON.parse(text)
    } catch {
      return { title: spotType, description: text }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Spot content generation failed:', message)
    return { title: spotType, description: '활동 콘텐츠를 불러올 수 없습니다' }
  }
}

interface MiniGameQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export async function generateMiniGameQuestion(topic: string): Promise<MiniGameQuestion> {
  const fallback: MiniGameQuestion = {
    question: '직장 생활에서 가장 중요한 것은?',
    options: ['소통', '존중', '협업', '위의 모든 것'],
    correctAnswer: 3,
    explanation: '건강한 직장 문화를 위해 모든 요소가 중요합니다.',
  }

  if (!apiKey) return fallback

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `Generate a fun, office-themed multiple choice question for a corporate training game.

Topic: ${topic}

Return a JSON object with:
{
  "question": "the question text",
  "options": ["option 1", "option 2", "option 3", "option 4"],
  "correctAnswer": 0,
  "explanation": "brief explanation"
}

Make it fun and relevant to corporate culture.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    try {
      return JSON.parse(text)
    } catch {
      return fallback
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Game question generation failed:', message)
    return fallback
  }
}
