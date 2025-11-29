import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVector } from '../context/useVector';

function Config() {
  const { resources, addResource, updateResource, deleteResource } = useVector();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    url: '',
    iframe: false,
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const resetForm = () => {
    setFormData({ id: '', name: '', url: '', iframe: false });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.url) return;

    if (editingId) {
      updateResource(editingId, {
        name: formData.name,
        url: formData.url,
        iframe: formData.iframe,
      });
    } else {
      addResource({
        id: formData.id || formData.name.toLowerCase().replace(/\s+/g, '-'),
        name: formData.name,
        url: formData.url,
        iframe: formData.iframe,
      });
    }
    resetForm();
  };

  const handleEdit = (resource) => {
    setFormData({
      id: resource.id,
      name: resource.name,
      url: resource.url,
      iframe: resource.iframe,
    });
    setEditingId(resource.id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      deleteResource(id);
      if (editingId === id) {
        resetForm();
      }
    }
  };

  const handleExportConfig = () => {
    const config = {
      resources,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vector-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result);
        if (config.resources && Array.isArray(config.resources)) {
          config.resources.forEach((r) => {
            if (r.id && r.name && r.url) {
              addResource(r);
            }
          });
        }
      } catch {
        alert('Invalid configuration file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-green-500/30">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-green-500 hover:text-green-400 transition-colors"
          >
            {'<'} BACK
          </Link>
          <h1 className="text-xl text-green-500 text-glow">CONFIGURATION</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportConfig}
            className="px-3 py-1 border border-green-500/50 text-green-500 hover:bg-green-500/10 text-xs transition-colors"
          >
            EXPORT
          </button>
          <label className="px-3 py-1 border border-green-500/50 text-green-500 hover:bg-green-500/10 text-xs transition-colors cursor-pointer">
            IMPORT
            <input
              type="file"
              accept=".json"
              onChange={handleImportConfig}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Resources Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-green-500">RESOURCES</h2>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black text-sm transition-colors"
              >
                + ADD RESOURCE
              </button>
            )}
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 p-4 border border-green-500/30 bg-black/30"
            >
              <h3 className="text-green-500 mb-4">
                {editingId ? 'EDIT RESOURCE' : 'NEW RESOURCE'}
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-green-500/70 text-xs mb-1">
                    ID (optional)
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    disabled={!!editingId}
                    placeholder="auto-generated from name"
                    className="w-full px-3 py-2 bg-black border border-green-500/50 text-green-500 text-sm focus:border-green-500 outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-green-500/70 text-xs mb-1">
                    NAME *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Resource name"
                    className="w-full px-3 py-2 bg-black border border-green-500/50 text-green-500 text-sm focus:border-green-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-green-500/70 text-xs mb-1">
                    URL *
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    required
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 bg-black border border-green-500/50 text-green-500 text-sm focus:border-green-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="iframe"
                      checked={formData.iframe}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-green-500"
                    />
                    <span className="text-green-500/70 text-sm">
                      Enable iframe embedding (if supported by the resource)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors"
                >
                  {editingId ? 'UPDATE' : 'ADD'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-green-500/50 text-green-500 text-sm hover:bg-green-500/10 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}

          {/* Resources List */}
          <div className="space-y-2">
            {resources.length === 0 ? (
              <p className="text-green-500/50 text-sm py-4 text-center">
                No resources configured. Click &quot;ADD RESOURCE&quot; to create one.
              </p>
            ) : (
              resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-3 border border-green-500/30 bg-black/20 hover:bg-black/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500 font-bold truncate">
                        {resource.name}
                      </span>
                      <span className="text-green-500/50 text-xs">
                        [{resource.id}]
                      </span>
                      {resource.iframe && (
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400">
                          IFRAME
                        </span>
                      )}
                    </div>
                    <div className="text-green-500/50 text-xs truncate">
                      {resource.url}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="px-3 py-1 border border-green-500/50 text-green-500 hover:bg-green-500/10 text-xs transition-colors"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="px-3 py-1 border border-red-500/50 text-red-500 hover:bg-red-500/10 text-xs transition-colors"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Theme Section */}
        <section>
          <h2 className="text-lg text-green-500 mb-4">THEME SETTINGS</h2>
          <div className="p-4 border border-green-500/30 bg-black/30">
            <p className="text-green-500/50 text-sm mb-4">
              Vector uses a retro CRT terminal theme with the following features:
            </p>
            <ul className="text-green-500/70 text-sm space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Green-on-black color scheme
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                CRT scanline overlay effect
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Text glow effects
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Glitch hover animations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Monospace terminal font
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Config;
