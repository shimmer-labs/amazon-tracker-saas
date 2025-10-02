import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.text() // Get raw text first
  console.log('Raw body:', body)
  
  try {
    const json = JSON.parse(body)
    console.log('Parsed JSON:', json)
    return NextResponse.json({ received: json })
  } catch (error: any) {
    console.error('Parse error:', error.message)
    return NextResponse.json({ error: 'Failed to parse', raw: body }, { status: 400 })
  }
}