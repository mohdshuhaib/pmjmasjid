import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()
  const path = url.pathname

  // Check the role once if the user is logged in to save database calls
  let isAdmin = false;
  if (user) {
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    isAdmin = userData?.role === 'admin';
  }

  // 1. IF ALREADY LOGGED IN: Prevent access to ANY login page
  if (user && (path === '/login' || path === '/admin/login')) {
    url.pathname = isAdmin ? '/admin/dashboard' : '/dashboard'
    return NextResponse.redirect(url)
  }

  // 2. PROTECT ADMIN ROUTES
  if (path.startsWith('/admin') && !path.includes('/login')) {
    if (!user) {
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    if (!isAdmin) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // 3. PROTECT MEMBER ROUTES
  if (path.startsWith('/dashboard')) {
    if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    if (isAdmin) {
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  // Ignored paths: static files, images, favicon, service worker, and PWA manifest
  matcher: ['/((?!_next/static|_next/image|favicon.ico|firebase-messaging-sw.js|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}