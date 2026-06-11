/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { PathwayType, PATHWAY_EVENTS, PATHWAY_DESCRIPTIONS } from '../types';
import { 
  User, Mail, FileText, Compass, Award, Video, 
  Upload, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Sparkles, AlertCircle 
} from 'lucide-react';

interface Props {
  onSubmit: (
    entry: {
      studentName: string;
      studentEmail: string;
      className: string;
      schoolName: string;
      pathway: string;
      eventName: string;
      description: string;
    },
    videoFile: File,
    onProgress: (percent: number) => void
  ) => Promise<{ success: boolean; error?: string }>;
}

export default function SubmissionForm({ onSubmit }: Props) {
  // Wizard navigation steps: 1 = Student Profile, 2 = Event Selection, 3 = Video Upload
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [description, setDescription] = useState('');
  const [pathway, setPathway] = useState<PathwayType>('Communication');
  const [eventName, setEventName] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [className, setClassName] = useState("");
const [schoolName, setSchoolName] = useState("");

  // Interaction logs / errors
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // File drag state
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset event when pathway changes
  useEffect(() => {
    // Select first event in list automatically when changing pathway
    const events = PATHWAY_EVENTS[pathway];
    if (events && events.length > 0) {
      setEventName(events[0]);
    }
  }, [pathway]);

  // Handle Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetVideo(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetVideo(files[0]);
    }
  };

  // Check file guidelines (video formats)
  const validateAndSetVideo = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setFormError('Please select a valid video file format (e.g. MP4, WebM, MOV).');
      return;
    }
    // Limit to 200MB in simulation but let them pass
    setFormError(null);
    setVideoFile(file);

    // Create single preview url
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);
  };

  // Navigate forward with validation
  const nextStep = () => {
    setFormError(null);
    if (step === 1) {
      if (!studentName.trim()) {
        setFormError('Please enter your full student name.');
        return;
      }
      if (!studentEmail.trim() || !studentEmail.includes('@')) {
        setFormError('Please enter a valid student email address containing @.');
        return;
      }
      if (!description.trim()) {
        setFormError('Please provide a brief description of your submission.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!pathway) {
        setFormError('Please select a Pathway.');
        return;
      }
      if (!eventName) {
        setFormError('Please select an event challenge pill.');
        return;
      }
      setStep(3);
    }
  };

  const prevStep = () => {
    setFormError(null);
    if (step > 1) {
      setStep((step - 1) as any);
    }
  };

  // Submit complete form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!videoFile) {
      setFormError('Please upload a submission video before proceeding.');
      return;
    }

    setIsSubmitting(true);
    setUploadPercent(0);

   const result = await onSubmit(
  {
   studentName,
    studentEmail,
    className,
    schoolName,
    pathway,
    eventName,
    description
  },
      videoFile,
      (percent) => {
        setUploadPercent(percent);
      }
    );

    setIsSubmitting(false);

    if (result.success) {
      setSubmitSuccess(true);
    } else {
      setFormError(result.error || 'Connection to Supabase storage timed out.');
    }
  };

  // Quick reset
  const handleReset = () => {
    setStudentName('');
    setStudentEmail('');
    setDescription('');
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setStep(1);
    setSubmitSuccess(false);
  };

  if (submitSuccess) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-6 max-w-lg mx-auto shadow-sm animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-slate-900">Submission Uploaded!</h2>
          <p className="text-sm text-slate-500">
            Thank you, <strong className="text-slate-800">{studentName}</strong>! Your recording for <span className="font-mono text-xs font-semibold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-indigo-600">{eventName}</span> has been securely logged.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
          <div className="flex justify-between border-b border-slate-200/60 pb-1.5 font-mono">
            <span>Pathway:</span> <span className="font-bold text-slate-800">{pathway}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-1.5 font-mono">
            <span>Challenge:</span> <span className="font-bold text-slate-800">{eventName}</span>
          </div>
          <div className="flex justify-between font-mono">
            <span>Video file:</span> <span className="truncate text-slate-800 max-w-[200px]">{videoFile?.name}</span>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="w-full py-3 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.01] cursor-pointer"
        >
          Submit Another Entry
        </button>
      </div>
    );
  }

  // Pathway specific color definitions to add distinct visual look for each path selection
  const getPathwayColorTheme = (type: PathwayType) => {
    switch (type) {
      case 'Communication':
        return {
          bg: 'bg-indigo-550',
          border: 'border-indigo-200',
          accent: 'indigo',
          lightBg: 'bg-indigo-50/50',
          text: 'text-indigo-650'
        };
      case 'Creative Expression':
        return {
          bg: 'bg-fuchsia-550',
          border: 'border-fuchsia-200',
          accent: 'fuchsia',
          lightBg: 'bg-fuchsia-50/50',
          text: 'text-fuchsia-650'
        };
      case 'Problem Solving':
        return {
          bg: 'bg-cyan-550',
          border: 'border-cyan-200',
          accent: 'cyan',
          lightBg: 'bg-cyan-50/50',
          text: 'text-cyan-650'
        };
      case 'Team Event':
        return {
          bg: 'bg-amber-550',
          border: 'border-amber-200',
          accent: 'amber',
          lightBg: 'bg-amber-50/50',
          text: 'text-amber-650'
        };
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden relative flex flex-col">
      
      {/* Professional Polish style crisp Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
            Submission Details
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-150">
              Active Stage {step}/3
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Fill in your details and upload your showcase video.</p>
        </div>

        {/* Real-time Step indicators */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold self-start sm:self-center text-slate-600">
          <span className={step === 1 ? 'text-indigo-600' : 'text-slate-400'}>Step 1</span>
          <span className="text-slate-300">|</span>
          <span className={step === 2 ? 'text-indigo-600' : 'text-slate-400'}>Step 2</span>
          <span className="text-slate-300">|</span>
          <span className={step === 3 ? 'text-indigo-600' : 'text-slate-400'}>Step 3</span>
        </div>
      </div>

      {/* Progress line */}
      <div className="w-full h-1 bg-slate-100 relative">
        <div 
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Form Content box */}
      <div className="p-6 md:p-8 space-y-6">
        {formError && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-2.5 items-start text-xs text-rose-700 animate-in fade-in duration-250">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Validation Error</p>
              <p className="mt-0.5 leading-relaxed text-rose-600">{formError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6">
          
          {/* STEP 1: Student Information */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-350">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs text-indigo-600 font-extrabold uppercase font-mono tracking-wider">Step 1 of 3</span>
                <h3 className="text-lg font-display font-semibold text-slate-800">Student Profile Credentials</h3>
                <p className="text-xs text-slate-400 mt-1">Please enter your basic identification and contest entry description.</p>
              </div>

              {/* Full Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-450 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-450 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    placeholder="sarah@university.edu"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm transition-all"
                    required
                  />
                </div>
              </div>


{/* ADD BELOW HERE */}

<label>Class</label>
<select
  value={className}
  onChange={(e) => setClassName(e.target.value)}
>
  <option value="">Select Class</option>
  <option value="12">12</option>
  <option value="11">11</option>
  <option value="10">10</option>
  <option value="9">9</option>
  <option value="8">8</option>
  <option value="7">7</option>
  <option value="6">6</option>
</select>

<label>School Name</label>
<input
  value={schoolName}
  onChange={(e) => setSchoolName(e.target.value)}
  placeholder="Enter School Name"
/>
              {/* Project Description Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Brief Description
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-455 absolute left-3 top-3" />
                  <textarea
                    placeholder="Tell us about your submission, its objective, key goals, or pathways..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm transition-all resize-none leading-relaxed"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Pathway and Challenge Event selection */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-350">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs text-indigo-600 font-extrabold uppercase font-mono tracking-wider">Step 2 of 3</span>
                <h3 className="text-lg font-display font-semibold text-slate-800">Select Pathway & Event Challenge</h3>
                <p className="text-xs text-slate-400 mt-1">Select your category, then select which specific contest track challenge is your primary target.</p>
              </div>

              {/* Pathway Interactive Cards Grid */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Pathway Category
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['Communication', 'Creative Expression', 'Problem Solving', 'Team Event'] as PathwayType[]).map((pType) => {
                    const isSelected = pathway === pType;
                    
                    return (
                      <button
                        type="button"
                        key={pType}
                        onClick={() => setPathway(pType)}
                        className={`p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between h-24 relative overflow-hidden ${
                          isSelected 
                            ? `border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-50/30 shadow-sm` 
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className={`text-xs font-bold ${isSelected ? 'text-indigo-600' : 'text-slate-800'}`}>
                            {pType}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug line-clamp-2 mt-auto font-medium">
                          {PATHWAY_DESCRIPTIONS[pType]}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Events Pill Select */}
              <div className="space-y-3 bg-slate-50/80 rounded-xl p-4 border border-slate-200">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Event Name Challenge Track (<strong className="text-indigo-600 font-semibold">{pathway}</strong>)
                </label>
                
                <div className="flex flex-wrap gap-2">
                  {PATHWAY_EVENTS[pathway]?.map((eventItem) => {
                    const isSelected = eventName === eventItem;
                    return (
                      <button
                        type="button"
                        key={eventItem}
                        onClick={() => setEventName(eventItem)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/15 font-bold'
                            : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {eventItem}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Video File Upload */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-350">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs text-indigo-600 font-extrabold uppercase font-mono tracking-wider">Step 3 of 3</span>
                <h3 className="text-lg font-display font-semibold text-slate-800">Upload Showcase Video</h3>
                <p className="text-xs text-slate-400 mt-1">Select or drag & drop your video submission file.</p>
              </div>

              {/* Drag and Drop Zone */}
              {!videoFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                    dragOver 
                      ? 'border-indigo-500 bg-indigo-50/30' 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/*"
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border border-slate-300/40 shrink-0">
                    <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-800">Click to upload video</p>
                    <p className="text-xs text-slate-400">MP4, MOV or WebM up to 100MB</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Video Playback Preview */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 aspect-video relative flex items-center justify-center max-h-72">
                    {videoPreviewUrl && (
                      <video
                        src={videoPreviewUrl}
                        controls
                        className="w-full h-full object-contain max-h-72"
                      />
                    )}
                  </div>

                  {/* File Metadata Info */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="bg-indigo-50 p-2 rounded-lg text-indigo-650 border border-indigo-100 shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-semibold text-slate-800 truncate" title={videoFile.name}>
                          {videoFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {(videoFile.size / (1024 * 1024)).toFixed(1)} MB Details
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreviewUrl(null);
                      }}
                      className="text-[10px] uppercase font-bold tracking-wider text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 px-3 py-1 rounded-lg transition"
                    >
                      Change Video
                    </button>
                  </div>
                </div>
              )}

              {/* Loading indicator overlay */}
              {isSubmitting && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-in fade-in">
                  <div className="flex justify-between text-xs font-mono font-bold text-indigo-600">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading Media to Supabase Storage ...
                    </span>
                    <span>{uploadPercent}%</span>
                  </div>

                  {/* Progress bar item */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-150"
                      style={{ width: `${uploadPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Uploading video chunks to 'submissions' bucket. Please do not close your browser tab.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action button controls layout in footer */}
          <div className="flex justify-between items-center pt-5 border-t border-slate-200 mt-6 shrink-0 bg-slate-50 px-6 py-4 -mx-6 md:-mx-8 -mb-6 md:-mb-8 rounded-b-2xl">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md shadow-indigo-100 transition-all text-xs uppercase tracking-wide cursor-pointer ml-auto"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !videoFile}
                className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg shadow-indigo-200 transition-all text-sm uppercase tracking-wide cursor-pointer ml-auto"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Using bucket/submissions
                  </span>
                ) : (
                  "Submit Entry"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
