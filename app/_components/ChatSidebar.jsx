import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import Link from 'next/link';
import { Pin, Tag, Pencil } from 'lucide-react';

export default function ChatSidebar() {
  const [chats, setChats] = useState([]);
  const [folders, setFolders] = useState([]);
  const [folderFilter, setFolderFilter] = useState('All');
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingTagsId, setEditingTagsId] = useState(null);
  const [folderInput, setFolderInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    const fetchChats = async () => {
      const { data: libraries } = await supabase
        .from('Library')
        .select('libId, searchInput, folder, tags, isPinned, isStarred, isArchived')
        .order('created_at', { ascending: false });
      if (!libraries) return;
      const chatPreviews = await Promise.all(libraries.map(async lib => {
        const { data: chats } = await supabase
          .from('Chats')
          .select('aiResp')
          .eq('libId', lib.libId)
          .order('created_at', { ascending: false })
          .limit(1);
        return {
          ...lib,
          lastAiResp: chats?.[0]?.aiResp || ''
        };
      }));
      setChats(chatPreviews);
      // Collect unique folders
      const uniqueFolders = Array.from(new Set(chatPreviews.map(c => c.folder).filter(Boolean)));
      setFolders(uniqueFolders);
    };
    fetchChats();
  }, []);

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

  // Filter chats by folder and not archived
  const filteredChats = chats.filter(chat =>
    !chat.isArchived &&
    (folderFilter === 'All' || chat.folder === folderFilter)
  );
  // Pinned at top
  const sortedChats = [
    ...filteredChats.filter(c => c.isPinned),
    ...filteredChats.filter(c => !c.isPinned)
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Chats</h2>
      {/* Folder filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${folderFilter === 'All' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
          onClick={() => setFolderFilter('All')}
        >
          All
        </button>
        {folders.map(folder => (
          <button
            key={folder}
            className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${folderFilter === folder ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
            onClick={() => setFolderFilter(folder)}
          >
            <Pin className="w-3 h-3" /> {folder}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {sortedChats.map(chat => (
          <div key={chat.libId} className="mb-2">
            <Link href={`/search/${chat.libId}`} className="block px-2 py-2 rounded hover:bg-gray-100 transition">
              <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                {chat.searchInput}
                {chat.isPinned && <Pin className="w-3 h-3 text-blue-500" />}
              </div>
              <div className="flex flex-wrap gap-1 mt-1 items-center">
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
                      <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-medium"><Tag className="w-2 h-2 mr-1" />{tag}</span>
                    ))}
                    <button onClick={e => { e.preventDefault(); setEditingTagsId(chat.libId); setTagsInput((chat.tags || []).join(', ')); }} className="ml-1 text-gray-400 hover:text-blue-500" title="Edit tags"><Pencil className="w-3 h-3" /></button>
                  </>
                )}
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
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-medium ml-1">
                    <Pin className="w-3 h-3 mr-1" />{chat.folder}
                    <button onClick={e => { e.preventDefault(); setEditingFolderId(chat.libId); setFolderInput(chat.folder); }} className="ml-1 text-gray-400 hover:text-blue-500" title="Edit folder"><Pencil className="w-3 h-3" /></button>
                  </span>
                ) : (
                  <button onClick={e => { e.preventDefault(); setEditingFolderId(chat.libId); setFolderInput(''); }} className="text-gray-400 hover:text-blue-500 text-xs ml-1" title="Add folder"><Pin className="w-3 h-3" /> <Pencil className="w-3 h-3 ml-1" /></button>
                )}
              </div>
              <div className="text-xs text-gray-500 truncate">{chat.lastAiResp || <span className="italic text-gray-300">No AI yet</span>}</div>
            </Link>
          </div>
        ))}
      </div>
    </aside>
  );
} 