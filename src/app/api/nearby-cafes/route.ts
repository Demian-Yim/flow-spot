import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy for Kakao Local API — searches nearby cafes/restaurants.
 * Requires KAKAO_REST_API_KEY env var.
 * GET /api/nearby-cafes?lat=37.5&lng=127.0&radius=500&query=카페
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.KAKAO_REST_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'KAKAO_REST_API_KEY not configured', cafes: [] },
      { status: 200 }
    )
  }

  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius') || '1000'
  const keyword = searchParams.get('query') || '카페'

  if (!lat || !lng) {
    return NextResponse.json(
      { success: false, error: 'lat and lng are required', cafes: [] },
      { status: 400 }
    )
  }

  try {
    const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json')
    url.searchParams.set('query', keyword)
    url.searchParams.set('y', lat)
    url.searchParams.set('x', lng)
    url.searchParams.set('radius', radius)
    url.searchParams.set('sort', 'distance')
    url.searchParams.set('size', '15')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `KakaoAK ${apiKey}` },
    })

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Kakao API error: ${res.status}`, cafes: [] },
        { status: 200 }
      )
    }

    const data = await res.json()
    const cafes = (data.documents || []).map((d: any) => ({
      id: d.id,
      name: d.place_name,
      category: d.category_name,
      address: d.road_address_name || d.address_name,
      distance: `${d.distance}m`,
      phone: d.phone,
      url: d.place_url,
    }))

    return NextResponse.json({ success: true, cafes })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { success: false, error: message, cafes: [] },
      { status: 500 }
    )
  }
}
