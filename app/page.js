'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// --- 1. 图标组件库 (新增大拇指图标) ---
const Icon = {
  Settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  Search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Delete: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
  Eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  Users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Home: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  Star: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
  StarFill: <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
  // 改为大拇指图标
  ThumbsUp: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>,
  ThumbsUpFill: <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>,
  ChevronDown: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  Beaker: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 3h15"></path><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"></path><path d="M6 14h12"></path></svg>,
  Upload: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Image: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
  Paperclip: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>,
  Trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Expand: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>,
  TrendingUp: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
  Award: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>,
  FileWord: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  FileExcel: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="17"></line><line x1="16" y1="13" x2="8" y2="17"></line></svg>,
  FilePdf: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>,
  FileGeneric: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
}

// --- 2. 大模型配置 ---
const AI_MODELS = [
  { name: 'DeepSeek', url: 'https://chat.deepseek.com/', color: '#4d6bfe' },
  { name: 'ChatGPT', url: 'https://chatgpt.com/', color: '#10a37f' },
  { name: 'Gemini', url: 'https://gemini.google.com/', color: '#4285f4' },
  { name: 'Claude', url: 'https://claude.ai/', color: '#d97757' },
  { name: 'Cursor', url: 'https://www.cursor.com/', color: '#000000' },
  { name: '豆包', url: 'https://www.doubao.com/', color: '#0066ff' },
  { name: 'Grok', url: 'https://grok.x.ai/', color: '#000000' },
]

const DEFAULT_CATEGORIES = [
  { id: 'c1', name: '编程开发', icon: '💻', children: [{ id: 'c1-1', name: '前端开发' }] },
  { id: 'c2', name: '内容创作', icon: '✍️', children: [{ id: 'c2-1', name: '文案' }] }
]

