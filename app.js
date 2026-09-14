const KEY="studentJarvisV1";
const defaultData={
  tasks:[
    {id:1,title:"Finish mathematics assignment",subject:"Mathematics",due:"Today",done:false},
    {id:2,title:"Practice Python for 45 minutes",subject:"Programming",due:"Today",done:false},
    {id:3,title:"Read one chapter",subject:"Physics",due:"Tomorrow",done:true}
  ],
  subjects:[
    {id:1,name:"Mathematics",teacher:"",credits:4,grade:"A"},
    {id:2,name:"Programming",teacher:"",credits:4,grade:"A+"},
    {id:3,name:"Physics",teacher:"",credits:3,grade:"B+"}
  ],
  timetable:[
    {day:"Monday",time:"09:00",subject:"Mathematics",room:"A-101"},
    {day:"Monday",time:"11:00",subject:"Programming",room:"Lab 2"},
    {day:"Tuesday",time:"10:00",subject:"Physics",room:"B-204"},
    {day:"Wednesday",time:"09:00",subject:"Programming",room:"Lab 2"}
  ],
  expenses:[],
  notes:[
    {id:1,title:"Welcome",body:"Use this dashboard to organize college life. Your data stays in this browser."}
  ],
  profile:{name:"Student",college:"My College",goal:"Stay consistent."}
};
let data=load(); let currentView="dashboard"; let timer=null,timerSeconds=25*60,timerRunning=false;

function load(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(defaultData)}catch{return structuredClone(defaultData)}}
function save(){localStorage.setItem(KEY,JSON.stringify(data));render();toast("Saved locally")}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function toast(t){const x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
function setView(v){currentView=v;document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===v));document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));document.getElementById("view-"+v).classList.add("active");document.getElementById("pageTitle").textContent=v[0].toUpperCase()+v.slice(1);renderView(v)}
document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>{setView(b.dataset.view);document.getElementById("sidebar").classList.remove("open")}));
document.getElementById("menuBtn").onclick=()=>document.getElementById("sidebar").classList.toggle("open");

function render(){renderView(currentView);document.getElementById("taskBadge").textContent=data.tasks.filter(t=>!t.done).length}
function renderView(v){
  const el=document.getElementById("view-"+v);
  if(v==="dashboard") el.innerHTML=dashboard();
  if(v==="tasks") el.innerHTML=tasks();
  if(v==="subjects") el.innerHTML=subjects();
  if(v==="timetable") el.innerHTML=timetable();
  if(v==="expenses") el.innerHTML=expenses();
  if(v==="notes") el.innerHTML=notes();
  if(v==="study") el.innerHTML=study();
  if(v==="settings") el.innerHTML=settings();
}
function dashboard(){
 const open=data.tasks.filter(x=>!x.done).length, done=data.tasks.filter(x=>x.done).length;
 const spent=data.expenses.reduce((a,x)=>a+Number(x.amount||0),0);
 return `<div class="grid stats">
  <div class="card"><div class="stat-label">OPEN TASKS</div><div class="stat-num">${open}</div><div class="muted">Keep moving.</div></div>
  <div class="card"><div class="stat-label">COMPLETED</div><div class="stat-num">${done}</div><div class="muted">Nice progress.</div></div>
  <div class="card"><div class="stat-label">SUBJECTS</div><div class="stat-num">${data.subjects.length}</div><div class="muted">This semester.</div></div>
  <div class="card"><div class="stat-label">EXPENSES</div><div class="stat-num">₹${spent.toFixed(0)}</div><div class="muted">Tracked locally.</div></div>
 </div>
 <div class="grid two" style="margin-top:18px">
  <div class="card"><div class="section-head"><h2>Today's mission</h2><button class="btn" onclick="setView('tasks')">Manage</button></div>
   <div class="list">${data.tasks.filter(t=>!t.done).slice(0,4).map(t=>taskRow(t)).join("")||'<div class="empty">All clear. Add a new task.</div>'}</div>
  </div>
  <div class="card"><div class="section-head"><h2>Study focus</h2><button class="btn" onclick="setView('study')">Start</button></div>
   <div class="muted">Your next step:</div><h2 style="margin-top:12px">${esc(data.profile.goal||"Stay consistent.")}</h2>
   <div class="bar" style="margin-top:18px"><i style="width:${data.tasks.length?Math.round(done/data.tasks.length*100):0}%"></i></div>
   <div class="muted" style="margin-top:8px">${data.tasks.length?Math.round(done/data.tasks.length*100):0}% of tasks completed</div>
  </div>
 </div>
 <div class="card" style="margin-top:18px"><div class="section-head"><h2>JARVIS quick actions</h2></div>
   <div class="grid three">
    <button class="btn" onclick="quickAddTask()">＋ Add task</button>
    <button class="btn" onclick="setView('notes')">✎ New note</button>
    <button class="btn" onclick="setView('expenses')">₹ Add expense</button>
   </div>
 </div>`;
}
function taskRow(t){return `<div class="row"><input class="check" type="checkbox" ${t.done?"checked":""} onchange="toggleTask(${t.id})"><div class="grow ${t.done?"done":""}">${esc(t.title)}<div class="muted">${esc(t.subject||"General")} • ${esc(t.due||"")}</div></div><button class="btn danger" onclick="deleteTask(${t.id})">×</button></div>`}
function tasks(){
 return `<div class="grid two"><div class="card"><div class="section-head"><h2>Task command center</h2><button class="btn primary" onclick="quickAddTask()">＋ Add task</button></div><div class="list">${data.tasks.map(taskRow).join("")||'<div class="empty">No tasks.</div>'}</div></div>
 <div class="card"><h2>New task</h2><p class="muted">Add a task without leaving the dashboard.</p><form class="form" onsubmit="addTask(event)">
 <input class="input" id="taskTitle" placeholder="Task title" required><div class="form-row"><input class="input" id="taskSubject" placeholder="Subject"><input class="input" id="taskDue" placeholder="Due date / Today"></div><button class="btn primary">Create task</button></form></div></div>`;
}
function addTask(e){e.preventDefault();data.tasks.unshift({id:Date.now(),title:taskTitle.value,subject:taskSubject.value,due:taskDue.value||"Today",done:false});save();e.target.reset();toast("Task created")}
function quickAddTask(){setView("tasks");setTimeout(()=>document.getElementById("taskTitle")?.focus(),50)}
function toggleTask(id){const t=data.tasks.find(x=>x.id===id);if(t)t.done=!t.done;save()}
function deleteTask(id){data.tasks=data.tasks.filter(x=>x.id!==id);save()}

