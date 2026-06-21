import { pick } from './core/helpers.js';
import { gArcLength } from './generators/arc-length.js';
import { gArcMeasure, gArcMinor, gArcMajor, gArcDiam } from './generators/arc-measure.js';
import { gCircleGraph } from './generators/circle-graph.js';
import { gCircumference, gCircR, gCircD } from './generators/circumference.js';
import { gRadDiam, gRdR2D, gRdD2R } from './generators/radius-diameter.js';
import { gSpecial, gSpecial45, gSpecial3060 } from './generators/special-triangles.js';
import { gTrigRatio, gRatioAll, gRatioOne } from './generators/trig-ratio.js';
import { gSolveSide, gSideSin, gSideCos, gSideTan } from './generators/solve-side.js';
import { gFindAngle, gFindAngleSin, gFindAngleCos, gFindAngleTan } from './generators/find-angle.js';
import { gWord, gWordElev, gWordDepr, gWordAngle } from './generators/word-problems.js';
import { gDegToRad, gRadToDeg } from './generators/radian-degree.js';
import { gLawSines, gLawSinesAngle } from './generators/law-sines.js';
import { gLawCosines } from './generators/law-cosines.js';
import { gArea } from './generators/area.js';
import { gDistance, gDistance2D, gDistance3D } from './generators/distance.js';
import { gMidpoint, gMidpoint2D, gMidpoint3D } from './generators/midpoint.js';
import { gAmbiguous } from './generators/ambiguous.js';
import { gChords, gChordEqui, gChordCong } from './generators/chords.js';

/* ---------- registry ----------
   A topic is the chip/lesson-level unit (what Practice shows). Topics that have
   several variants list them in `subs` — each sub is a "leaf" that the Exam Prep
   blueprint can reference individually so every variant is guaranteed to appear.
   Topics without `subs` are single-variant (leaf id == topic id). */
const TOPICS=[
  {id:'arc',name:'Arc length',gen:gArcLength},
  {id:'arcm',name:'Arc measure',subs:[
    {id:'arcm-minor',name:'Arc measure · minor arc',gen:gArcMinor},
    {id:'arcm-major',name:'Arc measure · major arc',gen:gArcMajor},
    {id:'arcm-diam', name:'Arc measure · across a diameter',gen:gArcDiam}]},
  {id:'pie',name:'Circle graphs',gen:gCircleGraph},
  {id:'circ',name:'Circumference',subs:[
    {id:'circ-r',name:'Circumference · from radius',gen:gCircR},
    {id:'circ-d',name:'Circumference · from diameter',gen:gCircD}]},
  {id:'rd',name:'Radius/Diameter',subs:[
    {id:'rd-r2d',name:'Radius → diameter',gen:gRdR2D},
    {id:'rd-d2r',name:'Diameter → radius',gen:gRdD2R}]},
  {id:'special',name:'Special triangles',subs:[
    {id:'special-4545',name:'45-45-90 triangle',gen:gSpecial45},
    {id:'special-3060',name:'30-60-90 triangle',gen:gSpecial3060}]},
  {id:'ratio',name:'Trig ratios',subs:[
    {id:'ratio-all',name:'Trig ratios · sin, cos & tan',gen:gRatioAll},
    {id:'ratio-one',name:'Trig ratios · single ratio',gen:gRatioOne}]},
  {id:'side',name:'Solve a side',subs:[
    {id:'side-sin',name:'Solve a side · sine',gen:gSideSin},
    {id:'side-cos',name:'Solve a side · cosine',gen:gSideCos},
    {id:'side-tan',name:'Solve a side · tangent',gen:gSideTan}]},
  {id:'findang',name:'Find an angle',subs:[
    {id:'findang-sin',name:'Find an angle · sine',gen:gFindAngleSin},
    {id:'findang-cos',name:'Find an angle · cosine',gen:gFindAngleCos},
    {id:'findang-tan',name:'Find an angle · tangent',gen:gFindAngleTan}]},
  {id:'word',name:'Word problems',subs:[
    {id:'word-elev',name:'Word problem · elevation',gen:gWordElev},
    {id:'word-depr',name:'Word problem · depression',gen:gWordDepr},
    {id:'word-angle',name:'Word problem · find angle',gen:gWordAngle}]},
  {id:'d2r',name:'Deg → rad',gen:gDegToRad},
  {id:'r2d',name:'Rad → deg',gen:gRadToDeg},
  {id:'amb',name:'Ambiguous case',gen:gAmbiguous},
  {id:'sines',name:'Law of Sines',gen:gLawSines},
  {id:'sineang',name:'Law of Sines (∠)',gen:gLawSinesAngle},
  {id:'cosines',name:'Law of Cosines',gen:gLawCosines},
  {id:'area',name:'Triangle area',gen:gArea},
  {id:'dist',name:'Distance',subs:[
    {id:'dist-2d',name:'Distance · 2-D',gen:gDistance2D},
    {id:'dist-3d',name:'Distance · 3-D',gen:gDistance3D}]},
  {id:'mid',name:'Midpoint',subs:[
    {id:'mid-2d',name:'Midpoint · 2-D',gen:gMidpoint2D},
    {id:'mid-3d',name:'Midpoint · 3-D',gen:gMidpoint3D}]},
  {id:'chord',name:'Chords',subs:[
    {id:'chord-equi',name:'Chords · equidistant',gen:gChordEqui},
    {id:'chord-cong',name:'Chords · congruent',gen:gChordCong}]},
];