export default function Home() {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef(null)
  
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('home') 
  
  const [prompts, setPrompts] = useState([])
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [catRecordId, setCatRecordId] = useState(null)
  const [usersList, setUsersList] = useState([])
  const [favorites, setFavorites] = useState([]) 
  const [likedIds, setLikedIds] = useState([]) 
  
  const [selectedId, setSelectedId] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortType, setSortType] = useState('time_desc')
  const [expandedCats, setExpandedCats] = useState({}) 
  
  const [modalMode, setModalMode] = useState(null) 
  const [isEffectView, setIsEffectView] = useState(false) 

  const [editingPrompt, setEditingPrompt] = useState(null)
  const [viewingPrompt, setViewingPrompt] = useState(null)
  const [inputState, setInputState] = useState({ mode: null, parentId: null, childId: null, value: '', promptTitle: '' })
  
  const [uploading, setUploading] = useState(false)
  
  const [dragItem, setDragItem] = useState(null)

  // --- 初始化 ---
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }
      
      const currentUser = session.user
      setUser(currentUser)

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single()
      if (profile && profile.role === 'admin') setIsAdmin(true)

      const { data: catData } = await supabase.from('categories').select('*').limit(1).maybeSingle()
      if (catData) {
        setCategories(catData.content)
        setCatRecordId(catData.id)
      }

      const { data: favData } = await supabase.from('favorites').select('prompt_id')
      if (favData) {
        setFavorites(favData.map(f => f.prompt_id))
      }

      const { data: likeData } = await supabase.from('likes').select('prompt_id')
      if (likeData) {
        setLikedIds(likeData.map(l => l.prompt_id))
      }

      await fetchPrompts()
      setLoading(false)
    }
    init()
  }, [router])

  const fetchPrompts = async () => {
    const { data } = await supabase.from('prompts').select('*, profiles(nickname)').order('updated_at', { ascending: false })
    if (data) {
        const cleaned = data.map(p => ({
            ...p,
            result_images: p.result_images || (p.result_image ? [p.result_image] : []),
            like_count: p.like_count || 0
        }))
        setPrompts(cleaned)
    }
  }

  const fetchUsers = async () => {
    if (!isAdmin) return
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setUsersList(data)
  }

  // --- 业务逻辑 ---
  const handleViewDetails = async (p, isEffect = false) => {
    setViewingPrompt(p)
    setIsEffectView(isEffect)
    setModalMode('view')
    await supabase.rpc('increment_view_count', { row_id: p.id })
    setPrompts(prev => prev.map(item => item.id === p.id ? { ...item, view_count: (item.view_count || 0) + 1 } : item))
  }

  const toggleFavorite = async (e, prompt) => {
    e.stopPropagation()
    const isFav = favorites.includes(prompt.id)
    if (isFav) {
      setFavorites(prev => prev.filter(id => id !== prompt.id))
      await supabase.from('favorites').delete().match({ prompt_id: prompt.id, user_id: user.id })
      toast.success('已取消收藏')
    } else {
      setFavorites(prev => [...prev, prompt.id])
      await supabase.from('favorites').insert({ prompt_id: prompt.id, user_id: user.id })
      toast.success('已加入收藏')
    }
  }

  const toggleLike = async (e, prompt) => {
    e.stopPropagation()
    const isLiked = likedIds.includes(prompt.id)
    const newCount = isLiked ? (prompt.like_count - 1) : (prompt.like_count + 1)
    
    setLikedIds(prev => isLiked ? prev.filter(id => id !== prompt.id) : [...prev, prompt.id])
    setPrompts(prev => prev.map(p => p.id === prompt.id ? { ...p, like_count: newCount } : p))

    try {
        if (isLiked) {
            await supabase.from('likes').delete().match({ prompt_id: prompt.id, user_id: user.id })
        } else {
            await supabase.from('likes').insert({ prompt_id: prompt.id, user_id: user.id })
        }
        await supabase.from('prompts').update({ like_count: newCount }).eq('id', prompt.id)
    } catch (err) {
        toast.error("操作失败")
    }
  }

  const handleModelJump = (url) => {
    if (!viewingPrompt) return
    navigator.clipboard.writeText(viewingPrompt.content)
    toast.info('提示词已复制！正在前往...')
    setTimeout(() => window.open(url, '_blank'), 800)
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('⚠️ 高危操作：确定要彻底销毁该账号吗？\n这将删除该用户的所有数据且无法恢复！')) return
    try {
      const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '删除失败')
      toast.success('用户及其所有数据已彻底销毁')
      fetchUsers()
      fetchPrompts() 
    } catch (error) {
      toast.error('操作失败: ' + error.message)
    }
  }

  const handleToggleAdmin = async (userId, currentRole) => {
    if (userId === user.id) return toast.warning("操作禁止：你不能取消自己的管理员权限！")
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const actionName = newRole === 'admin' ? '设为管理员' : '降级为普通用户'
    if (!confirm(`确定要将该用户 ${actionName} 吗？`)) return
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) toast.error("操作失败: " + error.message)
    else { toast.success("操作成功！"); fetchUsers() }
  }

  const saveCategoriesToCloud = async (newCats) => {
    setCategories(newCats)
    if (catRecordId) {
      await supabase.from('categories').update({ content: newCats, updated_at: new Date() }).eq('id', catRecordId)
    } else {
      const { data } = await supabase.from('categories').insert([{ user_id: user.id, content: newCats, updated_at: new Date() }]).select().single()
      if(data) setCatRecordId(data.id)
    }
  }

  const handleDeleteCategory = (type, id, parentId = null) => {
    if (!confirm('确定要删除该分类吗？\n删除后，该分类下的提示词可能会失去归属分类。')) return
    const newCats = JSON.parse(JSON.stringify(categories))
    if (type === 'root') {
      const index = newCats.findIndex(c => c.id === id)
      if (index !== -1) { newCats.splice(index, 1) }
    } else if (type === 'child') {
      const parent = newCats.find(c => c.id === parentId)
      if (parent) {
        const childIndex = parent.children.findIndex(c => c.id === id)
        if (childIndex !== -1) { parent.children.splice(childIndex, 1) }
      }
    }
    saveCategoriesToCloud(newCats)
    toast.success('分类已删除')
  }

  // --- 辅助函数 ---
  const checkIsImage = (url) => {
    if (!url) return false
    const cleanUrl = url.split('?')[0].toLowerCase()
    return cleanUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/) != null
  }

  const getFileType = (url) => {
    if (!url) return 'generic'
    const cleanUrl = url.split('?')[0].toLowerCase()
    if (cleanUrl.match(/\.(doc|docx)$/)) return 'word'
    if (cleanUrl.match(/\.(xls|xlsx|csv)$/)) return 'excel'
    if (cleanUrl.match(/\.pdf$/)) return 'pdf'
    if (checkIsImage(url)) return 'image'
    return 'generic'
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'word': return Icon.FileWord
      case 'excel': return Icon.FileExcel
      case 'pdf': return Icon.FilePdf
      case 'image': return Icon.Image
      default: return Icon.FileGeneric
    }
  }

  const getFileNameFromUrl = (url) => {
    try {
        const urlObj = new URL(url)
        const nameParam = urlObj.searchParams.get('name')
        if (nameParam) return decodeURIComponent(nameParam)
        
        let filename = urlObj.pathname.split('/').pop()
        const parts = filename.split('_')
        if (parts.length > 1 && /^\d+$/.test(parts[0])) {
            filename = parts.slice(1).join('_')
        }
        return decodeURIComponent(filename)
    } catch (e) {
        return '附件'
    }
  }

  const handleFileUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setUploading(true)
    try {
        const fileExt = file.name.split('.').pop()
        const randomName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage.from('prompt-results').upload(randomName, file)
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage.from('prompt-results').getPublicUrl(randomName)
        const finalUrl = `${publicUrl}?name=${encodeURIComponent(file.name)}`
        
        setEditingPrompt(prev => ({ ...prev, result_images: [...(prev.result_images || []), finalUrl] }))
        toast.success('上传成功')
    } catch (error) {
        toast.error('上传失败: ' + error.message)
    } finally {
        setUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (index) => {
      setEditingPrompt(prev => {
          const newList = [...(prev.result_images || [])]
          newList.splice(index, 1)
          return { ...prev, result_images: newList }
      })
  }

  const handleSavePrompt = async () => {
    const hasResult = editingPrompt.result_text || (editingPrompt.result_images && editingPrompt.result_images.length > 0)
    
    if (!editingPrompt.title || !editingPrompt.content || !editingPrompt.categoryId || !editingPrompt.desc || !hasResult) {
        return toast.error('请填写完整：标题、分类、场景描述、内容及运行效果均为必填项')
    }

    const isRoot = categories.some(c => c.id === editingPrompt.categoryId)
    if (isRoot) {
        return toast.warning('⚠️ 请选择具体的【二级子分类】。\n一级分类仅用于归档，不能直接存放提示词。')
    }
    
    let tagsArr = []
    if (editingPrompt.tags) tagsArr = Array.isArray(editingPrompt.tags) ? editingPrompt.tags : editingPrompt.tags.split(/[,，]/).map(t => t.trim()).filter(t => t)
    
    const promptData = {
      title: editingPrompt.title, 
      content: editingPrompt.content, 
      desc: editingPrompt.desc || '',
      category_id: editingPrompt.categoryId || '', 
      tags: tagsArr,
      result_text: editingPrompt.result_text || '', 
      result_images: editingPrompt.result_images || [], 
      updated_at: new Date()
    }

    if (editingPrompt.id) {
      const { error } = await supabase.from('prompts').update(promptData).eq('id', editingPrompt.id)
      if(error) toast.error(error.message)
      else toast.success('保存成功')
    } else {
      const { error } = await supabase.from('prompts').insert({ ...promptData, user_id: user.id, like_count: 0 })
      if(error) toast.error(error.message)
      else toast.success('新建成功')
    }
    fetchPrompts()
    setModalMode(null)
  }

  const handleDeletePrompt = async (id) => {
    if (!confirm('确定删除吗？')) return
    await supabase.from('prompts').delete().eq('id', id)
    toast.success('删除成功')
    fetchPrompts()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    toast.success('已退出登录')
  }

  const getFilteredPrompts = () => {
    let list = prompts.filter(p => {
      if (viewMode === 'favorites' && !favorites.includes(p.id)) return false
      if (viewMode === 'my_prompts' && p.user_id !== user?.id) return false
      let matchCat = false
      if (viewMode === 'favorites' || viewMode === 'my_prompts' || selectedId === 'all') matchCat = true
      else {
        const rootCat = categories.find(c => c.id === selectedId)
        if (rootCat) {
          const childIds = rootCat.children?.map(child => child.id) || []
          matchCat = p.category_id === selectedId || childIds.includes(p.category_id)
        } else {
          matchCat = p.category_id === selectedId
        }
      }
      const searchLower = searchQuery.toLowerCase()
      const matchSearch = (p.title + p.content + (p.desc || '')).toLowerCase().includes(searchLower)
      return matchCat && matchSearch
    })
    list.sort((a, b) => {
      if (sortType === 'likes') return (b.like_count || 0) - (a.like_count || 0)
      if (sortType === 'hot') return (b.view_count || 0) - (a.view_count || 0)
      const tA = new Date(a.updated_at).getTime()
      const tB = new Date(b.updated_at).getTime()
      if (sortType === 'time_desc') return tB - tA
      if (sortType === 'name_asc') return a.title.localeCompare(b.title, 'zh')
      return 0
    })
    return list
  }
  
  const getCategoryCount = (catId) => { return prompts.filter(p => p.category_id === catId).length }
  const getValidTags = (rawTags) => {
    if (!rawTags) return []
    const list = Array.isArray(rawTags) ? rawTags : String(rawTags).split(/[,，]/)
    return list.map(t => t.trim()).filter(t => t.length > 0 && t !== '[]')
  }
  const getSelectedCategoryName = (id) => {
    if (!id) return '-- 请选择 --'
    const root = categories.find(c => c.id === id)
    if (root) return `${root.icon || '📂'} ${root.name}`
    for (const cat of categories) {
        const child = cat.children?.find(sub => sub.id === id)
        if (child) return child.name
    }
    return '-- 请选择 --'
  }

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

  const handleQuickAddClick = () => {
    const currentId = editingPrompt.categoryId
    if (!currentId) { setInputState({ mode: 'quick_add_root', value: '', promptTitle: '新建一级分类' }); setModalMode('input'); return }
    const rootCat = categories.find(c => c.id === currentId)
    if (rootCat) { setInputState({ mode: 'quick_add_child', parentId: rootCat.id, value: '', promptTitle: `在【${rootCat.name}】下新建子分类` }); setModalMode('input'); return }
    const isLevel2 = categories.some(c => c.children?.some(sub => sub.id === currentId));
    if (isLevel2) return toast.warning('⚠️ 无法新建：当前已选中二级分类。\n如需新建子分类，请先在下拉框中选中对应的一级父分类。');
  }

  const handleInputConfirm = () => {
    const val = inputState.value.trim()
    if (!val) return toast.warning('名称不能为空')
    const newCats = JSON.parse(JSON.stringify(categories))
    const isDuplicate = (list, name, excludeId = null) => list.some(item => item.name === name && item.id !== excludeId)

    if (inputState.mode === 'quick_add_root') {
        if (isDuplicate(newCats, val)) return toast.error('名称已存在！')
        const newId = Date.now().toString()
        newCats.push({ id: newId, name: val, icon: '📂', children: [] }); saveCategoriesToCloud(newCats); setEditingPrompt(prev => ({ ...prev, categoryId: newId })); setModalMode('prompt'); return
    }
    if (inputState.mode === 'quick_add_child') {
         const parent = newCats.find(c => c.id === inputState.parentId)
         if (parent) {
            if (isDuplicate(parent.children, val)) return toast.error('同名子分类已存在！')
            const newId = Date.now().toString(); parent.children.push({ id: newId, name: val }); saveCategoriesToCloud(newCats); setEditingPrompt(prev => ({ ...prev, categoryId: newId })); setModalMode('prompt'); return
         }
    }
    if (inputState.mode === 'add_root') { if (isDuplicate(newCats, val)) return toast.error('名称已存在！'); newCats.push({ id: Date.now().toString(), name: val, icon: '📂', children: [] }) }
    else if (inputState.mode === 'add_child') { const parent = newCats.find(c => c.id === inputState.parentId); if (parent) { if (isDuplicate(parent.children, val)) return toast.error('同名子分类已存在！'); parent.children.push({ id: Date.now().toString(), name: val }) } }
    else if (inputState.mode === 'rename') {
      const root = newCats.find(c => c.id === inputState.parentId)
      if (inputState.childId) { const child = root.children.find(c => c.id === inputState.childId); if (child) { if (isDuplicate(root.children, val, child.id)) return toast.error('同名分类已存在！'); child.name = val } }
      else { if (root) { if (isDuplicate(newCats, val, root.id)) return toast.error('同名分类已存在！'); root.name = val } }
    }
    saveCategoriesToCloud(newCats); setModalMode('category')
  }

  // --- 核心渲染函数 ---

  const renderHome = () => {
    // 统计计算
    const totalPrompts = prompts.length
    const myPromptsCount = prompts.filter(p => p.user_id === user?.id).length
    
    // 本周新增计算 (全平台)
    const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const weeklyNewCount = prompts.filter(p => new Date(p.created_at) > oneWeekAgo).length
    
    // 全站总点赞
    const platformTotalLikes = prompts.reduce((sum, p) => sum + (p.like_count || 0), 0)

    return (
      <div className="content-area">
        {/* 数据仪表盘 */}
        <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px', paddingLeft: '20px', paddingRight: '20px'}}>
            <div className="stat-card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div><div style={{color:'#64748b', fontSize:'13px', fontWeight:'500'}}>本周新增</div><div style={{fontSize:'24px', fontWeight:'bold', color:'#3b82f6', marginTop:'4px'}}>{weeklyNewCount}</div></div>
                    <div style={{padding:'8px', background:'#eff6ff', borderRadius:'8px', color:'#3b82f6'}}>{Icon.TrendingUp}</div>
                </div>
            </div>
            <div className="stat-card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div><div style={{color:'#64748b', fontSize:'13px', fontWeight:'500'}}>我的贡献</div><div style={{fontSize:'24px', fontWeight:'bold', color:'#10b981', marginTop:'4px'}}>{myPromptsCount}</div></div>
                    <div style={{padding:'8px', background:'#ecfdf5', borderRadius:'8px', color:'#10b981'}}>{Icon.Edit}</div>
                </div>
            </div>
            <div className="stat-card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div><div style={{color:'#64748b', fontSize:'13px', fontWeight:'500'}}>全站点赞</div><div style={{fontSize:'24px', fontWeight:'bold', color:'#ef4444', marginTop:'4px'}}>{platformTotalLikes}</div></div>
                    <div style={{padding:'8px', background:'#fef2f2', borderRadius:'8px', color:'#ef4444'}}>{Icon.ThumbsUpFill}</div>
                </div>
            </div>
            <div className="stat-card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div><div style={{color:'#64748b', fontSize:'13px', fontWeight:'500'}}>总收录</div><div style={{fontSize:'24px', fontWeight:'bold', color:'#8b5cf6', marginTop:'4px'}}>{totalPrompts}</div></div>
                    <div style={{padding:'8px', background:'#f5f3ff', borderRadius:'8px', color:'#8b5cf6'}}>{Icon.Award}</div>
                </div>
            </div>
        </div>

        <h2 style={{fontSize:'20px', fontWeight:'bold', marginBottom:'20px', paddingLeft:'20px'}}>📚 提示词分类</h2>
        <div className="dashboard-grid">
          <div className="stack-card" onClick={() => { setSelectedId('all'); setViewMode('list') }}>
              <div className="stack-icon">🏠</div>
              <div className="stack-title">全部提示词</div>
              <div className="stack-count">{prompts.length} 个</div>
          </div>
          {categories.map(cat => {
              let count = getCategoryCount(cat.id); cat.children.forEach(sub => { count += getCategoryCount(sub.id) });
              return (
                  <div key={cat.id} className="stack-card" onClick={() => { setSelectedId(cat.children?.[0]?.id || cat.id); setExpandedCats(prev => ({...prev, [cat.id]: true})); setViewMode('list') }}>
                      <div className="stack-icon">{cat.icon || '📂'}</div>
                      <div className="stack-title">{cat.name}</div>
                      <div className="stack-count">{count} 个</div>
                  </div>
              )
          })}
        </div>
      </div>
    )
  }

  const renderAdminPanel = () => (
    <div className="content-area">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2 style={{fontSize:'20px', fontWeight:'bold'}}>🛡️ 用户管理</h2>
        <button className="btn-small" onClick={fetchUsers}>刷新列表</button>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
            <thead><tr><th>用户邮箱</th><th>昵称</th><th>注册时间</th><th>角色</th><th>操作</th></tr></thead>
            <tbody>
                {usersList.map(u => (
                    <tr key={u.id}>
                        <td>{u.email}</td><td>{u.nickname || '-'}</td><td>{new Date(u.created_at).toLocaleString()}</td><td><span className={u.role === 'admin' ? 'badge-admin' : 'badge-user'}>{u.role === 'admin' ? '管理员' : '普通用户'}</span></td>
                        <td style={{display:'flex', gap:'10px'}}><button className="btn-small" style={{color: u.role === 'admin' ? '#d97706' : '#2563eb', borderColor: u.role === 'admin' ? '#fcd34d' : '#bfdbfe', background: u.role === 'admin' ? '#fffbeb' : '#eff6ff'}} onClick={() => handleToggleAdmin(u.id, u.role)}>{u.role === 'admin' ? '降级' : '提权'}</button><button className="btn-small" style={{color: 'red', borderColor: '#fee2e2', background: '#fef2f2'}} onClick={() => handleDeleteUser(u.id)}>删除</button></td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  )

  const renderListView = () => (
    <div className="content-area">
        <div className="grid">
        {getFilteredPrompts().map(p => {
            const validTags = getValidTags(p.tags)
            const hasEffect = p.result_text || (p.result_images && p.result_images.length > 0)
            return (
            <div key={p.id} className="card" style={{position: 'relative'}}>
                {/* 顶部右上角 */}
                <div style={{position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10}}>
                    {hasEffect && <span style={{background:'#ecfdf5', color:'#059669', fontSize:'11px', padding:'2px 6px', borderRadius:'4px', border:'1px solid #a7f3d0', fontWeight:'500'}}>已验证</span>}
                    <div 
                        onClick={(e) => toggleLike(e, p)} 
                        style={{cursor: 'pointer', color: likedIds.includes(p.id) ? '#ef4444' : '#d1d5db', display:'flex', alignItems:'center', gap:'2px', fontSize:'12px', fontWeight:'500'}}
                        title={likedIds.includes(p.id) ? "取消点赞" : "点赞"}
                    >
                        {likedIds.includes(p.id) ? Icon.ThumbsUpFill : Icon.ThumbsUp} <span>{p.like_count || 0}</span>
                    </div>
                    <div onClick={(e) => toggleFavorite(e, p)} style={{cursor: 'pointer', color: favorites.includes(p.id) ? '#f59e0b' : '#d1d5db', display:'flex'}} title={favorites.includes(p.id) ? "取消收藏" : "收藏"}>{favorites.includes(p.id) ? Icon.StarFill : Icon.Star}</div>
                </div>

                <div className="card-header">
                    <div className="card-title" onClick={() => handleViewDetails(p, false)} title={p.title} style={{paddingRight: '100px'}}>{p.title}</div>
                </div>
                
                {validTags.length > 0 && <div className="tags" style={{marginTop:'5px'}}>{validTags.map((t, i) => <span key={i} className="tag">{t}</span>)}</div>}
                <div className="card-body" onClick={() => handleViewDetails(p, false)} title="点击查看详情">{p.content}</div>
                
                {/* ✨ 核心修复：Footer 允许换行 + 左侧自然撑开 + 右侧自动靠右 ✨ */}
                <div className="card-footer" style={{
                    display:'flex', 
                    flexWrap:'wrap', 
                    alignItems:'center', 
                    justifyContent:'space-between', 
                    gap:'10px', 
                    paddingTop:'10px'
                }}>
                    {/* 左侧：信息区 (自然宽度) */}
                    <div style={{
                        display:'flex', 
                        alignItems:'center', 
                        gap:'8px', 
                        color:'#6b7280', 
                        fontSize:'12px',
                    }}>
                        <div style={{display:'flex', alignItems:'center', gap:'4px'}} title={`作者: ${p.profiles?.nickname || '匿名'}`}>
                            <span style={{flexShrink:0}}>👤</span><span>{p.profiles?.nickname || '匿名'}</span>
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:'4px', flexShrink:0}} title="浏览次数">{Icon.Eye} {p.view_count || 0}</div>
                        {(user.id === p.user_id || isAdmin) && (<div style={{display:'flex', gap:'8px', marginLeft:'4px', flexShrink:0}}><button className="btn-icon" title="编辑" onClick={() => { setEditingPrompt({ ...p, categoryId: p.category_id || '', tags: getValidTags(p.tags).join(', '), result_text: p.result_text, result_images: p.result_images, desc: p.desc }); setModalMode('prompt') }}>{Icon.Edit}</button><button className="btn-icon delete" title="删除" onClick={() => handleDeletePrompt(p.id)}>{Icon.Delete}</button></div>)}
                    </div>
                    
                    {/* 右侧：按钮区 (marginLeft: auto 实现自动靠右对齐) */}
                    <div style={{
                        display:'flex', 
                        gap:'8px', 
                        flexShrink:0,
                        marginLeft: 'auto' 
                    }}>
                       {hasEffect && <button className="btn-small" style={{backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', display:'flex', alignItems:'center', gap:'4px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', whiteSpace: 'nowrap', height: '32px'}} onClick={(e) => {e.stopPropagation(); handleViewDetails(p, true)}}>效果展示</button>}
                       <button className="btn-copy" style={{whiteSpace: 'nowrap', height: '32px'}} onClick={() => {navigator.clipboard.writeText(p.content); toast.success('复制成功')}}>{Icon.Copy} 复制</button>
                    </div>
                </div>
            </div>
            )
        })}
        {viewMode === 'list' && (<div className="card" onClick={() => { setEditingPrompt({ title: '', content: '', desc: '', tags: '', categoryId: selectedId !== 'all' ? selectedId : '', result_text: '', result_images: [] }); setModalMode('prompt'); }} style={{minHeight: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e5e7eb', borderRadius: '12px', cursor: 'pointer', color: '#9ca3af', backgroundColor: '#f9fafb', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.backgroundColor = '#eff6ff'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.backgroundColor = '#f9fafb'; }}><div style={{fontSize: '40px', lineHeight: '40px', fontWeight: '300'}}>+</div><div style={{fontSize: '14px', marginTop: '10px', fontWeight: '500'}}>新建提示词</div></div>)}
        </div>
        {getFilteredPrompts().length === 0 && viewMode !== 'list' && <div style={{textAlign:'center', color:'#9ca3af', marginTop:'100px'}}>暂无内容</div>}
    </div>
  )

  // --- 渲染组件 ---
  if (loading) return <div style={{display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', color:'#6b7280'}}>Loading...</div>

  // 区分普通详情弹窗 vs 效果对比弹窗
  return (
    <div className="app-container">
      {/* 侧边栏 */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="brand"><div className="logo-box">P</div>提示词库</div>
          {isAdmin && <button className="btn-setting" onClick={() => setModalMode('category')} title="分类管理">{Icon.Settings}</button>}
        </div>
        <div className="sidebar-content">
          <div className={`menu-item ${viewMode === 'home' ? 'active' : ''}`} onClick={() => setViewMode('home')}><div style={{display:'flex', gap:'10px'}}><span>📊</span> 首页</div></div>
          {isAdmin && (<div className={`menu-item ${viewMode === 'admin' ? 'active' : ''}`} onClick={() => { setViewMode('admin'); fetchUsers(); }}><div style={{display:'flex', gap:'10px'}}><span>🛡️</span> 用户管理</div></div>)}
          <div style={{borderTop:'1px solid #eee', margin:'10px 0'}}></div>
          <div className={`menu-item ${viewMode === 'list' && selectedId === 'all' ? 'active' : ''}`} onClick={() => { setSelectedId('all'); setViewMode('list') }}><div style={{display:'flex', gap:'10px'}}><span>🏠</span> 全部提示词</div></div>
          <div className={`menu-item ${viewMode === 'my_prompts' ? 'active' : ''}`} onClick={() => { setViewMode('my_prompts'); setSelectedId('all'); }}><div style={{display:'flex', gap:'10px', color: viewMode === 'my_prompts' ? '#2563eb' : 'inherit'}}><span>📝</span> 我的发布</div></div>
          <div className={`menu-item ${viewMode === 'favorites' ? 'active' : ''}`} onClick={() => { setViewMode('favorites'); setSelectedId('all'); }}><div style={{display:'flex', gap:'10px', color: viewMode === 'favorites' ? '#b45309' : 'inherit'}}><span style={{color: '#f59e0b'}}>⭐</span> 我的收藏</div></div>
          <div style={{fontSize:'12px', color:'#9ca3af', fontWeight:'bold', margin:'20px 0 5px 12px'}}>场景分类</div>
          {categories.map(cat => {
            const hasActiveChild = cat.children?.some(child => child.id === selectedId); const isExpanded = expandedCats[cat.id] || hasActiveChild
            return (
              <div key={cat.id}>
                <div className={`menu-item ${selectedId === cat.id ? 'active' : ''}`} onClick={() => { setSelectedId(cat.id); setViewMode('list'); setExpandedCats(prev => ({...prev, [cat.id]: !prev[cat.id]})) }}><div style={{display:'flex', gap:'8px'}}><span>{cat.icon || '📂'}</span> {cat.name}</div><span style={{fontSize:'10px', color:'#ccc'}}>{isExpanded ? '▼' : '▶'}</span></div>
                {isExpanded && (<div className="submenu">{cat.children?.map(child => (<div key={child.id} className={`submenu-item ${selectedId === child.id ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setSelectedId(child.id); setViewMode('list') }}>{child.name}</div>))}</div>)}
              </div>
            )
          })}
        </div>
        <div style={{padding:'15px', textAlign:'center', fontSize:'12px', color:'#9ca3af', borderTop:'1px solid #e5e7eb'}}><div style={{marginBottom:'5px', fontWeight:600}}>{isAdmin ? '管理员' : '普通用户'}</div><div style={{marginBottom:'5px', overflow:'hidden', textOverflow:'ellipsis'}}>{user?.email}</div><button onClick={handleLogout} style={{color:'#ef4444', border:'none', background:'none', cursor:'pointer'}}>退出登录</button></div>
      </div>

      {/* 主内容区域 */}
      <div className="main">
        <header className="header">
          <div className="header-title">
             {viewMode === 'home' && '首页'}
             {viewMode === 'admin' && '系统管理'}
             {viewMode === 'favorites' && '⭐ 我的收藏'}
             {viewMode === 'my_prompts' && '📝 我的发布'}
             {viewMode === 'list' && (selectedId === 'all' ? '全部提示词' : categories.flatMap(c => c.children).find(c => c.id === selectedId)?.name || categories.find(c => c.id === selectedId)?.name || '筛选结果')}
          </div>
          {(viewMode === 'list' || viewMode === 'favorites' || viewMode === 'home' || viewMode === 'my_prompts') && (
            <div className="toolbar">
                <div className="search-box" style={{display:'flex', alignItems:'center', border:'1px solid #e5e7eb', borderRadius:'8px', padding:'6px 12px', background:'white', width: '300px', gap:'8px'}}><input type="text" className="search-input" placeholder="搜索..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); if (viewMode === 'home' && e.target.value.trim() !== '') { setViewMode('list'); setSelectedId('all'); } }} style={{border:'none', outline:'none', flex:1, fontSize:'14px', color:'#374151'}} /><div style={{color:'#9ca3af', display:'flex'}}>{Icon.Search}</div></div>
                {viewMode !== 'home' && (<select className="sort-select" value={sortType} onChange={e => setSortType(e.target.value)}><option value="time_desc">🕒 最新修改</option><option value="likes">👍 最多点赞</option><option value="hot">🔥 最多查看</option><option value="name_asc">🔤 名称 (A-Z)</option></select>)}
                <button className="btn-primary" onClick={() => { setEditingPrompt({ title: '', content: '', desc: '', tags: '', categoryId: selectedId !== 'all' ? selectedId : '', result_text: '', result_images: [] }); setModalMode('prompt') }}>{Icon.Plus} 新建</button>
            </div>
          )}
        </header>
        {viewMode === 'home' && renderHome()}
        {viewMode === 'admin' && renderAdminPanel()}
        {(viewMode === 'list' || viewMode === 'favorites' || viewMode === 'my_prompts') && renderListView()}
      </div>

      {/* 弹窗：编辑/新建 */}
      {modalMode === 'prompt' && (
        <div className="modal-overlay">
          <div className="modal-large">
            <div className="modal-header"><span className="modal-title">{editingPrompt.id ? '编辑提示词' : '新建提示词'}</span><span className="modal-close-btn" onClick={() => setModalMode(null)}>×</span></div>
            <div className="modal-body">
                <div style={{display:'flex', gap:'20px', marginBottom:'20px'}}>
                  <div style={{flex:2}}><label className="form-label">标题 <span style={{color:'red'}}>*</span></label><input className="form-input" value={editingPrompt.title} onChange={e => setEditingPrompt({...editingPrompt, title: e.target.value})} placeholder="输入标题..." /></div>
                  <div style={{flex:1}}>
                      <label className="form-label">分类 <span style={{color:'red'}}>*</span></label>
                      <div style={{display:'flex', gap:'8px', alignItems:'stretch'}}>
                          <div style={{position: 'relative', flex: 1}}>
                              <div className="form-select" style={{pointerEvents: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff'}}><span>{getSelectedCategoryName(editingPrompt.categoryId)}</span><span style={{color:'#6b7280'}}>{Icon.ChevronDown}</span></div>
                              <select value={editingPrompt.categoryId} onChange={e => setEditingPrompt({...editingPrompt, categoryId: e.target.value})} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}}><option value="">-- 请选择 --</option>{categories.map(c => [<option key={c.id} value={c.id} style={{fontWeight:'bold', color:'#111827'}}>{c.icon || '📂'} {c.name}</option>,...c.children.map(sub => (<option key={sub.id} value={sub.id} style={{color:'#4b5563'}}>&nbsp;&nbsp;&nbsp;&nbsp;└ {sub.name}</option>))])}</select>
                          </div>
                          <button className="btn-icon" style={{border:'1px solid #d1d5db', borderRadius:'6px', width:'38px', height:'38px', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9fafb'}} onClick={handleQuickAddClick} title="快速新建分类">{Icon.Plus}</button>
                      </div>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">使用场景描述 <span style={{color:'red'}}>*</span></label><input className="form-input" value={editingPrompt.desc} onChange={e => setEditingPrompt({...editingPrompt, desc: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">标签</label><input className="form-input" value={editingPrompt.tags} onChange={e => setEditingPrompt({...editingPrompt, tags: e.target.value})} /></div>
                <div className="form-group" style={{flex:1, display:'flex', flexDirection:'column', marginBottom:0}}><label className="form-label">内容 <span style={{color:'red'}}>*</span></label><textarea className="form-textarea" value={editingPrompt.content} onChange={e => setEditingPrompt({...editingPrompt, content: e.target.value})}></textarea></div>
                <div style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #e5e7eb'}}>
                  <label className="form-label" style={{display:'flex', alignItems:'center', gap:'8px'}}>{Icon.Beaker} 运行效果/附件 <span style={{color:'red'}}>*</span></label>
                  <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                    <textarea className="form-textarea" placeholder="在此记录运行结果、模型回复摘要或使用心得..." style={{height:'60px', fontSize:'13px'}} value={editingPrompt.result_text || ''} onChange={e => setEditingPrompt({...editingPrompt, result_text: e.target.value})}></textarea>
                    <div style={{display:'flex', flexWrap:'wrap', gap:'10px'}}>
                        {editingPrompt.result_images && editingPrompt.result_images.map((url, idx) => {
                            const fileType = getFileType(url)
                            const fileName = getFileNameFromUrl(url)
                            return (
                                <div key={idx} style={{width:'80px', height:'80px', borderRadius:'8px', overflow:'hidden', position:'relative', border:'1px solid #e5e7eb', background:'#f9fafb'}}>
                                    {fileType === 'image' ? (
                                        <img src={url} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                    ) : (
                                        <div style={{width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'4px', textAlign:'center'}}>
                                            {getFileIcon(fileType)}
                                            {/* ✨ 文件名截断显示，防止溢出 */}
                                            <span style={{fontSize:'10px', color:'#6b7280', marginTop:'4px', lineHeight:1.1, wordBreak:'break-all', maxHeight:'22px', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical'}}>{fileName}</span>
                                        </div>
                                    )}
                                    <div onClick={() => handleRemoveFile(idx)} style={{position:'absolute', top:2, right:2, background:'rgba(0,0,0,0.5)', color:'white', borderRadius:'50%', width:'18px', height:'18px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>
                                </div>
                            )
                        })}
                        <div style={{width:'80px', height:'80px', borderRadius:'8px', border:'2px dashed #d1d5db', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#9ca3af', background: uploading ? '#f3f4f6' : '#fff'}} onClick={() => !uploading && fileInputRef.current?.click()}>
                            {uploading ? (<span style={{fontSize:'10px'}}>上传中...</span>) : (<><span style={{marginBottom:'2px'}}>{Icon.Plus}</span><span style={{fontSize:'10px'}}>添加</span></>)}
                        </div>
                        <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={handleFileUpload} />
                    </div>
                  </div>
                </div>
            </div>
            <div className="modal-footer"><button className="btn-cancel" onClick={() => setModalMode(null)}>取消</button><button className="btn-primary" onClick={handleSavePrompt} disabled={uploading}>{uploading ? '保存中...' : '保存'}</button></div>
          </div>
        </div>
      )}

      {/* 弹窗：查看详情 */}
      {modalMode === 'view' && viewingPrompt && (
        <div className="modal-overlay">
          <div className={isEffectView ? "modal-xlarge" : "modal-large"} style={isEffectView ? {maxWidth: '90vw', width: '1200px'} : {}}>
            <div className="modal-header">
                <span className="modal-title" style={{maxWidth:'80%'}}>{viewingPrompt.title}</span>
                <span className="modal-close-btn" onClick={() => setModalMode(null)}>×</span>
            </div>
            
            {/* 模式一：对比模式 */}
            {isEffectView ? (
                <div className="modal-body" style={{display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0}}>
                    <div className="split-container" style={{display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'row'}}>
                        {/* 左边 */}
                        <div style={{flex: 1, overflowY: 'auto', padding: '24px', borderRight: '1px solid #e5e7eb', background: '#f8fafc'}}>
                            <div style={{fontSize:'12px', fontWeight:'bold', color:'#64748b', marginBottom:'12px', letterSpacing:'0.05em'}}>INPUT / 提示词</div>
                            <div style={{whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#334155', fontSize: '15px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'}}>{viewingPrompt.content}</div>
                        </div>
                        {/* 右边 */}
                        <div style={{flex: 1, overflowY: 'auto', padding: '24px', background: '#fff'}}>
                            <div style={{fontSize:'12px', fontWeight:'bold', color:'#059669', marginBottom:'12px', letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:'6px'}}>
                                {Icon.Beaker} OUTPUT / 运行结果
                            </div>
                            {viewingPrompt.result_text && <div style={{fontSize:'15px', color:'#374151', marginBottom: '20px', whiteSpace:'pre-wrap', lineHeight: 1.6}}>{viewingPrompt.result_text}</div>}
                            {viewingPrompt.result_images && viewingPrompt.result_images.length > 0 && (
                                <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap:'16px'}}>
                                    {viewingPrompt.result_images.map((url, idx) => {
                                        const fileType = getFileType(url)
                                        const fileName = getFileNameFromUrl(url)
                                        return (
                                            <div key={idx} style={{marginBottom:'10px'}}>
                                                {fileType === 'image' ? (
                                                    <img src={url} style={{width:'100%', height:'auto', borderRadius:'8px', border:'1px solid #e5e7eb', cursor:'zoom-in'}} onClick={() => window.open(url, '_blank')} />
                                                ) : (
                                                    <a href={url} target="_blank" rel="noopener noreferrer" style={{display:'flex', alignItems:'center', gap:'8px', padding:'12px', background:'white', border:'1px solid #e5e7eb', borderRadius:'8px', textDecoration:'none', color:'#374151', fontSize:'14px', fontWeight:500}}>
                                                        {getFileIcon(fileType)}<span>{fileName}</span>
                                                    </a>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* 模式二：普通详情模式 */
                <>
                    <div className="modal-body">
                        <div className="view-meta">
                            <span style={{background:'#f3f4f6', padding:'4px 8px', borderRadius:'4px', fontSize:'12px'}}>📂 {categories.flatMap(c => c.children).find(sub => sub.id === viewingPrompt.category_id)?.name || '未分类'}</span>
                            {getValidTags(viewingPrompt.tags).length > 0 && <span style={{background:'#eff6ff', color:'#2563eb', padding:'4px 8px', borderRadius:'4px', fontSize:'12px'}}>🏷️ {getValidTags(viewingPrompt.tags).join(', ')}</span>}
                        </div>
                        {viewingPrompt.desc && <div style={{fontSize:'13px', color:'#1e40af', background:'#eff6ff', padding:'12px', borderRadius:'8px', marginBottom:'20px'}}>ℹ️ {viewingPrompt.desc}</div>}
                        <div className="view-content-box">{viewingPrompt.content}</div>
                        
                        {(viewingPrompt.result_text || (viewingPrompt.result_images && viewingPrompt.result_images.length > 0)) && (
                          <div style={{marginTop:'20px', padding:'15px', border:'1px solid #d1fae5', background:'#ecfdf5', borderRadius:'8px'}}>
                            <div style={{fontWeight:'bold', color:'#047857', marginBottom:'10px', display:'flex', alignItems:'center', gap:'6px'}}>{Icon.Beaker} 运行效果验证</div>
                            {viewingPrompt.result_text && <div style={{fontSize:'14px', color:'#065f46', marginBottom: '10px', whiteSpace:'pre-wrap'}}>{viewingPrompt.result_text}</div>}
                            {viewingPrompt.result_images && viewingPrompt.result_images.map((url, i) => {
                                const fType = getFileType(url)
                                return fType === 'image' ? <img key={i} src={url} style={{maxWidth:'100%', maxHeight:'200px', margin:'5px 5px 0 0', borderRadius:'4px'}} /> : <div key={i} style={{fontSize:'12px', color:'#059669', marginBottom:'4px', display:'flex', alignItems:'center', gap:'4px'}}>{getFileIcon(fType)} {getFileNameFromUrl(url)}</div>
                            })}
                          </div>
                        )}

                        <div style={{marginTop:'30px', borderTop:'1px solid #eee', paddingTop:'20px'}}>
                            <div style={{textAlign:'center', marginBottom:'15px', fontSize:'14px', color:'#6b7280', fontWeight:500}}>🚀 一键复制并跳转使用</div>
                            <div style={{display:'flex', gap:'15px', justifyContent:'center', flexWrap:'wrap'}}>
                            {AI_MODELS.map(model => (
                                <div key={model.name} onClick={() => handleModelJump(model.url)} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'5px', cursor:'pointer', width:'60px'}}>
                                    <div style={{width:'40px', height:'40px', borderRadius:'50%', background: model.color, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'bold', boxShadow:'0 2px 5px rgba(0,0,0,0.1)'}}>{model.name[0]}</div>
                                    <span style={{fontSize:'12px', color:'#4b5563'}}>{model.name}</span>
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                       {(user.id === viewingPrompt.user_id || isAdmin) && <button className="btn-cancel" onClick={() => { setEditingPrompt({ ...viewingPrompt, categoryId: viewingPrompt.category_id, tags: getValidTags(viewingPrompt.tags).join(', '), result_text: viewingPrompt.result_text, result_images: viewingPrompt.result_images }); setModalMode('prompt') }}>✎ 编辑</button>}
                       <button className="btn-primary" onClick={() => {navigator.clipboard.writeText(viewingPrompt.content); toast.success('复制成功')}}>复制内容</button>
                    </div>
                </>
            )}
          </div>
        </div>
      )}

      {/* 弹窗：分类管理 */}
      {modalMode === 'category' && (
        <div className="modal-overlay">
          <div className="modal-large" style={{width:'600px', height:'700px'}}>
            <div className="modal-header"><span className="modal-title">分类管理</span><span className="modal-close-btn" onClick={() => setModalMode(null)}>×</span></div>
            <div className="modal-body" style={{display:'flex', flexDirection:'column'}}>
                <div style={{marginBottom:'20px', display:'flex', gap:'10px'}}>
                <button className="btn-primary" style={{padding:'0 16px', fontSize:'12px', height:'32px'}} onClick={() => { setInputState({ mode: 'add_root', value: '', promptTitle: '新建一级分类' }); setModalMode('input') }}>+ 新增一级分类</button>
                <div style={{flex:1, textAlign:'right', fontSize:'12px', color:'#9ca3af'}}>按住 ☰ 拖拽排序</div>
                </div>
                <div className="cat-list">
                {categories.map((cat, catIndex) => (
                    <div key={cat.id} className="cat-item" draggable onDragStart={(e) => handleDragStart(e, { type: 'root', index: catIndex })} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, { type: 'root', index: catIndex })}>
                        <div className="cat-header"><span className="cat-drag-handle">☰</span><span className="cat-name">{cat.icon || '📂'} {cat.name}</span>
                        <div className="cat-actions">
                            <button className="btn-icon" onClick={() => { setInputState({ mode: 'add_child', parentId: cat.id, value: '', promptTitle: '新建子分类' }); setModalMode('input') }}>＋</button>
                            <button className="btn-icon" onClick={() => { setInputState({ mode: 'rename', parentId: cat.id, value: cat.name, promptTitle: '重命名分类' }); setModalMode('input') }}>✎</button>
                            <button className="btn-icon delete" onClick={() => handleDeleteCategory('root', cat.id)} title="删除分类">{Icon.Delete}</button>
                        </div></div>
                        <div className="sub-list">{cat.children.map((sub, subIndex) => (<div key={sub.id} className="sub-item" draggable onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, { type: 'child', index: subIndex, parentId: cat.id }) }} onDragOver={handleDragOver} onDrop={(e) => { e.stopPropagation(); handleDrop(e, { type: 'child', index: subIndex, parentId: cat.id }) }}><span className="cat-drag-handle">☰</span><span className="cat-name">{sub.name}</span><div className="cat-actions">
                            <button className="btn-icon" onClick={() => { setInputState({ mode: 'rename', parentId: cat.id, childId: sub.id, value: sub.name, promptTitle: '重命名分类' }); setModalMode('input') }}>✎</button>
                            <button className="btn-icon delete" onClick={() => handleDeleteCategory('child', sub.id, cat.id)} title="删除子分类">{Icon.Delete}</button>
                        </div></div>))}</div>
                    </div>
                ))}
                </div>
            </div>
            <div className="modal-footer"><button className="btn-primary" onClick={() => setModalMode(null)}>完成</button></div>
          </div>
        </div>
      )}

      {/* 弹窗：输入名称 */}
      {modalMode === 'input' && (
        <div className="modal-overlay">
          <div className="modal-normal">
            <div className="modal-header">
                <span className="modal-title">{inputState.promptTitle || '请输入名称'}</span>
                <span className="modal-close-btn" onClick={() => setModalMode((inputState.mode.startsWith('quick_') ? 'prompt' : 'category'))}>×</span>
            </div>
            <div className="modal-body" style={{overflow:'visible'}}><div className="form-group"><input className="form-input" autoFocus value={inputState.value} onChange={e => setInputState({...inputState, value: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleInputConfirm()} /></div></div>
            <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setModalMode((inputState.mode.startsWith('quick_') ? 'prompt' : 'category'))}>取消</button>
                <button className="btn-primary" onClick={handleInputConfirm}>确定</button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .stat-card {
            background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: transform 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .modal-close-btn {
            width: 36px; height: 36px; border-radius: 50%; background: #f1f5f9;
            display: flex; align-items: center; justify-content: center;
            font-size: 24px; color: #475569; cursor: pointer; transition: all 0.2s; font-weight: bold;
        }
        .modal-close-btn:hover { background: #e2e8f0; color: #ef4444; }

        @media (max-width: 768px) {
            .split-container { flex-direction: column !important; }
            .modal-xlarge { width: 95vw !important; height: 90vh !important; }
        }
      `}</style>
    </div>
  )
}