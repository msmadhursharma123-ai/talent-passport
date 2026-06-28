/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, ShieldCheck, Key, Copy, Check, FileText, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../supabaseClient';

export default function SupabaseGuide() {
  const [copied, setCopied] = useState(false);
const isConfigured = isSupabaseConfigured();

  const sqlCode = `create table submissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  student_name text not null,
  student_email text not null,
  pathway text not null,
  event_name text not null,
  video_url text not null,
  description text not null,
  video_name text not null,
  video_size bigint not null
);`;

const copySql = async () => {
  try {
    await navigator.clipboard.writeText(sqlCode);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  } catch {
    console.error("Unable to copy SQL.");
  }
};

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 shadow-xl max-w-4xl mx-auto my-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-lg text-emerald-400 border border-emerald-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-slate-100">Supabase Connection Configuration</h2>
            <p className="text-xs text-slate-400 mt-1">Setup guide & credentials checker for persistent uploads</p>
          </div>
        </div>
        <div>
          {isConfigured ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected to Live Supabase
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Running in Local Mock Mode
            </div>
          )}
        </div>
      </div>

      {!isConfigured && (
        <div className="bg-amber-500/5 text-amber-200 border border-amber-500/10 rounded-xl p-4 mb-6 text-sm flex gap-3">
          <Key className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Interactive Sandbox Mode Enabled</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              No environment variables detected yet in your code editor workspace. All features work completely using simulated local memory + browser localStorage. Set <strong className="text-slate-200">VITE_SUPABASE_URL</strong> and <strong className="text-slate-200">VITE_SUPABASE_ANON_KEY</strong> in the Secrets Settings of AI Studio to test live uploads immediately.
            </p>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-slate-200 mb-3 text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          Step 1: Create Submissions Database Table
        </h3>
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Log in of your Supabase dashboard, select your project, open the <strong>SQL Editor</strong> tab, paste the following script, and click <strong>Run</strong>.
        </p>

        <div className="relative font-mono bg-slate-950 border border-slate-800 rounded-lg p-4 text-[11px] leading-relaxed text-emerald-400 overflow-x-auto mb-6">
          <button
            onClick={copySql}
            className="absolute right-3 top-3 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 p-1.5 rounded border border-slate-700 transition"
            title="Copy SQL Query"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <pre className="whitespace-pre-wrap">
  {sqlCode}
</pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <h3 className="font-semibold text-slate-200 mb-2 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Step 2: Setup Storage Bucket
            </h3>
            <ul className="list-disc pl-5 text-xs text-slate-400 space-y-2 leading-relaxed">
              <li>Open the <strong>Storage</strong> panel in Supabase.</li>
              <li>Click <strong>New Bucket</strong>.</li>
              <li>Set the name to exactly <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded font-mono">submissions</code>.</li>
              <li>Toggle it to <strong>Public bucket</strong>.</li>
              <li>Create a storage bucket policy allowing public file uploads and reads so that students can upload videos.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 mb-2 text-sm flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              Setup Guide Resources
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Ensure you have setup suitable RLS policies on your tables for security. Storage is managed under Submissions bucket and uploads utilize unique names to prevent overwriting keys.
            </p>
            <div className="flex gap-2">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-emerald-400 text-xs rounded-lg transition border border-slate-700"
              >
                Supabase Dashboard
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://supabase.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs rounded-lg transition border border-slate-700"
              >
                Official Docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