/* lessons (exam categories) -> which topics belong to each */
const LESSONS=[
  {id:'all', tab:'All',  title:'All topics', topics:TOPICS.map(t=>t.id)},
  {id:'4-3', tab:'4-3',  title:'Lesson 4-3 · Coordinates in 3-D space', topics:['dist','mid']},
  {id:'4-4', tab:'4-4',  title:'Lesson 4-4 · Special right triangles', topics:['special']},
  {id:'4-5', tab:'4-5',  title:'Lesson 4-5 · Trigonometric ratios', topics:['ratio','side','findang']},
  {id:'4-6', tab:'4-6',  title:'Lesson 4-6 · Applications of trigonometry', topics:['word','area']},
  {id:'4-7', tab:'4-7',  title:'Lesson 4-7 · Law of Sines', topics:['sines','sineang','amb']},
  {id:'4-8', tab:'4-8',  title:'Lesson 4-8 · Law of Cosines', topics:['cosines']},
  {id:'5-1', tab:'5-1',  title:'Lesson 5-1 · Circles and circumference', topics:['circ','rd']},
  {id:'5-2', tab:'5-2',  title:'Lesson 5-2 · Angles and arcs in circles', topics:['arc','arcm','pie','d2r','r2d']},
  {id:'5-3', tab:'5-3',  title:'Lesson 5-3 · Arcs and chords', topics:['chord']},
];
function lessonTopics(id){const L=LESSONS.find(l=>l.id===id);return L?L.topics.slice():TOPICS.map(t=>t.id);}

/* ---------- subtopic helpers ---------- */
/* the leaf entries of a topic: its subs, or a single synthetic leaf for plain topics */
function leavesOf(t){ return t.subs ? t.subs : [{id:t.id,name:t.name,gen:t.gen}]; }

/* free-practice generator for a topic: its own gen, or a random sub */
function topicGen(t){ return t.gen || (()=>pick(t.subs).gen()); }

/* flat map of every leaf id -> {gen, name, topicId} (used by the exam + analysis) */
const SUBTOPICS={};
TOPICS.forEach(t=>leavesOf(t).forEach(s=>{ SUBTOPICS[s.id]={gen:s.gen,name:s.name,topicId:t.id}; }));

/* map a leaf id back to its parent topic id (for the "Practice this →" jump) */
function parentTopicOf(leafId){ return (SUBTOPICS[leafId]||{}).topicId || leafId; }

/* display name for a leaf id, falling back to the topic name */
function leafName(leafId){
  return (SUBTOPICS[leafId]||{}).name || (TOPICS.find(t=>t.id===leafId)||{}).name || leafId;
}

export { TOPICS, LESSONS, SUBTOPICS, lessonTopics, leavesOf, topicGen, parentTopicOf, leafName };
