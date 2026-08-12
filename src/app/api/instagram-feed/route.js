// Route Handler — proxies the Instagram Graph API so the long-lived
// access token stays server-side and is never shipped to the browser.
export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  const userId = process.env.INSTAGRAM_USER_ID

  if (!token || !userId) {
    return Response.json({ configured: false, posts: [] })
  }

  try {
    const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp'
    const url = `https://graph.instagram.com/v21.0/${userId}/media?fields=${fields}&access_token=${token}&limit=8`
    const igRes = await fetch(url)
    const data = await igRes.json()

    if (!igRes.ok) {
      return Response.json({ configured: true, posts: [], error: data?.error?.message || 'Instagram API error' })
    }

    const posts = (data.data || []).map((p) => ({
      id: p.id,
      caption: p.caption || '',
      mediaType: p.media_type,
      imageUrl: p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url,
      permalink: p.permalink,
      timestamp: p.timestamp,
    }))

    // Cache at the edge for an hour — Instagram content doesn't need to be real-time
    // and this keeps us well under Graph API rate limits.
    return Response.json(
      { configured: true, posts },
      { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } }
    )
  } catch (err) {
    return Response.json({ configured: true, posts: [], error: err.message })
  }
}