function subjects(){
 return `<div class="grid two"><div class="card"><div class="section-head"><h2>Subjects</h2></div><div class="list">${data.subjects.map(s=>`<div class="row"><div class="grow"><strong>${esc(s.name)}</strong><div class="muted">${esc(s.teacher||"Teacher not set")} • ${s.credits} credits</div></div><span class="tag">${esc(s.grade||"—")}</span><button class="btn danger" onclick="deleteSubject(${s.id})">×</button></div>`).join("")||'<div class="empty">No subjects yet.</div>'}</div></div>
 <div class="card"><h2>Add subject</h2><form class="form" onsubmit="addSubject(event)"><input class="input" id="subName" placeholder="Subject name" required><input class="input" id="subTeacher" placeholder="Teacher"><div class="form-row"><input class="input" id="subCredits" type="number" min="1" max="10" value="3" placeholder="Credits"><select class="select" id="subGrade"><option>A+</option><option>A</option><option>B+</option><option>B</option><option>C</option><option>D</option></select></div><button class="btn primary">Add subject</button></form></div></div>`;
}
function addSubject(e){e.preventDefault();data.subjects.push({id:Date.now(),name:subName.value,teacher:subTeacher.value,credits:Number(subCredits.value),grade:subGrade.value});save();e.target.reset()}
function deleteSubject(id){data.subjects=data.subjects.filter(x=>x.id!==id);save()}

function timetable(){
 return `<div class="card"><div class="section-head"><h2>Weekly timetable</h2><button class="btn primary" onclick="addClass()">＋ Add class</button></div>
 <table class="table"><thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Room</th><th></th></tr></thead><tbody>${data.timetable.map((x,i)=>`<tr><td>${esc(x.day)}</td><td>${esc(x.time)}</td><td>${esc(x.subject)}</td><td>${esc(x.room)}</td><td><button class="btn danger" onclick="deleteClass(${i})">×</button></td></tr>`).join("")||'<tr><td colspan="5" class="empty">No classes.</td></tr>'}</tbody></table></div>`;
}
function addClass(){const day=prompt("Day (e.g. Monday)");if(!day)return;const time=prompt("Time (e.g. 09:00)")||"";const subject=prompt("Subject")||"";const room=prompt("Room")||"";data.timetable.push({day,time,subject,room});save()}
function deleteClass(i){data.timetable.splice(i,1);save()}

