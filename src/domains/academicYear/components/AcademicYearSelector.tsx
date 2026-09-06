import type { SchoolAcademicYear } from "../models/AcademicYearModels";

export default function AcademicYearSelector({years,value,onChange}:{years:SchoolAcademicYear[];value:string;onChange:(id:string)=>void}){
  if(years.length<2)return null;
  return <label style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:10,fontWeight:900,color:"#334155",whiteSpace:"nowrap",maxWidth:"100%"}}>
    <span>Academic Year</span>
    <select aria-label="Academic Year" value={value} onChange={e=>onChange(e.target.value)} style={{border:"1px solid #CBD5E1",borderRadius:9,background:"#FFFFFF",color:"#0F172A",padding:"7px 28px 7px 9px",fontSize:10,fontWeight:900,outline:"none",maxWidth:"42vw",minWidth:110}}>
      {years.map(y=><option key={y.id} value={y.id}>{y.academicYearName}{y.isCurrent?"  ·  Current":""}</option>)}
    </select>
  </label>;
}
