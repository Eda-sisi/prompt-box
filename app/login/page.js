'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// --- 图标组件 ---
const Icon = {
  Mail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  User: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Lock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Loader: <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
}

export default function LoginPage() {
  // inputValue 用于接收用户输入（可能是邮箱，也可能是昵称）
  const [inputValue, setInputValue] = useState('')
  const [password, setPassword] = useState('')
  // 注册专用字段
  const [nickname, setNickname] = useState('') 
  
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
    if (msg.includes('duplicate key value')) return '该昵称已被使用，请换一个'
    return msg
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    let error
    
    // --- 注册逻辑 ---
    if (isSignUp) {
      // 1. 注册时必须是邮箱
      if (!inputValue.includes('@')) {
        setErrorMsg('注册请填写有效的电子邮箱')
        setLoading(false)
        return
      }
      if (!nickname.trim()) {
        setErrorMsg('请填写用户昵称')
        setLoading(false)
        return
      }

      // 2. 调用 Supabase 注册
      const res = await supabase.auth.signUp({ 
        email: inputValue, 
        password,
        options: {
          // 将昵称存入 user_metadata (可选，方便前端直接取)
          data: { nickname: nickname.trim() }
        }
      })
      error = res.error

      // 3. 注册成功后，立即更新 profiles 表的 nickname
      if (!error && res.data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ nickname: nickname.trim() })
          .eq('id', res.data.user.id)
        
        if (profileError) {
          console.error('更新昵称失败:', profileError)
          // 这里不阻断流程，虽然没存进 profiles 表，但账号其实注册成功了
        }

        alert('注册成功！正在自动登录...')
        setIsSignUp(false) // 注册完切回登录界面
        // 清空密码，但保留账号方便用户登录
        setPassword('')
      }
    } 
    
    // --- 登录逻辑 ---
    else {
      let loginEmail = inputValue.trim()

      // 1. 如果输入不含 @，视为昵称，先去查邮箱
      if (!loginEmail.includes('@')) {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('email')
          .eq('nickname', loginEmail) // 假设 profiles 表已有 nickname 字段且唯一
          .single()
        
        if (fetchError || !data) {
          setErrorMsg('未找到该昵称对应的用户，请检查或使用邮箱登录')
          setLoading(false)
          return
        }
        loginEmail = data.email // 找到了！切换为真实邮箱
      }

      // 2. 使用真实邮箱登录
      const res = await supabase.auth.signInWithPassword({ 
        email: loginEmail, 
        password 
      })
      error = res.error
      
      if (!error) {
        router.push('/') 
        router.refresh()
        return // 成功后直接跳转
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

          {/* 注册专属：昵称输入框 */}
          {isSignUp && (
            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px'}}>用户昵称 <span style={{color:'red'}}>*</span></label>
              <div style={{position: 'relative'}}>
                <span style={{position: 'absolute', left: '12px', top: '10px', color: '#9ca3af'}}>{Icon.User}</span>
                <input 
                  type="text" required placeholder="例如：zhangs"
                  value={nickname} onChange={e => setNickname(e.target.value)}
                  className="form-input" 
                  style={{width: '100%', paddingLeft: '38px', height: '40px', fontSize: '14px'}} 
                />
              </div>
              <div style={{fontSize:'12px', color:'#9ca3af', marginTop:'4px'}}>推荐格式：姓全拼+名首字母</div>
            </div>
          )}

          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px'}}>
                {isSignUp ? '电子邮箱' : '账号'} <span style={{color:'red'}}>*</span>
            </label>
            <div style={{position: 'relative'}}>
              <span style={{position: 'absolute', left: '12px', top: '10px', color: '#9ca3af'}}>{Icon.Mail}</span>
              <input 
                type="text" required 
                placeholder={isSignUp ? "name@example.com" : "输入邮箱 或 昵称"}
                value={inputValue} onChange={e => setInputValue(e.target.value)}
                className="form-input" 
                style={{width: '100%', paddingLeft: '38px', height: '40px', fontSize: '14px'}} 
              />
            </div>
          </div>

          <div style={{marginBottom: '30px'}}>
            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px'}}>密码 <span style={{color:'red'}}>*</span></label>
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