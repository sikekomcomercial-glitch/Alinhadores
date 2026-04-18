import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isDemoSession = request.cookies.get('next-auth.demo-session')?.value

  const { pathname } = request.nextUrl
  const isAuthRoute = pathname === '/'

  // Proteção de rotas do sistema (Bloqueia se não for user real NEM demo)
  if (!user && !isDemoSession && !isAuthRoute && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Se já tem sessão (real ou demo), tira da tela de login
  if ((user || isDemoSession) && isAuthRoute) {
    const role = request.cookies.get('next-auth.role')?.value || 'dentist'
    return NextResponse.redirect(new URL(role === 'patient' ? '/paciente' : '/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
