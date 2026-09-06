import React,{createContext,useCallback,useContext,useEffect,useMemo,useState} from "react";
import { getMyAcademicYearContext, getSchoolAcademicYears, resolveIdentitySchoolUuid, setMyAcademicYear } from "../repositories/AcademicYearRepository";
import type { SchoolAcademicYear } from "../models/AcademicYearModels";
import { setAcademicYearRuntime } from "./AcademicYearRuntime";
import AcademicYearSelector from "../components/AcademicYearSelector";
import HistoricalModeBanner from "../components/HistoricalModeBanner";

interface Value {
  schoolUuid:string|null;
  years:SchoolAcademicYear[];
  academicYear:SchoolAcademicYear|null;
  loading:boolean;
  isHistorical:boolean;
  canMutateAcademicData:boolean;
  selectAcademicYear:(id:string)=>Promise<void>;
  reloadAcademicYears:()=>Promise<void>;
}

const Context=createContext<Value|null>(null);

function isMigrationMissing(error:any){
  const code=String(error?.code??"");
  const message=String(error?.message??"").toLowerCase();
  return code==="42P01"||code==="42883"||(message.includes("school_academic_years")&&message.includes("does not exist"));
}

export function AcademicYearProvider({children,showSelector=true}:{children:React.ReactNode;showSelector?:boolean}){
  const[years,setYears]=useState<SchoolAcademicYear[]>([]);
  const[academicYear,setAcademicYear]=useState<SchoolAcademicYear|null>(null);
  const[loading,setLoading]=useState(true);
  const[featureError,setFeatureError]=useState<string|null>(null);
  const[featureMissing,setFeatureMissing]=useState(false);
  const schoolUuid=resolveIdentitySchoolUuid();

  const reloadAcademicYears=useCallback(async()=>{
    if(!schoolUuid){
      setYears([]);setAcademicYear(null);setAcademicYearRuntime("",null);
      setFeatureError(null);setFeatureMissing(false);setLoading(false);return;
    }
    setLoading(true);setFeatureError(null);setFeatureMissing(false);
    try{
      const allRows=await getSchoolAcademicYears(schoolUuid);
      if(allRows.length===0){
        throw new Error("No academic year is configured for this school. Please ask Platform Administration to configure the school's academic year.");
      }
      // A newly created PLANNED year is intentionally visible here.
      // This is what makes the selector appear immediately after Platform
      // Administration creates the next academic year. Access to a PLANNED
      // year is still enforced by the database/RPC onboarding guard.
      const rows=allRows.filter(r=>r.status!=="ARCHIVED");
      const serverContext=await getMyAcademicYearContext();
      const current=rows.find(r=>r.isCurrent)??rows[0]??null;
      const selected=(serverContext&&rows.some(r=>r.id===serverContext.id))
        ? rows.find(r=>r.id===serverContext.id)??current
        : current;
      if(!selected){
        throw new Error("The school's current academic year could not be resolved.");
      }
      setYears(rows);setAcademicYear(selected);setAcademicYearRuntime(schoolUuid,selected);
    }catch(error:any){
      if(isMigrationMissing(error)){
        // The feature is additive. If migration 016 has not been installed,
        // leave the existing portal behavior untouched.
        console.error("ACADEMIC YEAR MIGRATION NOT DEPLOYED; PRESERVING EXISTING PORTAL",error);
        setFeatureMissing(true);setFeatureError(null);
        setYears([]);setAcademicYear(null);setAcademicYearRuntime(schoolUuid,null);
      }else{
        // Once the feature is installed, never allow a context/RLS failure to
        // silently render mixed-year academic data. The portal is gated until
        // a valid academic-year context can be established.
        console.error("ACADEMIC YEAR CONTEXT LOAD FAILED",error);
        setFeatureMissing(false);setFeatureError(error?.message??"Academic year context could not be loaded.");
        setYears([]);setAcademicYear(null);setAcademicYearRuntime(schoolUuid,null);
      }
    }finally{setLoading(false);}
  },[schoolUuid]);

  useEffect(()=>{void reloadAcademicYears();},[reloadAcademicYears]);

  const select=useCallback(async(id:string)=>{
    if(!schoolUuid||!id||id===academicYear?.id)return;
    const selected=years.find(r=>r.id===id);
    if(!selected)throw new Error("The selected academic year is not available for this school.");
    await setMyAcademicYear(schoolUuid,id);
    setAcademicYear(selected);setAcademicYearRuntime(schoolUuid,selected);
    window.location.reload();
  },[schoolUuid,academicYear?.id,years]);

  const value=useMemo(()=>({
    schoolUuid,years,academicYear,loading,
    isHistorical:Boolean(academicYear&&!academicYear.isCurrent),
    canMutateAcademicData:Boolean(academicYear?.isCurrent&&academicYear.status==="ACTIVE"),
    selectAcademicYear:select,reloadAcademicYears
  }),[schoolUuid,years,academicYear,loading,select,reloadAcademicYears]);

  const gate=featureError&&!featureMissing?<AcademicYearContextError message={featureError} onRetry={()=>void reloadAcademicYears()}/>:null;

  return <Context.Provider value={value}>
    {gate}
    {!gate&&showSelector&&schoolUuid&&!loading&&years.length>1&&academicYear?<div style={{position:"relative",zIndex:25,display:"flex",justifyContent:"flex-end",padding:"7px 12px",background:"rgba(255,255,255,.94)",borderBottom:"1px solid #E2E8F0",backdropFilter:"blur(10px)"}}><AcademicYearSelector years={years} value={academicYear.id} onChange={id=>void select(id).catch(error=>alert(error?.message??"Unable to change academic year."))}/></div>:null}
    {!gate?<><HistoricalModeBanner/>{children}</>:null}
  </Context.Provider>;
}

function AcademicYearContextError({message,onRetry}:{message:string;onRetry:()=>void}){
  return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:18,boxSizing:"border-box",background:"#F8FAFC"}}><div style={{width:"min(520px,100%)",boxSizing:"border-box",padding:"22px 18px",borderRadius:16,border:"1px solid #FECACA",background:"#FFFFFF",boxShadow:"0 8px 24px rgba(15,23,42,.07)",textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:"#0F172A"}}>Academic year context unavailable</div><p style={{margin:"9px 0 16px",fontSize:12,lineHeight:1.55,color:"#64748B"}}>{message}</p><button type="button" onClick={onRetry} style={{border:0,borderRadius:9,padding:"9px 14px",background:"#143B73",color:"#FFFFFF",fontWeight:900,cursor:"pointer"}}>Retry</button></div></div>;
}

export function useAcademicYearContext(){const v=useContext(Context);if(!v)throw new Error("useAcademicYearContext must be used inside AcademicYearProvider.");return v;}
