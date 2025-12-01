import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useArgus } from '../context/useArgus';

function Config() {
  const { 
    bookmarks, addBookmark, updateBookmark, deleteBookmark,
    aliases, addAlias, deleteAlias,
    feeds, addFeed, deleteFeed,
    settings, updateSettings,
    exportConfig, importConfig,
  } = useArgus();
  
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);

  const resetForm = () => {
    setFormData({});
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleExport = () => {
    const config = exportConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'argus-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result);
        importConfig(config);
        alert('Configuration imported successfully!');
      } catch {
        alert('Invalid configuration file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const tabs = [
    { id: 'bookmarks', label: 'BOOKMARKS' },
    { id: 'aliases', label: 'ALIASES' },
    { id: 'feeds', label: 'RSS FEEDS' },
    { id: 'settings', label: 'SETTINGS' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-green-500/30">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-green-500 hover:text-green-400 transition-colors font-bold"
          >
            {'<'} BACK
          </Link>
          <h1 className="text-xl text-green-500 text-glow font-bold">ARGUS CONFIG</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1 border border-green-500/50 text-green-500 hover:bg-green-500/10 text-xs transition-colors"
          >
            EXPORT
          </button>
          <label className="px-3 py-1 border border-green-500/50 text-green-500 hover:bg-green-500/10 text-xs transition-colors cursor-pointer">
            IMPORT
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-green-500/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); resetForm(); }}
            className={`px-4 py-2 text-sm font-bold transition-colors ${
              activeTab === tab.id
                ? 'text-green-400 border-b-2 border-green-400 bg-green-900/20'
                : 'text-green-500/50 hover:text-green-400 hover:bg-green-900/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'bookmarks' && (
          <BookmarksTab
            bookmarks={bookmarks}
            addBookmark={addBookmark}
            updateBookmark={updateBookmark}
            deleteBookmark={deleteBookmark}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            editingId={editingId}
            setEditingId={setEditingId}
            formData={formData}
            setFormData={setFormData}
            resetForm={resetForm}
          />
        )}
        {activeTab === 'aliases' && (
          <AliasesTab
            aliases={aliases}
            addAlias={addAlias}
            deleteAlias={deleteAlias}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            formData={formData}
            setFormData={setFormData}
            resetForm={resetForm}
          />
        )}
        {activeTab === 'feeds' && (
          <FeedsTab
            feeds={feeds}
            addFeed={addFeed}
            deleteFeed={deleteFeed}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            formData={formData}
            setFormData={setFormData}
            resetForm={resetForm}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab settings={settings} updateSettings={updateSettings} />
        )}
      </div>
    </div>
  );
}

function BookmarksTab({ bookmarks, addBookmark, updateBookmark, deleteBookmark, showAddForm, setShowAddForm, editingId, setEditingId, formData, setFormData, resetForm }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.url) return;

    if (editingId) {
      updateBookmark(editingId, {
        name: formData.name,
        url: formData.url,
        tags: formData.tags?.split(',').map(t => t.trim()).filter(Boolean) || [],
        icon: formData.icon || '🔗',
      });
    } else {
      addBookmark({
        name: formData.name,
        url: formData.url,
        tags: formData.tags?.split(',').map(t => t.trim()).filter(Boolean) || [],
        icon: formData.icon || '🔗',
      });
    }
    resetForm();
  };

  const handleEdit = (bookmark) => {
    setFormData({
      name: bookmark.name,
      url: bookmark.url,
      tags: bookmark.tags.join(', '),
      icon: bookmark.icon,
    });
    setEditingId(bookmark.id);
    setShowAddForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-green-500 font-bold">BOOKMARKS</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black text-sm transition-colors"
          >
            + ADD BOOKMARK
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-green-500/30 bg-black/30 rounded">
          <h3 className="text-green-500 mb-4 font-bold">{editingId ? 'EDIT BOOKMARK' : 'NEW BOOKMARK'}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-green-500/70 text-xs mb-1">NAME *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-black border border-green-500/50 text-green-400 text-sm focus:border-green-500 outline-none rounded"
              />
            </div>
            <div>
              <label className="block text-green-500/70 text-xs mb-1">ICON (emoji)</label>
              <input
                type="text"
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🔗"
                className="w-full px-3 py-2 bg-black border border-green-500/50 text-green-400 text-sm focus:border-green-500 outline-none rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-green-500/70 text-xs mb-1">URL *</label>
              <input
                type="url"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
                className="w-full px-3 py-2 bg-black border border-green-500/50 text-green-400 text-sm focus:border-green-500 outline-none rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-green-500/70 text-xs mb-1">TAGS (comma-separated)</label>
              <input
                type="text"
                value={formData.tags || ''}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="sec, tools, recon"
                className="w-full px-3 py-2 bg-black border border-green-500/50 text-green-400 text-sm focus:border-green-500 outline-none rounded"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors rounded">
              {editingId ? 'UPDATE' : 'ADD'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border border-green-500/50 text-green-500 text-sm hover:bg-green-500/10 transition-colors rounded">
              CANCEL
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {bookmarks.length === 0 ? (
          <p className="text-green-500/50 text-sm py-4 text-center">No bookmarks configured.</p>
        ) : (
          bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="flex items-center justify-between p-3 border border-green-500/30 bg-black/20 hover:bg-black/40 transition-colors rounded">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xl">{bookmark.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-green-400 font-bold truncate">{bookmark.name}</div>
                  <div className="text-green-500/50 text-xs truncate">{bookmark.url}</div>
                  {bookmark.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {bookmark.tags.map((tag) => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => handleEdit(bookmark)} className="px-3 py-1 border border-green-500/50 text-green-500 hover:bg-green-500/10 text-xs transition-colors rounded">EDIT</button>
                <button onClick={() => deleteBookmark(bookmark.id)} className="px-3 py-1 border border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs transition-colors rounded">DELETE</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AliasesTab({ aliases, addAlias, deleteAlias, showAddForm, setShowAddForm, formData, setFormData, resetForm }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.alias || !formData.url) return;
    addAlias({
      alias: formData.alias,
      url: formData.url,
      description: formData.description || formData.alias,
    });
    resetForm();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-green-500 font-bold">QUICK ALIASES</h2>
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black text-sm transition-colors">
            + ADD ALIAS
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-green-500/30 bg-black/30 rounded">
          <h3 className="text-green-500 mb-4 font-bold">NEW ALIAS</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-green-500/70 text-xs mb-1">ALIAS *</label>
              <input
                type="text"
                value={formData.alias || ''}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                required
                placeholder="gh"
                className="w-full px-3 py-2 bg-black border border-green-500/50 text-green-400 text-sm focus:border-green-500 outline-none rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-green-500/70 text-xs mb-1">URL *</label>
              <input
                type="text"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
                placeholder="https://github.com"
                className="w-full px-3 py-2 bg-black border border-green-500/50 text-green-400 text-sm focus:border-green-500 outline-none rounded"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-green-500/70 text-xs mb-1">DESCRIPTION</label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="GitHub"
                className="w-full px-3 py-2 bg-black border border-green-500/50 text-green-400 text-sm focus:border-green-500 outline-none rounded"
              />
            </div>
          </div>
          <p className="text-green-500/50 text-xs mt-2">Tip: Add a query parameter at the end of the URL (e.g., ?q=) to make it searchable.</p>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors rounded">ADD</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border border-green-500/50 text-green-500 text-sm hover:bg-green-500/10 transition-colors rounded">CANCEL</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {aliases.length === 0 ? (
          <p className="text-green-500/50 text-sm py-4 text-center">No aliases configured.</p>
        ) : (
          aliases.map((alias) => (
            <div key={alias.alias} className="flex items-center justify-between p-3 border border-green-500/30 bg-black/20 hover:bg-black/40 transition-colors rounded">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-yellow-400 font-bold">{alias.alias}</code>
                  <span className="text-green-500/50">→</span>
                  <span className="text-green-400">{alias.description}</span>
                </div>
                <div className="text-green-500/50 text-xs truncate mt-1">{alias.url}</div>
              </div>
              <button onClick={() => deleteAlias(alias.alias)} className="px-3 py-1 border border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs transition-colors rounded ml-4">DELETE</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FeedsTab({ feeds, addFeed, deleteFeed, showAddForm, setShowAddForm, formData, setFormData, resetForm }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.url) return;
    addFeed({ name: formData.name, url: formData.url });
    resetForm();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-green-500 font-bold">RSS FEEDS</h2>
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black text-sm transition-colors">
            + ADD FEED
          </button>
        )}
      </div>

      <div className="mb-6 p-4 border border-yellow-500/30 bg-yellow-900/10 rounded">
        <p className="text-yellow-400 text-sm">
          <span className="font-bold">⚠️ Note:</span> RSS feeds are stored for reference but cannot be parsed directly due to browser CORS restrictions.
          Consider using a feed aggregator service or self-hosted RSS reader for live updates.
        </p>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-green-500/30 bg-black/30 rounded">
          <h3 className="text-green-500 mb-4 font-bold">NEW FEED</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-green-500/70 text-xs mb-1">NAME *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-black border border-green-500/50 text-green-400 text-sm focus:border-green-500 outline-none rounded"
              />
            </div>
            <div>
              <label className="block text-green-500/70 text-xs mb-1">FEED URL *</label>
              <input
                type="url"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
                placeholder="https://example.com/feed.rss"
                className="w-full px-3 py-2 bg-black border border-green-500/50 text-green-400 text-sm focus:border-green-500 outline-none rounded"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors rounded">ADD</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border border-green-500/50 text-green-500 text-sm hover:bg-green-500/10 transition-colors rounded">CANCEL</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {feeds.length === 0 ? (
          <p className="text-green-500/50 text-sm py-4 text-center">No feeds configured.</p>
        ) : (
          feeds.map((feed) => (
            <div key={feed.id} className="flex items-center justify-between p-3 border border-green-500/30 bg-black/20 hover:bg-black/40 transition-colors rounded">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className={`w-3 h-3 rounded-full ${feed.enabled ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                <div className="flex-1 min-w-0">
                  <div className="text-green-400 font-bold">{feed.name}</div>
                  <div className="text-green-500/50 text-xs truncate">{feed.url}</div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <a href={feed.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 border border-green-500/50 text-green-500 hover:bg-green-500/10 text-xs transition-colors rounded">OPEN</a>
                <button onClick={() => deleteFeed(feed.id)} className="px-3 py-1 border border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs transition-colors rounded">DELETE</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SettingsTab({ settings, updateSettings }) {
  return (
    <div className="max-w-lg">
      <h2 className="text-lg text-green-500 font-bold mb-4">SETTINGS</h2>

      <div className="space-y-4">
        <div className="p-4 border border-green-500/30 bg-black/30 rounded">
          <h3 className="text-green-400 font-bold mb-3">DISPLAY</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-green-500/70 text-sm">Show clock in terminal</span>
              <input
                type="checkbox"
                checked={settings.showClock}
                onChange={(e) => updateSettings({ showClock: e.target.checked })}
                className="w-4 h-4 accent-green-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-green-500/70 text-sm">24-hour time format</span>
              <input
                type="checkbox"
                checked={settings.militaryTime}
                onChange={(e) => updateSettings({ militaryTime: e.target.checked })}
                className="w-4 h-4 accent-green-500"
              />
            </label>
          </div>
        </div>

        <div className="p-4 border border-green-500/30 bg-black/30 rounded">
          <h3 className="text-green-400 font-bold mb-3">TERMINAL</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-green-500/70 text-sm mb-1">Prompt symbol</label>
              <input
                type="text"
                value={settings.terminalPrompt}
                onChange={(e) => updateSettings({ terminalPrompt: e.target.value || '>' })}
                maxLength={3}
                className="w-20 px-3 py-2 bg-black border border-green-500/50 text-green-400 text-sm focus:border-green-500 outline-none rounded font-mono"
              />
            </div>
            <div>
              <label className="block text-green-500/70 text-sm mb-1">Max history entries</label>
              <input
                type="number"
                value={settings.maxHistory}
                onChange={(e) => updateSettings({ maxHistory: parseInt(e.target.value) || 100 })}
                min={10}
                max={1000}
                className="w-24 px-3 py-2 bg-black border border-green-500/50 text-green-400 text-sm focus:border-green-500 outline-none rounded"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border border-green-500/30 bg-black/30 rounded">
          <h3 className="text-green-400 font-bold mb-3">ABOUT</h3>
          <div className="text-green-500/70 text-sm space-y-1">
            <p>Argus Terminal v2.0.0</p>
            <p>Built with React + Vite + TailwindCSS</p>
            <p className="pt-2">
              <a href="https://github.com/this-bytes/argus" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                github.com/this-bytes/argus
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Config;
