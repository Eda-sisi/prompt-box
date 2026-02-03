import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // ✨ 核心修复：Next.js 15+ 要求 cookies() 必须 await
    const cookieStore = await cookies()

    // 1. 验证权限：需要使用 Service Role Key 才能彻底删除用户
    // 请确保你的 .env.local 文件里配置了 SUPABASE_SERVICE_ROLE_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // 2. 创建拥有超级权限的 Supabase 客户端
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // API 路由中有时不需要设置 cookie，忽略错误
            }
          },
        },
      }
    )

    // 3. 解析请求数据
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // 4. 执行删除操作 (使用 auth.admin.deleteUser)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // 5. 可选：顺便删除 profiles 表里的关联数据（如果未设置级联删除）
    // await supabaseAdmin.from('profiles').delete().eq('id', userId)

    return NextResponse.json({ message: 'User deleted successfully' })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}