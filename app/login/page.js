'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// --- 图标组件 ---
const Icon = {
  Mail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  Lock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Loader: <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false) // 默认为登录
  const [errorMsg, setErrorMsg] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  // 错误信息翻译
  const translateError = (msg) => {
    if (!msg) return ''
    if (msg.includes('Invalid login credentials')) return '账号或密码错误'
    if (msg.includes('User already registered')) return '该邮箱已被注册，请直接登录'
    if (msg.includes('Password should be')) return '密码长度太短 (至少6位)'
    if (msg.includes('rate limit')) return '操作太频繁，请稍后再试'
    return msg
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    let error
    if (isSignUp) {
      // 注册逻辑
      const res = await supabase.auth.signUp({ email, password })
      error = res.error
      if (!error) {
        alert('注册成功！正在自动登录...')
        setIsSignUp(false) // 注册完切回登录界面
      }
    } else {
      // 登录逻辑
      const res = await supabase.auth.signInWithPassword({ email, password })
      error = res.error
      if (!error) {
        router.push('/') 
        router.refresh()
        return // 成功后直接跳转，不执行后面的setLoading(false)以免闪烁
      }
    }

    if (error) {
      setErrorMsg(translateError(error.message))
    }
    setLoading(false)
  }

  return (
    <div style={{
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', // 微波点背景
      backgroundSize: '24px 24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      
      {/* 登录卡片 */}
      <div style={{
        width: '400px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        
        {/* Logo 区域 */}
        <div style={{padding: '40px 40px 20px 40px', textAlign: 'center'}}>
          <div style={{
            width: '48px', height: '48px', margin: '0 auto 20px auto',
            backgroundColor: '#2563eb', color: 'white', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(37,99,235,0.3)'
          }}>P</div>
          <h1 style={{fontSize: '22px', fontWeight: 'bold', color: '#111827', marginBottom: '8px'}}>PromptBox</h1>
          <p style={{fontSize: '14px', color: '#6b7280'}}>高效的提示词管理与协作平台</p>
        </div>

        {/* 顶部切换 Tab */}
        <div style={{display: 'flex', borderBottom: '1px solid #f3f4f6', padding: '0 40px'}}>
          <button 
            onClick={() => { setIsSignUp(false); setErrorMsg('') }} 
            style={{
              flex: 1, padding: '12px', background: 'none', border: 'none',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              color: !isSignUp ? '#2563eb' : '#9ca3af',
              borderBottom: !isSignUp ? '2px solid #2563eb' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >登录</button>
          <button 
            onClick={() => { setIsSignUp(true); setErrorMsg('') }} 
            style={{
              flex: 1, padding: '12px', background: 'none', border: 'none',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              color: isSignUp ? '#2563eb' : '#9ca3af',
              borderBottom: isSignUp ? '2px solid #2563eb' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >注册</button>
        </div>

        {/* 表单区域 */}
        <form onSubmit={handleAuth} style={{padding: '30px 40px 40px 40px'}}>
          
          {/* 错误提示条 */}
          {errorMsg && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', 
              padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span style={{fontSize: '16px'}}>⚠️</span> {errorMsg}
            </div>
          )}

          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px'}}>电子邮箱</label>
            <div style={{position: 'relative'}}>
              <span style={{position: 'absolute', left: '12px', top: '10px', color: '#9ca3af'}}>{Icon.Mail}</span>
              <input 
                type="email" required placeholder="name@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                className="form-input" 
                style={{width: '100%', paddingLeft: '38px', height: '40px', fontSize: '14px'}} 
              />
            </div>
          </div>

          <div style={{marginBottom: '30px'}}>
            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px'}}>密码</label>
            <div style={{position: 'relative'}}>
              <span style={{position: 'absolute', left: '12px', top: '10px', color: '#9ca3af'}}>{Icon.Lock}</span>
              <input 
                type="password" required placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                className="form-input" 
                style={{width: '100%', paddingLeft: '38px', height: '40px', fontSize: '14px'}} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%', height: '44px', justifyContent: 'center', fontSize: '15px',
              opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? <span className="animate-spin" style={{animation: 'spin 1s linear infinite'}}>{Icon.Loader}</span> : (isSignUp ? '立即注册' : '登 录')}
          </button>

          <p style={{marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#9ca3af'}}>
            {isSignUp ? '注册即代表同意我们的服务条款' : '忘记密码请联系管理员重置'}
          </p>
        </form>
      </div>

      {/* 底部版权 */}
      <div style={{position: 'absolute', bottom: '20px', fontSize: '12px', color: '#cbd5e1'}}>
        © 2024 PromptBox System.
      </div>

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  )
}