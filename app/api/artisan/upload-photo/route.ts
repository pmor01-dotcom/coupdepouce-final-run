import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const fileName = req.headers.get('x-file-name')
    const file = await req.blob()

    if (!fileName || !file) {
      return NextResponse.json({ error: 'Missing file name or file' }, { status: 400 })
    }

    const { data, error } = await supabase.storage
      .from('artisan_photos')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      path: data.path 
    })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
