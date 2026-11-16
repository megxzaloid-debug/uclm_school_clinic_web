const initialAppointments = [
  {id:1,date:"2026-10-20",time:"9:00 AM",service:"General Check-up",doctor:"Dr. Maria Santos",status:"Completed",notes:"Routine check-up."},
  {id:2,date:"2026-09-15",time:"9:30 AM",service:"Consultation",doctor:"Dr. Carlo Rivera",status:"Completed",notes:"Follow-up consultation."},
  {id:3,date:"2026-08-28",time:"10:00 AM",service:"Dental Check-up",doctor:"Dr. Jaymee Tan",status:"Completed",notes:"Dental assessment."},
  {id:4,date:"2026-07-10",time:"1:00 PM",service:"General Check-up",doctor:"Dr. Maria Santos",status:"Cancelled",notes:"Appointment cancelled."},
  {id:5,date:"2026-06-18",time:"2:30 PM",service:"Consultation",doctor:"Dr. Carlo Rivera",status:"Completed",notes:"General consultation."},
  {id:6,date:"2026-11-10",time:"9:00 AM",service:"Health Screening",doctor:"Dr. Jaymee Tan",status:"Upcoming",notes:"Please bring your student ID."}
];
let appointments = JSON.parse(localStorage.getItem("uclmAppointments") || "null") || initialAppointments;
let notifications = [
  {text:"Your appointment on November 10, 2026 is confirmed.",time:"Just now",read:false},
  {text:"Flu Vaccination Drive this November 12, 2026.",time:"1 hour ago",read:false},
  {text:"Please bring your student ID for your appointment.",time:"1 day ago",read:true}
];
const $ = id => document.getElementById(id);
const save = () => localStorage.setItem("uclmAppointments", JSON.stringify(appointments));
const fmtDate = value => new Date(value+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"});
const statusClass = status => status.toLowerCase()==="upcoming" ? "status-upcoming" : "status-"+status.toLowerCase();
function statusPill(status){return `<span class="status-pill ${statusClass(status)}">${status==="Completed"?"✓":status==="Cancelled"?"×":"▦"} ${status}</span>`}
function renderRows(target, list){
  $(target).innerHTML = list.length ? list.map(a=>`<tr><td>${fmtDate(a.date)}</td><td>${a.time}</td><td>${a.service}</td><td>${a.doctor}</td><td>${statusPill(a.status)}</td><td><button class="view-btn" data-details="${a.id}">◉ View Details</button></td></tr>`).join("") : `<tr><td colspan="6" style="text-align:center;padding:30px;color:#71809b">No appointments found.</td></tr>`;
}
function render(){
  save();
  const counts = ["Upcoming","Completed","Cancelled"].map(s=>appointments.filter(a=>a.status===s).length);
  $("totalCount").textContent=appointments.length;$("upcomingCount").textContent=counts[0];$("completedCount").textContent=counts[1];
  const filter=$("appointmentFilter").value;
  renderRows("appointmentRows",appointments.filter(a=>filter==="All"||a.status===filter));
  renderRows("historyRows",appointments);
  const upcoming=appointments.filter(a=>a.status==="Upcoming").sort((a,b)=>a.date.localeCompare(b.date))[0];
  $("dashboardUpcoming").innerHTML=upcoming?`<div class="date-block"><small>${new Date(upcoming.date+"T00:00:00").toLocaleDateString("en-US",{month:"short"}).toUpperCase()}</small><strong>${new Date(upcoming.date+"T00:00:00").getDate()}</strong><small>${new Date(upcoming.date+"T00:00:00").toLocaleDateString("en-US",{weekday:"short"})}</small></div><div class="upcoming-info"><h3>${upcoming.service}</h3><p>◷ &nbsp; ${upcoming.time}</p><p>♙ &nbsp; ${upcoming.doctor}</p>${statusPill(upcoming.status)}</div>`:`<p class="muted">You have no upcoming appointments.</p>`;
  $("navUnread").textContent=notifications.filter(n=>!n.read).length||"";
  $("notificationList").innerHTML=notifications.map(n=>`<div class="notice ${n.read?"":"unread"}"><div class="notice-icon">♧</div><div><p>${n.text}</p><small>${n.time}</small></div></div>`).join("");
}
function showPage(page){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===page));document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("sidebar").classList.remove("open");window.scrollTo(0,0)}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
$("menuToggle").onclick=()=>$("sidebar").classList.toggle("open");
function openModal(id){$(id).classList.add("show")}
function closeModals(){document.querySelectorAll(".modal-backdrop").forEach(m=>m.classList.remove("show"))}
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",closeModals));
document.querySelectorAll(".modal-backdrop").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModals()}));
["bookHero","bookPage"].forEach(id=>$(id).addEventListener("click",()=>openModal("bookingModal")));
$("bookingDate").min="2026-11-16";
$("bookingForm").addEventListener("submit",e=>{
  e.preventDefault();
  const date=$("bookingDate").value, time=$("bookingTime").value, service=$("service").value;
  if(appointments.some(a=>a.date===date&&a.time===time&&a.status==="Upcoming")){toast("You already have an appointment at that time.");return}
  appointments.unshift({id:Date.now(),date,time,service,doctor:"Clinic Staff",status:"Upcoming",notes:$("notes").value||"No additional notes."});
  notifications.unshift({text:`Your ${service} appointment request for ${fmtDate(date)} is confirmed.`,time:"Just now",read:false});
  $("bookingForm").reset();closeModals();render();showPage("appointments");toast("Appointment booked successfully!");
});
document.addEventListener("click",e=>{
  const btn=e.target.closest("[data-details]");
  if(!btn)return;
  const a=appointments.find(x=>x.id==btn.dataset.details);if(!a)return;
  $("detailContent").innerHTML=`<div class="detail-box"><div class="detail-line"><span>Date</span><strong>${fmtDate(a.date)}</strong></div><div class="detail-line"><span>Time</span><strong>${a.time}</strong></div><div class="detail-line"><span>Service</span><strong>${a.service}</strong></div><div class="detail-line"><span>Doctor / Staff</span><strong>${a.doctor}</strong></div><div class="detail-line"><span>Status</span>${statusPill(a.status)}</div><div class="detail-line"><span>Notes</span><strong>${a.notes}</strong></div></div>${a.status==="Upcoming"?`<button class="outline-btn" id="cancelAppointment" data-id="${a.id}">Cancel Appointment</button>`:""}`;
  openModal("detailsModal");
});
document.addEventListener("click",e=>{
  if(e.target.id==="cancelAppointment"){
    const a=appointments.find(x=>x.id==e.target.dataset.id);if(a){a.status="Cancelled";notifications.unshift({text:`Your appointment for ${fmtDate(a.date)} has been cancelled.`,time:"Just now",read:false});closeModals();render();toast("Appointment cancelled.");}
  }
});
$("appointmentFilter").addEventListener("change",render);
$("historyTabs").addEventListener("click",e=>{
  const tab=e.target.closest("[data-filter]");if(!tab)return;
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===tab));
  const f=tab.dataset.filter;renderRows("historyRows",appointments.filter(a=>f==="All"||a.status===f));
  $("historyCount").textContent=`Showing ${appointments.filter(a=>f==="All"||a.status===f).length} appointments`;
});
$("markRead").onclick=()=>{notifications.forEach(n=>n.read=true);render();toast("All notifications marked as read.");};
$("editProfile").onclick=()=>{
  ["fullName","email","phone"].forEach(id=>$(id).disabled=false);
  $("saveProfile").classList.remove("hidden");$("editProfile").classList.add("hidden");
};
$("profileForm").onsubmit=e=>{e.preventDefault();["fullName","email","phone"].forEach(id=>$(id).disabled=true);$("saveProfile").classList.add("hidden");$("editProfile").classList.remove("hidden");toast("Profile changes saved on this device.");};
const tips=[["Stay Hydrated!","Drink plenty of water to keep your body healthy and support your daily activities.","💧"],["Eat Healthy!","Choose nutritious foods like fruits, vegetables, and whole grains.","🍎"],["Get Enough Sleep!","Aim for a regular sleep schedule so your body and mind can rest.","🌙"],["Keep Moving!","Take short breaks from sitting and include movement in your daily routine.","🏃"]];
let tipIndex=0;$("nextTip").onclick=()=>{tipIndex=(tipIndex+1)%tips.length;$("tipTitle").textContent=tips[tipIndex][0];$("tipText").textContent=tips[tipIndex][1];document.querySelector(".water-art").textContent=tips[tipIndex][2]};
$("logoutBtn").onclick=()=>{if(confirm("Are you sure you want to log out?")){toast("Logged out successfully.");}};
function toast(message){$("toast").textContent=message;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2600)}
$("searchInput").addEventListener("keydown",e=>{if(e.key==="Enter"){const q=e.target.value.toLowerCase();const found=appointments.some(a=>[a.service,a.doctor,a.status].some(v=>v.toLowerCase().includes(q)));toast(q?(found?"Matching appointment found. Check My Appointments.":"No matching appointment found."):"Type something to search.");if(found)showPage("appointments")}});
render();
