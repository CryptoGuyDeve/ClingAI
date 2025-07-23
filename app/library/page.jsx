'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import Link from 'next/link';
import moment from 'moment';
import { Star, Archive, Pin, Tag, Pencil } from 'lucide-react';

export default function LibraryPage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState('All');
  const [folders, setFolders] = useState([]);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingTagsId, setEditingTagsId] = useState(null);
  const [folderInput, setFolderInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    const fetchChats = async () => {
      const { data: libraries } = await supabase
        .from('Library')
        .select('libId, searchInput, created_at, folder, tags, isPinned, isStarred, isArchived')
        .order('created_at', { ascending: false });
      if (!libraries) return setLoading(false);
      // For each library, fetch the latest chat
      const chatPreviews = await Promise.all(libraries.map(async lib => {
        const { data: chats } = await supabase
          .from('Chats')
          .select('aiResp, created_at')
          .eq('libId', lib.libId)
          .order('created_at', { ascending: false })
          .limit(1);
        return {
          ...lib,
          lastAiResp: chats?.[0]?.aiResp || '',
          lastChatAt: chats?.[0]?.created_at || lib.created_at
        };
      }));
      setChats(chatPreviews);
      // Collect unique folders
      const uniqueFolders = Array.from(new Set(chatPreviews.map(c => c.folder).filter(Boolean)));
      setFolders(uniqueFolders);
      setLoading(false);
    };
    fetchChats();
  }, []);

  // Pin/star/archive actions
  const toggleField = async (libId, field) => {
    const chat = chats.find(c => c.libId === libId);
    if (!chat) return;
    const newValue = !chat[field];
    await supabase.from('Library').update({ [field]: newValue }).eq('libId', libId);
    setChats(chats => chats.map(c => c.libId === libId ? { ...c, [field]: newValue } : c));
  };

  // Save folder
  const saveFolder = async (libId) => {
    await supabase.from('Library').update({ folder: folderInput }).eq('libId', libId);
    setChats(chats => chats.map(c => c.libId === libId ? { ...c, folder: folderInput } : c));
    setEditingFolderId(null);
  };
  // Save tags
  const saveTags = async (libId) => {
    const tagsArr = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    await supabase.from('Library').update({ tags: tagsArr }).eq('libId', libId);
    setChats(chats => chats.map(c => c.libId === libId ? { ...c, tags: tagsArr } : c));
    setEditingTagsId(null);
  };

  // Filter chats by search, folder, and not archived
  const filteredChats = chats.filter(chat =>
    !chat.isArchived &&
    (folderFilter === 'All' || chat.folder === folderFilter) &&
    (chat.searchInput.toLowerCase().includes(search.toLowerCase()) ||
      chat.lastAiResp.toLowerCase().includes(search.toLowerCase()))
  );
  // Pinned/starred at top
  const sortedChats = [
    ...filteredChats.filter(c => c.isPinned),
    ...filteredChats.filter(c => !c.isPinned)
  ];

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Chats</h1>
      {/* Folder filter and search bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
        <select
          value={folderFilter}
          onChange={e => setFolderFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-sm w-full md:w-auto"
        >
          <option value="All">All Folders</option>
          {folders.map(folder => (
            <option key={folder} value={folder}>{folder}</option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search chats..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-sm transition"
        />
      </div>
      {loading && <div>Loading...</div>}
      {!loading && sortedChats.length === 0 && <div className="text-gray-400">No chats found.</div>}
      <div className="space-y-4">
        {sortedChats.map(chat => (
          <div key={chat.libId} className="relative group bg-white border border-gray-200 rounded-lg p-4 hover:shadow transition">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-lg text-gray-900 truncate">{chat.searchInput}</span>
              <span className="text-xs text-gray-500">{moment(chat.lastChatAt).fromNow()}</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center mb-2">
              {/* Tags */}
              {editingTagsId === chat.libId ? (
                <>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    placeholder="tag1, tag2"
                    className="px-2 py-1 rounded border border-gray-300 text-xs mr-2"
                    autoFocus
                  />
                  <button onClick={() => saveTags(chat.libId)} className="text-blue-600 text-xs font-semibold mr-1">Save</button>
                  <button onClick={() => setEditingTagsId(null)} className="text-gray-400 text-xs">Cancel</button>
                </>
              ) : (
                <>
                  {chat.tags && chat.tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium"><Tag className="w-3 h-3 mr-1" />{tag}</span>
                  ))}
                  <button onClick={() => { setEditingTagsId(chat.libId); setTagsInput((chat.tags || []).join(', ')); }} className="ml-1 text-gray-400 hover:text-blue-500" title="Edit tags"><Pencil className="w-4 h-4" /></button>
                </>
              )}
              {/* Folder */}
              {editingFolderId === chat.libId ? (
                <>
                  <input
                    type="text"
                    value={folderInput}
                    onChange={e => setFolderInput(e.target.value)}
                    placeholder="Folder name"
                    className="px-2 py-1 rounded border border-gray-300 text-xs mr-2"
                    autoFocus
                  />
                  <button onClick={() => saveFolder(chat.libId)} className="text-blue-600 text-xs font-semibold mr-1">Save</button>
                  <button onClick={() => setEditingFolderId(null)} className="text-gray-400 text-xs">Cancel</button>
                </>
              ) : chat.folder ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                  <Pin className="w-3 h-3 mr-1" />{chat.folder}
                  <button onClick={() => { setEditingFolderId(chat.libId); setFolderInput(chat.folder); }} className="ml-1 text-gray-400 hover:text-blue-500" title="Edit folder"><Pencil className="w-4 h-4" /></button>
                </span>
              ) : (
                <button onClick={() => { setEditingFolderId(chat.libId); setFolderInput(''); }} className="text-gray-400 hover:text-blue-500 text-xs ml-1" title="Add folder"><Pin className="w-3 h-3" /> <Pencil className="w-4 h-4 ml-1" /></button>
              )}
            </div>
            <Link href={`/search/${chat.libId}`} className="block text-gray-600 text-sm line-clamp-2 mb-2 hover:underline">
              {chat.lastAiResp || <span className="italic text-gray-400">No AI response yet</span>}
            </Link>
            <div className="flex gap-2 absolute top-4 right-4 opacity-80 group-hover:opacity-100 transition">
              <button onClick={() => toggleField(chat.libId, 'isPinned')} title="Pin">
                <Pin className={`w-5 h-5 ${chat.isPinned ? 'text-blue-500' : 'text-gray-400'}`} />
              </button>
              <button onClick={() => toggleField(chat.libId, 'isStarred')} title="Star">
                <Star className={`w-5 h-5 ${chat.isStarred ? 'text-yellow-400' : 'text-gray-400'}`} />
              </button>
              <button onClick={() => toggleField(chat.libId, 'isArchived')} title="Archive">
                <Archive className={`w-5 h-5 ${chat.isArchived ? 'text-red-400' : 'text-gray-400'}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 