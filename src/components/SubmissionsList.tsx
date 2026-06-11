/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Submission, PathwayType } from '../types';
import { Search, Filter, Video, Play, Mail, Tag, Calendar, Trash2, ArrowUpDown } from 'lucide-react';

interface Props {
  submissions: Submission[];
  onRefresh: () => void;
  isMock: boolean;
  onClearMock?: () => void;
}

export default function SubmissionsList({ submissions, onRefresh, isMock, onClearMock }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPathway, setSelectedPathway] = useState<PathwayType | 'All'>('All');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeVideoName, setActiveVideoName] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Format File Size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format Date ISO
  const formatDate = (isoString?: string): string => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPathway = selectedPathway === 'All' || sub.pathway === selectedPathway;

    return matchesSearch && matchesPathway;
  });

  // Sort Submissions
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    const dateA = new Date(a.created_at || '').getTime();
    const dateB = new Date(b.created_at || '').getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Helper to resolve specific professional color aesthetic per pathway
  const getPathwayBadgeStyles = (pathwayName: string) => {
    switch (pathwayName) {
      case 'Communication':
        return 'bg-blue-50 text-blue-700 border-blue-150';
      case 'Creative Expression':
        return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-150';
      case 'Problem Solving':
        return 'bg-indigo-50 text-indigo-700 border-indigo-150';
      case 'Team Event':
        return 'bg-amber-50 text-amber-700 border-amber-150';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-150';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Panel with Professional Polish */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by student name, email, description or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="px-4 py-2.5 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer bg-white"
              title="Change sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </button>

            {isMock && submissions.length > 0 && onClearMock && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all simulation registrations?')) {
                    onClearMock();
                  }
                }}
                className="px-4 py-2.5 text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer bg-white"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Local Demo Logs
              </button>
            )}
          </div>
        </div>

        {/* Pathway filter chips */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter by Pathway:
          </span>
          <div className="flex flex-wrap gap-2">
            {(['All', 'Communication', 'Creative Expression', 'Problem Solving', 'Team Event'] as const).map((path) => (
              <button
                key={path}
                onClick={() => setSelectedPathway(path)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer border ${
                  selectedPathway === path
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                }`}
              >
                {path}
              </button>
            ))}
          </div>
        </div>
      </div>

      {sortedSubmissions.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mx-auto text-slate-500">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">No submissions found</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm || selectedPathway !== 'All'
                ? 'Try clearing searches or filtering chips.'
                : 'There are no submissions currently registered in this database.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSubmissions.map((sub, idx) => (
            <div
              key={sub.id || idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col group justify-between"
              id={`submission-card-${sub.id || idx}`}
            >
              {/* Card top body */}
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5">
                    <span className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${getPathwayBadgeStyles(sub.pathway)}`}>
                      {sub.pathway}
                    </span>
                    <h3 className="font-display font-bold text-slate-800 text-base line-clamp-1 group-hover:text-indigo-650 transition-colors">
                      {sub.student_name}
                    </h3>
                  </div>
                  <div className="text-[10px] text-slate-400 text-right shrink-0 font-mono font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    #{idx + 1}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-700" title={sub.student_email}>
                      {sub.student_email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-indigo-700 font-mono bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {sub.event_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500">{formatDate(sub.created_at)}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50/60 rounded-lg p-3.5 border border-slate-200 leading-relaxed min-h-[4rem] max-h-24 overflow-y-auto italic text-left">
                  &ldquo;{sub.description || 'No submission notes provided.'}&rdquo;
                </div>
              </div>

              {/* Video Preview Footer block */}
              <div className="bg-slate-50 border-t border-slate-250 px-5 py-3.5 flex items-center justify-between gap-4 mt-auto">
                <div className="flex flex-col text-[10px] text-slate-400 truncate text-left">
                  <span className="font-mono text-slate-700 truncate font-bold" title={sub.video_name}>
                    {sub.video_name || 'video_clip.mp4'}
                  </span>
                  <span className="font-medium mt-0.5">Size: {formatBytes(sub.video_size || 0)}</span>
                </div>

                <button
                  onClick={() => {
                    setActiveVideo(sub.video_url);
                    setActiveVideoName(sub.student_name + " - " + sub.event_name);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-4 overflow-hidden cursor-pointer shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" />
                  View Video
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Embedded Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 text-left">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h4 className="font-display font-bold text-slate-800 text-sm truncate flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {activeVideoName}
              </h4>
              <button
                onClick={() => {
                  setActiveVideo(null);
                  setActiveVideoName('');
                }}
                className="text-slate-400 hover:text-slate-700 bg-slate-200/80 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer font-bold text-xs"
              >
                ✕
              </button>
            </div>
            
            <div className="aspect-video bg-black flex items-center justify-center relative">
              <video
                src={activeVideo}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 text-[10px] flex justify-between items-center text-slate-500 font-semibold uppercase tracking-wider">
              <span>Streaming: {activeVideo.startsWith('blob:') ? 'Local Sandbox URL' : 'Supabase Storage CDN'}</span>
              {isMock && <span className="text-amber-600 font-bold">Simulated Local Session File</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
