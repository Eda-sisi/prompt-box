'use client'
import { useState, useEffect } from 'react' // 已移除 useRef
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// --- 图标组件 ---
const Icon = {
  Settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Search: <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Delete: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
  Eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  Users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Home: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
}

// 默认分类
const DEFAULT_CATEGORIES = [
  { id: 'c1', name: '编程开发', icon: '💻', children: [{ id: 'c1-1', name: '前端开发' }] },
  { id: 'c2', name: '内容创作', icon: '✍️', children: [{ id: 'c2-1', name: '小红书文案' }] }
]

export default function Home() {
  const supabase = createClient()
  const router = useRouter()
  
  // --- 核心状态 ---
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false) // 是否管理员
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('home') // 'home' | 'list' | 'admin'
  
  // 数据状态
  const [prompts, setPrompts] = useState([])
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [catRecordId, setCatRecordId] = useState(null)
  const [usersList, setUsersList] = useState([]) // 管理员用的用户列表
  
  // 筛选与UI状态
  const [selectedId, setSelectedId] = useState('all') // 分类筛选
  const [searchQuery, setSearchQuery] = useState('')
  const [sortType, setSortType] = useState('time_desc')
  const [expandedCats, setExpandedCats] = useState({}) 
  
  // 弹窗
  const [modalMode, setModalMode] = useState(null) 
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [viewingPrompt, setViewingPrompt] = useState(null)
  const [inputState, setInputState] = useState({ mode: null, parentId: null, childId: null, value: '' })
  
  // 拖拽
  const [dragItem, setDragItem] = useState(null)

  // --- 初始化 ---
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }
      
      const currentUser = session.user
      setUser(currentUser)

      // 1. 检查是否是管理员
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single()
      if (profile && profile.role === 'admin') {
        setIsAdmin(true)
      }

      // 2. 加载分类
      const { data: catData } = await supabase.from('categories').select('*').limit(1).maybeSingle()
      if (catData) {
        setCategories(catData.content)
        setCatRecordId(catData.id)
      }

      // 3. 加载提示词
      await fetchPrompts()
      setLoading(false)
    }
    init()
  }, [router])

  const fetchPrompts = async () => {
    const { data } = await supabase.from('prompts').select('*').order('updated_at', { ascending: false })
    if (data) setPrompts(data)
  }

  // 获取用户列表 (仅管理员)
  const fetchUsers = async () => {
    if (!isAdmin) return
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setUsersList(data)
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('⚠️ 高危操作：确定要移除该用户吗？\n这将同时删除该用户的所有提示词数据！')) return
    
    // 1. 先删该用户的提示词
    await supabase.from('prompts').delete().eq('user_id', userId)
    
    // 2. 再删用户档案
    const { error } = await supabase.from('profiles').delete().eq('id', userId)
    
    if (error) {
      alert('删除失败: ' + error.message)
    } else {
      alert('用户已移除')
      fetchUsers() // 刷新列表
    }
  }

  // --- 新增：切换用户角色 (提权/降级) ---
  const handleToggleAdmin = async (userId, currentRole) => {
    // 防止取消自己的管理员权限（把自己锁在外面）
    if (userId === user.id) {
      return alert("操作禁止：你不能取消自己的管理员权限！");
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const actionName = newRole === 'admin' ? '设为管理员' : '降级为普通用户';

    if (!confirm(`确定要将该用户 ${actionName} 吗？`)) return;

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert("操作失败: " + error.message);
    } else {
      alert("操作成功！");
      fetchUsers(); // 刷新列表，看到最新状态
    }
  };

  // --- 业务逻辑：保存分类 ---
  const saveCategoriesToCloud = async (newCats) => {
    setCategories(newCats)
    if (catRecordId) {
      await supabase.from('categories').update({ content: newCats, updated_at: new Date() }).eq('id', catRecordId)
    } else {
      const { data } = await supabase.from('categories').insert([{ user_id: user.id, content: newCats, updated_at: new Date() }]).select().single()
      if(data) setCatRecordId(data.id)
    }
  }

  // --- 业务逻辑：提示词增删改 ---
  const handleSavePrompt = async () => {
    if (!editingPrompt.title || !editingPrompt.content) return alert('标题和内容不能为空')
    let tagsArr = []
    if (editingPrompt.tags) {
      tagsArr = Array.isArray(editingPrompt.tags) ? editingPrompt.tags : editingPrompt.tags.split(/[,，]/).map(t => t.trim()).filter(t => t)
    }
    const promptData = {
      title: editingPrompt.title,
      content: editingPrompt.content,
      desc: editingPrompt.desc || '',
      category_id: editingPrompt.categoryId || '',
      tags: tagsArr,
      updated_at: new Date()
    }

    if (editingPrompt.id) {
      const { error } = await supabase.from('prompts').update(promptData).eq('id', editingPrompt.id)
      if(error) alert(error.message)
    } else {
      const { error } = await supabase.from('prompts').insert({ ...promptData, user_id: user.id })
      if(error) alert(error.message)
    }
    fetchPrompts()
    setModalMode(null)
  }

  const handleDeletePrompt = async (id) => {
    if (!confirm('确定删除吗？')) return
    await supabase.from('prompts').delete().eq('id', id)
    fetchPrompts()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // --- 辅助逻辑 ---
  const getFilteredPrompts = () => {
    let list = prompts.filter(p => {
      // 智能分类匹配 (支持点击父级显示所有子级)
      let matchCat = false
      if (selectedId === 'all') {
        matchCat = true
      } else {
        const rootCat = categories.find(c => c.id === selectedId)
        if (rootCat) {
          // 选中一级分类：匹配自己 或 子分类
          const childIds = rootCat.children?.map(child => child.id) || []
          matchCat = p.category_id === selectedId || childIds.includes(p.category_id)
        } else {
          // 选中二级分类：精确匹配
          matchCat = p.category_id === selectedId
        }
      }

      // 搜索匹配
      const searchLower = searchQuery.toLowerCase()
      const matchSearch = (p.title + p.content + (p.desc || '')).toLowerCase().includes(searchLower)
      
      return matchCat && matchSearch
    })

    // 排序
    list.sort((a, b) => {
      const tA = new Date(a.updated_at).getTime()
      const tB = new Date(b.updated_at).getTime()
      if (sortType === 'time_desc') return tB - tA
      if (sortType === 'time_asc') return tA - tB
      if (sortType === 'name_asc') return a.title.localeCompare(b.title, 'zh')
      if (sortType === 'name_desc') return b.title.localeCompare(a.title, 'zh')
      return 0
    })
    
    return list
  }
  
  const getCategoryCount = (catId) => {
    return prompts.filter(p => p.category_id === catId).length
  }

  const getValidTags = (rawTags) => {
    if (!rawTags) return []
    const list = Array.isArray(rawTags) ? rawTags : String(rawTags).split(/[,，]/)
    return list.map(t => t.trim()).filter(t => t.length > 0 && t !== '[]')
  }

  // --- 渲染组件：首页 (堆叠效果) ---
  const renderHome = () => (
    <div className="content-area">
      <h2 style={{fontSize:'20px', fontWeight:'bold', marginBottom:'20px', paddingLeft:'20px'}}>📚 提示词概览</h2>
      <div className="dashboard-grid">
        {/* 全部卡片 */}
        <div className="stack-card" onClick={() => { setSelectedId('all'); setViewMode('list') }}>
            <div className="stack-icon">🏠</div>
            <div className="stack-title">全部提示词</div>
            <div className="stack-count">{prompts.length} 个</div>
        </div>

        {/* 一级分类卡片 */}
        {categories.map(cat => {
            let count = 0;
            cat.children.forEach(sub => { count += getCategoryCount(sub.id) })
            count += getCategoryCount(cat.id)

            return (
                <div key={cat.id} className="stack-card" onClick={() => { 
                    setSelectedId(cat.children?.[0]?.id || cat.id); 
                    setExpandedCats(prev => ({...prev, [cat.id]: true})); 
                    setViewMode('list');
                }}>
                    <div className="stack-icon">{cat.icon || '📂'}</div>
                    <div className="stack-title">{cat.name}</div>
                    <div className="stack-count">{count} 个</div>
                </div>
            )
        })}
      </div>
    </div>
  )

  // --- 渲染组件：管理员面板 ---
  const renderAdminPanel = () => (
    <div className="content-area">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2 style={{fontSize:'20px', fontWeight:'bold'}}>🛡️ 用户管理</h2>
        <button className="btn-small" onClick={fetchUsers}>刷新列表</button>
      </div>
      
      <div className="admin-table-container">
        <table className="admin-table">
            <thead>
                <tr>
                    <th>用户邮箱</th>
                    <th>注册时间</th>
                    <th>角色</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                {usersList.map(u => (
                    <tr key={u.id}>
                        <td>{u.email}</td>
                        <td>{new Date(u.created_at).toLocaleString()}</td>
                        <td>
                            <span className={u.role === 'admin' ? 'badge-admin' : 'badge-user'}>
                                {u.role === 'admin' ? '管理员' : '普通用户'}
                            </span>
                        </td>
                        <td style={{display:'flex', gap:'10px'}}>
                            {/* 👇👇👇 新增：切换角色按钮 👇👇👇 */}
                            <button 
                              className="btn-small" 
                              style={{
                                color: u.role === 'admin' ? '#d97706' : '#2563eb', // 管理员显示橙色，普通用户显示蓝色
                                borderColor: u.role === 'admin' ? '#fcd34d' : '#bfdbfe',
                                background: u.role === 'admin' ? '#fffbeb' : '#eff6ff'
                              }}
                              onClick={() => handleToggleAdmin(u.id, u.role)}
                            >
                              {u.role === 'admin' ? '降级' : '提权'}
                            </button>
                            {/* 👆👆👆 新增结束 👆👆👆 */}

                            <button 
                              className="btn-small" 
                              style={{color: 'red', borderColor: '#fee2e2', background: '#fef2f2'}}
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              删除
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  )

  // --- 渲染组件：列表视图 ---
  const renderListView = () => (
    <div className="content-area">
        <div className="grid">
        {getFilteredPrompts().map(p => {
            const validTags = getValidTags(p.tags)
            return (
            <div key={p.id} className="card">
                <div>
                <div className="card-header">
                    <div className="card-title" onClick={() => { setViewingPrompt(p); setModalMode('view') }} title={p.title}>{p.title}</div>
                    {p.desc && <div className="card-desc" title={p.desc}>{p.desc}</div>}
                    {validTags.length > 0 && (
                    <div className="tags">
                        {validTags.map((t, i) => <span key={i} className="tag">{t}</span>)}
                    </div>
                    )}
                </div>
                <div className="card-body" onClick={() => { setViewingPrompt(p); setModalMode('view') }} title="点击查看详情">
                    {p.content}
                </div>
                </div>
                <div className="card-footer">
                <div style={{display:'flex', gap:'8px'}}>
                    <button className="btn-icon" onClick={() => { setViewingPrompt(p); setModalMode('view') }} title="查看">{Icon.Eye}</button>
                    {(user.id === p.user_id || isAdmin) && (
                        <>
                            <button 
                            className="btn-icon" 
                            onClick={() => { 
                                setEditingPrompt({ ...p, categoryId: p.category_id || '', tags: getValidTags(p.tags).join(', ') }); 
                                setModalMode('prompt') 
                            }} 
                            title="编辑"
                            >
                            {Icon.Edit}
                            </button>
                            <button className="btn-icon delete" onClick={() => handleDeletePrompt(p.id)} title="删除">{Icon.Delete}</button>
                        </>
                    )}
                </div>
                <button className="btn-copy" onClick={() => {navigator.clipboard.writeText(p.content); alert('已复制')}}>
                    {Icon.Copy} 复制
                </button>
                </div>
            </div>
            )
        })}
        </div>
        {getFilteredPrompts().length === 0 && <div style={{textAlign:'center', color:'#9ca3af', marginTop:'100px'}}>暂无内容</div>}
    </div>
  )

  // --- 拖拽与输入框逻辑 ---
  const handleDragStart = (e, item) => { setDragItem(item); e.dataTransfer.effectAllowed = 'move' }
  const handleDragOver = (e) => { e.preventDefault() }
  const handleDrop = (e, targetItem) => {
        e.preventDefault()
        if (!dragItem || dragItem.type !== targetItem.type || dragItem.parentId !== targetItem.parentId) return 
        const newCats = JSON.parse(JSON.stringify(categories))
        if (dragItem.type === 'root') {
            const itemToMove = newCats[dragItem.index]; newCats.splice(dragItem.index, 1); newCats.splice(targetItem.index, 0, itemToMove)
        } else {
            const parent = newCats.find(c => c.id === dragItem.parentId)
            if (parent) { const itemToMove = parent.children[dragItem.index]; parent.children.splice(dragItem.index, 1); parent.children.splice(targetItem.index, 0, itemToMove) }
        }
        saveCategoriesToCloud(newCats); setDragItem(null)
    }

  // --- 输入确认逻辑 (含防重) ---
  const handleInputConfirm = () => {
    const val = inputState.value.trim()
    if (!val) return alert('名称不能为空')

    const newCats = JSON.parse(JSON.stringify(categories))
    
    // 检查重复辅助函数
    const isDuplicate = (list, name, excludeId = null) => {
        return list.some(item => item.name === name && item.id !== excludeId);
    }

    if (inputState.mode === 'add_root') {
        if (isDuplicate(newCats, val)) return alert('该分类名称已存在！');
        newCats.push({ id: Date.now().toString(), name: val, icon: '📂', children: [] })
    } 
    else if (inputState.mode === 'add_child') {
        const parent = newCats.find(c => c.id === inputState.parentId)
        if (parent) {
            if (isDuplicate(parent.children, val)) return alert('该分类下已存在同名子分类！');
            parent.children.push({ id: Date.now().toString(), name: val })
        }
    } 
    else if (inputState.mode === 'rename') {
        const root = newCats.find(c => c.id === inputState.parentId)
        if (inputState.childId) {
            const child = root.children.find(c => c.id === inputState.childId)
            if (child) {
                if (isDuplicate(root.children, val, child.id)) return alert('同级下已存在该名称！');
                child.name = val
            }
        } else {
            if (root) {
                if (isDuplicate(newCats, val, root.id)) return alert('已存在同名分类！');
                root.name = val
            }
        }
    }
    
    saveCategoriesToCloud(newCats)
    setModalMode('category')
  }

  // --- Render Main ---
  if (loading) return <div style={{display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', color:'#6b7280'}}>Loading...</div>

  return (
    <div className="app-container">
      {/* 侧边栏 */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="brand"><div className="logo-box">P</div>提示词库</div>
          {isAdmin && <button className="btn-setting" onClick={() => setModalMode('category')} title="分类管理">{Icon.Settings}</button>}
        </div>
        
        <div className="sidebar-content">
          {/* 首页入口 */}
          <div className={`menu-item ${viewMode === 'home' ? 'active' : ''}`} onClick={() => setViewMode('home')}>
             <div style={{display:'flex', gap:'10px'}}><span>📊</span> 仪表盘 (首页)</div>
          </div>
          
          {/* 管理员入口 */}
          {isAdmin && (
             <div className={`menu-item ${viewMode === 'admin' ? 'active' : ''}`} onClick={() => { setViewMode('admin'); fetchUsers(); }}>
                <div style={{display:'flex', gap:'10px'}}><span>🛡️</span> 用户管理</div>
             </div>
          )}

          <div style={{borderTop:'1px solid #eee', margin:'10px 0'}}></div>

          <div className={`menu-item ${viewMode === 'list' && selectedId === 'all' ? 'active' : ''}`} onClick={() => { setSelectedId('all'); setViewMode('list') }}>
            <div style={{display:'flex', gap:'10px'}}><span>🏠</span> 全部提示词</div>
          </div>
          <div style={{fontSize:'12px', color:'#9ca3af', fontWeight:'bold', margin:'20px 0 5px 12px'}}>场景分类</div>
          
          {categories.map(cat => {
            const hasActiveChild = cat.children?.some(child => child.id === selectedId)
            // 修改：不再强制展开，解决无法收起的 bug
            const isExpanded = expandedCats[cat.id] || hasActiveChild
            
            return (
              <div key={cat.id}>
                {/* 点击一级菜单 */}
                <div 
                  className={`menu-item ${selectedId === cat.id ? 'active' : ''}`} 
                  onClick={() => { 
                    setSelectedId(cat.id); 
                    setViewMode('list'); 
                    setExpandedCats(prev => ({...prev, [cat.id]: !prev[cat.id]})) 
                  }}
                >
                  <div style={{display:'flex', gap:'8px'}}>
                    <span>{cat.icon || '📂'}</span> {cat.name}
                  </div>
                  <span style={{fontSize:'10px', color:'#ccc'}}>{isExpanded ? '▼' : '▶'}</span>
                </div>

                {isExpanded && (
                  <div className="submenu">
                    {cat.children?.map(child => (
                      <div key={child.id} 
                           className={`submenu-item ${selectedId === child.id ? 'active' : ''}`}
                           onClick={(e) => { 
                             e.stopPropagation(); 
                             setSelectedId(child.id); 
                             setViewMode('list') 
                           }}
                      >
                        {child.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* 底部用户信息栏 */}
        <div style={{padding:'15px', textAlign:'center', fontSize:'12px', color:'#9ca3af', borderTop:'1px solid #e5e7eb'}}>
           <div style={{marginBottom:'5px', fontWeight:600}}>{isAdmin ? '管理员' : '普通用户'}</div>
           <div style={{marginBottom:'5px', overflow:'hidden', textOverflow:'ellipsis'}}>{user?.email}</div>
           <button onClick={handleLogout} style={{color:'#ef4444', border:'none', background:'none', cursor:'pointer'}}>退出登录</button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="main">
        <header className="header">
          <div className="header-title">
             {viewMode === 'home' && '仪表盘'}
             {viewMode === 'admin' && '系统管理'}
             {viewMode === 'list' && (selectedId === 'all' ? '全部提示词' : categories.flatMap(c => c.children).find(c => c.id === selectedId)?.name || categories.find(c => c.id === selectedId)?.name || '筛选结果')}
          </div>
          
          {viewMode === 'list' && (
            <div className="toolbar">
                <div className="search-box">
                {Icon.Search}
                <input type="text" className="search-input" placeholder="搜索..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <select className="sort-select" value={sortType} onChange={e => setSortType(e.target.value)}>
                <option value="time_desc">🕒 最新修改</option>
                <option value="name_asc">🔤 名称 (A-Z)</option>
                </select>
                <button className="btn-primary" onClick={() => {
                setEditingPrompt({ title: '', content: '', desc: '', tags: '', categoryId: selectedId !== 'all' ? selectedId : '' })
                setModalMode('prompt')
                }}>
                {Icon.Plus} 新建
                </button>
            </div>
          )}
        </header>

        {viewMode === 'home' && renderHome()}
        {viewMode === 'admin' && renderAdminPanel()}
        {viewMode === 'list' && renderListView()}

      </div>

      {/* 弹窗部分 */}
      {modalMode === 'prompt' && (
        <div className="modal-overlay">
          <div className="modal-large">
            <div className="modal-header">
              <span className="modal-title">{editingPrompt.id ? '编辑提示词' : '新建提示词'}</span>
              <span className="modal-close" onClick={() => setModalMode(null)}>×</span>
            </div>
            <div className="modal-body">
                <div style={{display:'flex', gap:'20px', marginBottom:'20px'}}>
                <div style={{flex:2}}>
                    <label className="form-label">标题</label>
                    <input className="form-input" value={editingPrompt.title} onChange={e => setEditingPrompt({...editingPrompt, title: e.target.value})} placeholder="输入标题..." />
                </div>
                <div style={{flex:1}}>
                    <label className="form-label">分类</label>
                    <select className="form-select" value={editingPrompt.categoryId} onChange={e => setEditingPrompt({...editingPrompt, categoryId: e.target.value})}>
                        <option value="">未分类</option>
                        {categories.map(c => (
                        <optgroup key={c.id} label={c.name}>
                            {c.children.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                        </optgroup>
                        ))}
                    </select>
                </div>
                </div>
                <div className="form-group">
                <label className="form-label">描述 (选填)</label>
                <input className="form-input" value={editingPrompt.desc} onChange={e => setEditingPrompt({...editingPrompt, desc: e.target.value})} placeholder="一句话描述用途..." />
                </div>
                <div className="form-group">
                <label className="form-label">标签</label>
                <input className="form-input" value={editingPrompt.tags} onChange={e => setEditingPrompt({...editingPrompt, tags: e.target.value})} placeholder="例如: 办公, 效率" />
                </div>
                <div className="form-group" style={{flex:1, display:'flex', flexDirection:'column', marginBottom:0}}>
                <label className="form-label">内容</label>
                <textarea className="form-textarea" value={editingPrompt.content} onChange={e => setEditingPrompt({...editingPrompt, content: e.target.value})} placeholder="在此输入详细提示词..."></textarea>
                </div>
            </div>
            <div className="modal-footer">
               <button className="btn-cancel" onClick={() => setModalMode(null)}>取消</button>
               <button className="btn-primary" onClick={handleSavePrompt}>保存</button>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'view' && viewingPrompt && (
        <div className="modal-overlay">
          <div className="modal-large">
            <div className="modal-header">
              <span className="modal-title" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'80%'}}>{viewingPrompt.title}</span>
              <span className="modal-close" onClick={() => setModalMode(null)}>×</span>
            </div>
            <div className="modal-body">
                <div className="view-meta">
                    <span style={{background:'#f3f4f6', padding:'4px 8px', borderRadius:'4px', fontSize:'12px'}}>📂 {categories.flatMap(c => c.children).find(sub => sub.id === viewingPrompt.category_id)?.name || '未分类'}</span>
                    {getValidTags(viewingPrompt.tags).length > 0 && (
                      <span style={{background:'#eff6ff', color:'#2563eb', padding:'4px 8px', borderRadius:'4px', fontSize:'12px'}}>
                        🏷️ {getValidTags(viewingPrompt.tags).join(', ')}
                      </span>
                    )}
                </div>
                {viewingPrompt.desc && <div style={{fontSize:'13px', color:'#1e40af', background:'#eff6ff', padding:'12px', borderRadius:'8px', marginBottom:'20px'}}>ℹ️ {viewingPrompt.desc}</div>}
                <div className="view-content-box">{viewingPrompt.content}</div>
            </div>
            <div className="modal-footer">
               {(user.id === viewingPrompt.user_id || isAdmin) && (
                   <button className="btn-cancel" onClick={() => { setEditingPrompt({ ...viewingPrompt, categoryId: viewingPrompt.category_id, tags: getValidTags(viewingPrompt.tags).join(', ') }); setModalMode('prompt') }}>✎ 编辑</button>
               )}
               <button className="btn-primary" onClick={() => {navigator.clipboard.writeText(viewingPrompt.content); alert('已复制')}}>复制内容</button>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'category' && (
        <div className="modal-overlay">
          <div className="modal-large" style={{width:'600px', height:'700px'}}>
            <div className="modal-header">
              <span className="modal-title">分类管理</span>
              <span className="modal-close" onClick={() => setModalMode(null)}>×</span>
            </div>
            <div className="modal-body" style={{display:'flex', flexDirection:'column'}}>
                <div style={{marginBottom:'20px', display:'flex', gap:'10px'}}>
                <button className="btn-primary" style={{padding:'0 16px', fontSize:'12px', height:'32px'}} onClick={() => { setInputState({ mode: 'add_root', value: '' }); setModalMode('input') }}>+ 新增一级分类</button>
                <div style={{flex:1, textAlign:'right', fontSize:'12px', color:'#9ca3af', display:'flex', alignItems:'center', justifyContent:'flex-end'}}>按住 ☰ 拖拽排序</div>
                </div>
                <div className="cat-list">
                {categories.map((cat, catIndex) => (
                    <div key={cat.id} className="cat-item" draggable onDragStart={(e) => handleDragStart(e, { type: 'root', index: catIndex })} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, { type: 'root', index: catIndex })}>
                        <div className="cat-header">
                        <span className="cat-drag-handle">☰</span>
                        <span className="cat-name">{cat.icon || '📂'} {cat.name}</span>
                        <div className="cat-actions">
                            <button className="btn-icon" onClick={() => { setInputState({ mode: 'add_child', parentId: cat.id, value: '' }); setModalMode('input') }}>＋</button>
                            <button className="btn-icon" onClick={() => { setInputState({ mode: 'rename', parentId: cat.id, value: cat.name }); setModalMode('input') }}>✎</button>
                        </div>
                        </div>
                        <div className="sub-list">
                        {cat.children.map((sub, subIndex) => (
                            <div key={sub.id} className="sub-item" draggable onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, { type: 'child', index: subIndex, parentId: cat.id }) }} onDragOver={handleDragOver} onDrop={(e) => { e.stopPropagation(); handleDrop(e, { type: 'child', index: subIndex, parentId: cat.id }) }}>
                                <span className="cat-drag-handle">☰</span>
                                <span className="cat-name">{sub.name}</span>
                                <div className="cat-actions">
                                    <button className="btn-icon" onClick={() => { setInputState({ mode: 'rename', parentId: cat.id, childId: sub.id, value: sub.name }); setModalMode('input') }}>✎</button>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                ))}
                </div>
            </div>
            <div className="modal-footer">
               <button className="btn-primary" onClick={() => setModalMode(null)}>完成</button>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'input' && (
        <div className="modal-overlay">
          <div className="modal-normal">
            <div className="modal-header">
               <span className="modal-title">请输入名称</span>
               <span className="modal-close" onClick={() => setModalMode('category')}>×</span>
            </div>
            <div className="modal-body" style={{overflow:'visible'}}>
                <div className="form-group">
                <input className="form-input" autoFocus value={inputState.value} onChange={e => setInputState({...inputState, value: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleInputConfirm()} />
                </div>
            </div>
            <div className="modal-footer">
               <button className="btn-cancel" onClick={() => setModalMode('category')}>取消</button>
               <button className="btn-primary" onClick={handleInputConfirm}>确定</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}