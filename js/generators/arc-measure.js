import { ri, pick } from '../core/helpers.js';
import { svgCirclePts } from '../svg/circle.js';

function gArcMeasure(v){
  if(v===undefined) v=pick(['minorThree','majorSimple','majorDiameter']);
  if(v==='minorThree'){
    const x1=ri(95,140), x2=ri(95,140), ca=360-x1-x2;
    const pts=[{label:'A',deg:90},{label:'B',deg:90-x1},{label:'C',deg:90-x1-x2}];
    return {tag:'Arc measure',
      prompt:`Find the measure of minor arc <b>CA</b>.`,
      diagram:svgCirclePts({center:'P',pts,angles:[{from:'A',to:'B',text:x1+'°'},{from:'B',to:'C',text:x2+'°'}]}),
      type:'num',answer:ca,tol:0.5,unit:'°',
      given:`arc AB = ${x1}° · arc BC = ${x2}°`,
      solution:`The three arcs make a full circle of 360°. <code>arc CA = 360 − ${x1} − ${x2} = <span class="ans">${ca}°</span></code>`};
  }
  if(v==='majorSimple'){
    const th=ri(50,150);
    return {tag:'Arc measure',
      prompt:`The central angle for minor arc AB is shown. Find the measure of <b>major arc AB</b>.`,
      diagram:svgCirclePts({center:'O',pts:[{label:'A',deg:90},{label:'B',deg:90-th}],angles:[{from:'A',to:'B',text:th+'°'}]}),
      type:'num',answer:360-th,tol:0.5,unit:'°',
      solution:`Major arc = 360° − minor arc. <code>360 − ${th} = <span class="ans">${360-th}°</span></code>`};
  }
  const th=ri(25,80);
  return {tag:'Arc measure',
    prompt:`<b>IK</b> is a diameter. Find the measure of <b>major arc IKL</b>.`,
    diagram:svgCirclePts({center:'P',pts:[{label:'I',deg:180},{label:'K',deg:0},{label:'L',deg:-th}],diameter:['I','K'],angles:[{from:'K',to:'L',text:th+'°'}]}),
    type:'num',answer:180+th,tol:0.5,unit:'°',
    given:`m∠KPL = ${th}°`,
    solution:`IK is a diameter, so arc IK = 180°. Major arc IKL = arc IK + arc KL. <code>180 + ${th} = <span class="ans">${180+th}°</span></code>`};
}

const gArcMinor=()=>gArcMeasure('minorThree');
const gArcMajor=()=>gArcMeasure('majorSimple');
const gArcDiam=()=>gArcMeasure('majorDiameter');

export { gArcMeasure, gArcMinor, gArcMajor, gArcDiam };
