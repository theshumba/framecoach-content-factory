import { useState } from 'react';
import {
  Key, Link2, SlidersHorizontal, Download, Check, AlertCircle,
  Eye, EyeOff, Zap, Trash2,
} from 'lucide-react';
import { getSettings, saveSettings, exportToJSON, exportToCSV } from '../store/contentStore';
import PlatformIcon from '../components/PlatformIcon';

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#2A2A2A]">
        <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#E32326]/15 text-[#E32326]">
          <Icon size={15} />
        </div>
        <h2 className="text-[#f7f7f7] text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ApiKeyInput({ label, platform, value, onChange, connected, onToggleConnect }) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[#8E8E8E] text-sm flex items-center gap-2">
          <PlatformIcon platform={platform} size={13} />
          {label}
        </label>
        <div className={`flex items-center gap-1.5 text-xs font-medium ${connected ? 'text-[#22C55E]' : 'text-[#8E8E8E]'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#22C55E]' : 'bg-[#8E8E8E]'}`} />
          {connected ? 'Connected' : 'Not connected'}
        </div>
      </div>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={`Enter ${platform} API key...`}
          className="w-full pr-20 pl-3 py-2.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg text-[#f7f7f7] text-sm placeholder-[#8E8E8E]/40 focus:outline-none focus:border-[#E32326]/50 font-mono"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="p-1 text-[#8E8E8E] hover:text-[#f7f7f7] transition-colors"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => getSettings());
  const [saved, setSaved] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const update = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    // Simulate connection status based on whether keys are filled
    const updated = {
      ...settings,
      tiktokConnected: settings.tiktokApiKey.length > 8,
      instagramConnected: settings.instagramApiKey.length > 8,
    };
    saveSettings(updated);
    setSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearData = () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    localStorage.removeItem('fc_content_v1');
    localStorage.removeItem('fc_settings_v1');
    setClearConfirm(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-[#f7f7f7] text-2xl font-bold">Settings</h1>
        <p className="text-[#8E8E8E] text-sm mt-0.5">Configure your content dashboard</p>
      </div>

      {/* API Configuration */}
      <SectionCard title="API Configuration" icon={Key}>
        <div className="space-y-5">
          <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg flex items-start gap-2">
            <AlertCircle size={14} className="text-[#F59E0B] mt-0.5 shrink-0" />
            <p className="text-[#F59E0B] text-xs leading-relaxed">
              API keys are stored locally in your browser and never sent to any server.
              Keys are used to enable direct posting from this dashboard.
            </p>
          </div>

          <ApiKeyInput
            label="TikTok API Key"
            platform="TikTok"
            value={settings.tiktokApiKey}
            onChange={v => update('tiktokApiKey', v)}
            connected={settings.tiktokConnected}
          />

          <ApiKeyInput
            label="Instagram API Key"
            platform="Instagram"
            value={settings.instagramApiKey}
            onChange={v => update('instagramApiKey', v)}
            connected={settings.instagramConnected}
          />
        </div>
      </SectionCard>

      {/* TikTok API */}
      <SectionCard title="TikTok API" icon={Key}>
        <div className="space-y-5">
          <div className="p-3 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-lg flex items-start gap-2">
            <AlertCircle size={14} className="text-[#3B82F6] mt-0.5 shrink-0" />
            <p className="text-[#3B82F6] text-xs leading-relaxed">
              TikTok Content Posting API credentials. These are stored locally and never sent to any server.
            </p>
          </div>

          <ApiKeyInput
            label="TikTok Client Key"
            platform="TikTok"
            value={settings.tiktokClientKey || ''}
            onChange={v => update('tiktokClientKey', v)}
            connected={!!(settings.tiktokClientKey && settings.tiktokClientKey.length > 8)}
          />

          <ApiKeyInput
            label="TikTok Client Secret"
            platform="TikTok"
            value={settings.tiktokClientSecret || ''}
            onChange={v => update('tiktokClientSecret', v)}
            connected={!!(settings.tiktokClientSecret && settings.tiktokClientSecret.length > 8)}
          />

          <button
            disabled
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1C] border border-[#2A2A2A] text-[#8E8E8E] text-sm font-medium rounded-lg cursor-not-allowed opacity-60"
          >
            <Zap size={14} />
            Connect TikTok
          </button>
          <p className="text-[#8E8E8E] text-xs -mt-2">
            Coming soon — add your API keys to prepare.
          </p>
        </div>
      </SectionCard>

      {/* Account Connections */}
      <SectionCard title="Platform Connections" icon={Link2}>
        <div className="space-y-3">
          {[
            { platform: 'TikTok', connected: settings.tiktokConnected, handle: '@framecoachapp' },
            { platform: 'Instagram', connected: settings.instagramConnected, handle: '@framecoach.app' },
          ].map(({ platform, connected, handle }) => (
            <div
              key={platform}
              className="flex items-center justify-between p-4 bg-[#1C1C1C] rounded-xl border border-[#2A2A2A]"
            >
              <div className="flex items-center gap-3">
                <PlatformIcon platform={platform} size={20} />
                <div>
                  <div className="text-[#f7f7f7] text-sm font-medium">{platform}</div>
                  <div className="text-[#8E8E8E] text-xs">{handle}</div>
                </div>
              </div>
              <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg ${
                connected
                  ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20'
                  : 'bg-[#1C1C1C] text-[#8E8E8E] border border-[#2A2A2A]'
              }`}>
                {connected ? <Check size={12} /> : <div className="w-2 h-2 rounded-full bg-[#8E8E8E]" />}
                {connected ? 'Connected' : 'Not Connected'}
              </div>
            </div>
          ))}
          <p className="text-[#8E8E8E] text-xs">
            Add API keys above and save to connect your platforms.
          </p>
        </div>
      </SectionCard>

      {/* Content Preferences */}
      <SectionCard title="Content Preferences" icon={SlidersHorizontal}>
        <div className="space-y-5">
          <div>
            <label className="text-[#8E8E8E] text-sm block mb-2">Default Format</label>
            <div className="flex gap-2">
              {['Story', 'Feed', 'Carousel'].map(f => (
                <button
                  key={f}
                  onClick={() => update('defaultFormat', f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.defaultFormat === f
                      ? 'bg-[#E32326] text-white'
                      : 'bg-[#1C1C1C] border border-[#2A2A2A] text-[#8E8E8E] hover:text-[#f7f7f7]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[#8E8E8E] text-sm block mb-2">
              Daily Posting Target: <span className="text-[#f7f7f7]">{settings.postingFrequency} posts/day</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={settings.postingFrequency}
              onChange={e => update('postingFrequency', parseInt(e.target.value))}
              className="w-full accent-[#E32326] bg-[#1C1C1C] h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#E32326' }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[#8E8E8E] text-xs">1</span>
              <span className="text-[#8E8E8E] text-xs">10</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Export */}
      <SectionCard title="Export Data" icon={Download}>
        <div className="space-y-3">
          <p className="text-[#8E8E8E] text-sm">
            Download all your content data as JSON or CSV for backup or external use.
          </p>
          <div className="flex gap-3">
            <button
              onClick={exportToJSON}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#3A3A3A] text-[#f7f7f7] text-sm font-medium rounded-lg transition-colors"
            >
              <Download size={14} />
              Export JSON
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#3A3A3A] text-[#f7f7f7] text-sm font-medium rounded-lg transition-colors"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Danger zone */}
      <SectionCard title="Danger Zone" icon={Trash2}>
        <div className="space-y-3">
          <p className="text-[#8E8E8E] text-sm">
            Clear all content data and reset the dashboard. This action cannot be undone.
          </p>
          <button
            onClick={handleClearData}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              clearConfirm
                ? 'bg-[#E32326] text-white'
                : 'bg-[#1C1C1C] border border-[#E32326]/30 text-[#E32326] hover:bg-[#E32326]/10'
            }`}
          >
            <Trash2 size={14} />
            {clearConfirm ? 'Are you sure? Click to confirm' : 'Clear All Data'}
          </button>
          {clearConfirm && (
            <button
              onClick={() => setClearConfirm(false)}
              className="text-[#8E8E8E] text-sm hover:text-[#f7f7f7] transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </SectionCard>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#E32326] hover:bg-[#B91C1F] text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-red-900/20"
        >
          {saved ? <Check size={15} /> : <Zap size={15} />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
        {saved && (
          <span className="text-[#22C55E] text-sm flex items-center gap-1">
            <Check size={13} /> Settings saved successfully
          </span>
        )}
      </div>
    </div>
  );
}