function expenses(){
 const total=data.expenses.reduce((a,x)=>a+Number(x.amount||0),0);
 return `<div class="grid two"><div class="card"><div class="section-head"><h2>Expense log</h2><strong style="color:var(--cyan)">₹${total.toFixed(2)}</strong></div><div class="list">${data.expenses.map((x,i)=>`<div class="row"><div class="grow"><strong>${esc(x.title)}</strong><div class="muted">${esc(x.category)} • ${esc(x.date)}</div></div><b>₹${Number(x.amount).toFixed(2)}</b><button class="btn danger" onclick="deleteExpense(${i})">×</button></div>`).join("")||'<div class="empty">No expenses tracked.</div>'}</div></div>
 <div class="card"><h2>Add expense</h2><form class="form" onsubmit="addExpense(event)"><input class="input" id="expTitle" placeholder="What did you spend on?" required><div class="form-row"><input class="input" id="expAmount" type="number" step="0.01" placeholder="Amount ₹" required><input class="input" id="expCategory" placeholder="Category"></div><button class="btn primary">Save expense</button></form></div></div>`;
}
function addExpense(e){e.preventDefault();data.expenses.unshift({title:expTitle.value,amount:Number(expAmount.value),category:expCategory.value||"General",date:new Date().toLocaleDateString()});save();e.target.reset()}
function deleteExpense(i){data.expenses.splice(i,1);save()}

function notes(){
 return `<div class="grid note-grid">${data.notes.map((n,i)=>`<div class="card note"><div class="section-head"><h3>${esc(n.title)}</h3><button class="btn danger" onclick="deleteNote(${i})">×</button></div><p>${esc(n.body)}</p></div>`).join("")}
 <div class="card note"><h3>New note</h3><form class="form" onsubmit="addNote(event)"><input class="input" id="noteTitle" placeholder="Title" required><textarea class="textarea" id="noteBody" placeholder="Write your note..." required></textarea><button class="btn primary">Save note</button></form></div></div>`;
}
function addNote(e){e.preventDefault();data.notes.unshift({id:Date.now(),title:noteTitle.value,body:noteBody.value});save();e.target.reset()}
function deleteNote(i){data.notes.splice(i,1);save()}

function study(){
 const mins=String(Math.floor(timerSeconds/60)).padStart(2,"0"),secs=String(timerSeconds%60).padStart(2,"0");
 return `<div class="card timer"><div class="timer-mode">POMODORO FOCUS</div><div class="timer-display">${mins}:${secs}</div><div class="muted">25 minutes focus • 5 minutes break</div><div style="display:flex;gap:8px;justify-content:center;margin-top:25px"><button class="btn primary" onclick="toggleTimer()">${timerRunning?"Pause":"Start"}</button><button class="btn" onclick="resetTimer()">Reset</button></div></div>`;
}
function toggleTimer(){if(timerRunning){clearInterval(timer);timerRunning=false}else{timerRunning=true;timer=setInterval(()=>{if(timerSeconds>0)timerSeconds--;else{clearInterval(timer);timerRunning=false;toast("Focus session complete!");alert("JARVIS: Focus session complete.");}renderView("study")},1000)}renderView("study")}
function resetTimer(){clearInterval(timer);timerRunning=false;timerSeconds=25*60;renderView("study")}

function settings(){
 return `<div class="grid settings-grid"><div class="card"><h2>Profile</h2><form class="form" onsubmit="saveProfile(event)"><input class="input" id="profileName" value="${esc(data.profile.name)}" placeholder="Your name"><input class="input" id="profileCollege" value="${esc(data.profile.college)}" placeholder="College"><input class="input" id="profileGoal" value="${esc(data.profile.goal)}" placeholder="Main goal"><button class="btn primary">Save profile</button></form></div>
 <div class="card"><h2>Data</h2><p class="muted">Everything in this version is stored in this browser's local storage. No camera or microphone is required.</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:18px"><button class="btn" onclick="exportData()">Export backup</button><label class="btn" style="cursor:pointer">Import backup<input type="file" accept=".json" hidden onchange="importData(event)"></label><button class="btn danger" onclick="resetData()">Reset all data</button></div></div></div>`;
}
function saveProfile(e){e.preventDefault();data.profile={name:profileName.value||"Student",college:profileCollege.value||"",goal:profileGoal.value||"Stay consistent."};save()}
function exportData(){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="student-jarvis-backup.json";a.click();URL.revokeObjectURL(a.href)}
function importData(e){const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{data=JSON.parse(r.result);save();toast("Backup imported")}catch{toast("Invalid backup")}};r.readAsText(file)}
function resetData(){if(confirm("Reset all Student JARVIS data?")){data=structuredClone(defaultData);save()}}

render();
