// ----- Random topics -----
const topics = [
  "The Impact of Technology on Education",
  "Climate Change and Its Consequences",
  "The Importance of Healthy Lifestyle",
  "Artificial Intelligence in Daily Life",
  "Future of Space Exploration"
];

// ----- Sidebar open/close -----
function toggleSidebar(){
  document.getElementById("sidebar").classList.toggle("open");
}

// ----- Random Topic -----
function randomTopic(){
  const title = topics[Math.floor(Math.random()*topics.length)];
  const el = document.getElementById("essay-title");
  el.value = title;
  // ถ้าคุณมี autoResize อยู่แล้ว ให้เรียกได้ด้วย: autoResize(el);
  if (!titleLockedByChatName) setTitlePreview(title);
}



// แสดงหัวข้อด้านบนช่องกรอก
let titleLockedByChatName = false;  // true เมื่อถูก "ล็อก" ด้วยการแก้ชื่อประวัติ

function setTitlePreview(text){
  const el = document.getElementById('title-preview');
  if (el) el.textContent = text || '';
}

document.addEventListener('DOMContentLoaded', ()=>{
  const titleEl = document.getElementById('essay-title');
  if (titleEl) {
    // พิมพ์แล้วอัปเดตพรีวิว เฉพาะเมื่อยังไม่ถูกล็อก
    titleEl.addEventListener('input', ()=>{
      if (!titleLockedByChatName) setTitlePreview(titleEl.value);
    });
    // ตั้งค่าเริ่มต้น (ถ้ามีค่าเดิม)
    if (!titleLockedByChatName) setTitlePreview(titleEl.value);
  }
});



// ----- Helpers -----
// ----- Helpers -----
function updateResult(scores, feedback){
  const aspects = [
    "Task response",
    "Coherence and Cohesion",
    "Grammatical Range",
    "Lexical Resource",
    "Overall"
  ];

  // สร้าง/ดึง feedback รายพาร์ท
  function getPerPartFeedback(i, score){
    // ถ้าส่ง feedback มาเป็น array/object รายพาร์ท ใช้ตามนั้น
    if (Array.isArray(feedback)) return String(feedback[i-1] ?? "");
    if (feedback && typeof feedback === "object") {
      const byKey = feedback[`part${i}`] ?? feedback[i-1];
      if (byKey != null) return String(byKey);
    }

    // ไม่งั้นสร้างตามช่วงคะแนน
    const v = Number(score || 0);
    let bucket = 0; // 0–2 / 3–4 / 5–6 / 7–8 / 9–10
    if (v >= 9) bucket = 4;
    else if (v >= 7) bucket = 3;
    else if (v >= 5) bucket = 2;
    else if (v >= 3) bucket = 1;

    const msg = {
      "Task response": [
        "ยังตอบโจทย์ไม่ครบ ควรระบุประเด็นหลักให้ชัด",
        "เริ่มตรงโจทย์บางส่วน แต่ยังไม่ครอบคลุม",
        "ครบประเด็นหลักพอใช้ เพิ่มรายละเอียด/ตัวอย่าง",
        "ชัดเจน ครบถ้วน มีตัวอย่างสนับสนุนดี",
        "ยอดเยี่ยม ครบทุกประเด็น เจาะลึกและแม่นยำ"
      ],
      "Coherence and Cohesion": [
        "การลำดับ/เชื่อมโยงยังสะดุด",
        "พอใช้ มีโครงสร้าง แต่ตัวเชื่อมยังไม่ลื่น",
        "ลำดับดี ใช้ตัวเชื่อมพื้นฐานได้เหมาะสม",
        "ลื่นไหล ย่อหน้าชัดเจน ตัวเชื่อมหลากหลาย",
        "โดดเด่น ไหลลื่นเป็นธรรมชาติ เชื่อมโยงดีมาก"
      ],
      "Grammatical Range": [
        "ไวยากรณ์ผิดบ่อย โครงสร้างซ้ำ",
        "ผิดพลาดเห็นได้ชัดหลายจุด",
        "มีความหลากหลายขึ้น ผิดพลาดประปราย",
        "หลากหลายและค่อนข้างแม่นยำ",
        "ซับซ้อน แม่นยำ แทบไม่มีข้อผิดพลาด"
      ],
      "Lexical Resource": [
        "คำศัพท์จำกัด/ใช้คำไม่แม่น",
        "ศัพท์พื้นฐานซ้ำ ควรขยายคลังคำ",
        "หลากหลายขึ้น ความหมายค่อนข้างแม่น",
        "หลากหลาย เหมาะกาลเทศะ ใช้คำได้ดี",
        "ธรรมชาติ ถูกต้อง มี collocation ที่ดี"
      ],
      "Overall": [
        "ภาพรวมยังอ่อน ควรวางโครง/ตรวจภาษา",
        "พอใช้ เสริมรายละเอียดและความลื่นไหล",
        "ปานกลาง เสริมความลึกและความแม่น",
        "ดีมาก แข็งแรงหลายมิติ",
        "โดดเด่น ครบ ลึก ลื่นไหล"
      ]
    };

    const aspect = aspects[i-1] || "Overall";
    return msg[aspect][bucket] || "";
  }

  // อัปเดตคะแนน + แสดง <strong>Feedback</strong> บรรทัดถัดไป
  for (let i = 1; i <= 5; i++) {
    const val = Number(scores?.[i-1] ?? 0);

    // 1) คะแนน x / 10
    const scoreSpan = document.getElementById(`part${i}`);
    if (scoreSpan) scoreSpan.textContent = `${val} / 10`;

    // 2) บรรทัด Feedback ของพาร์ท
    const fbId = `part${i}-fb`;
    const fbText = getPerPartFeedback(i, val);
    let fbEl = document.getElementById(fbId);

    if (!fbEl) {
      // สร้างใหม่ถ้ายังไม่มี (ถัดจาก <p> ที่ครอบ score)
      if (scoreSpan && scoreSpan.parentElement) {
        fbEl = document.createElement("p");
        fbEl.id = fbId;
        fbEl.className = "part-feedback";
        scoreSpan.parentElement.insertAdjacentElement("afterend", fbEl);
      }
    }
    if (fbEl) {
      const label = (i === 5 ? "Feedback" : "Reasoning");
      fbEl.innerHTML = `<strong>${label}:</strong> ${escapeHtml(fbText)}`;
    }
  }

  // ลบ Feedback รวมล่างสุดออก (ทั้งหัวข้อและย่อหน้า)
  const fbHeader = document.querySelector('#result h3');
  if (fbHeader && /Feedback/i.test(fbHeader.textContent)) fbHeader.remove();
  const fbOverall = document.getElementById('feedback');
  if (fbOverall) fbOverall.remove();

  // โชว์กล่องผลลัพธ์
  const resultBox = document.getElementById("result");
  if (resultBox) resultBox.style.display = "block";
}


function scrollToTopSmooth(){
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function escapeHtml(s=""){
  return s.replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}

// ----- Submit & scoring demo (คะแนนเต็ม 10) -----
function submitEssay(){
  const titleEl = document.getElementById("essay-title");
  const textEl  = document.getElementById("essay-input");
  const title = (titleEl.value || "").trim();
  const text  = (textEl.value || "").trim();

  if(!title || !text){
    alert("กรอกหัวข้อและเนื้อหาให้ครบก่อนนะ");
    return;
  }

  // คะแนนสุ่ม 0–10 (เต็ม 10)
  const scores = Array.from({length:5},()=>Math.floor(Math.random()*11));
  const feedback =
    "DEMO: โครงสร้างชัดเจน มีการยกตัวอย่าง แต่ยังขาดการเชื่อมโยงระหว่างย่อหน้าบางส่วน และควรเพิ่มคำศัพท์เชิงวิชาการ";

  // แสดงผล
  updateResult(scores, feedback);

  // บันทึกเข้าประวัติ (พร้อม snapshot)
  addToHistory(title, text, scores, feedback);

  // เลื่อนลงไปดูผลก็ได้ แต่ตาม requirement ล่าสุดไม่ได้บังคับ
  // (คงไว้ที่ตำแหน่งปัจจุบัน)
}

// ----- History render & 3-dots menu -----
const historyList = document.getElementById("history-list");

function addToHistory(title, text, scores, feedback){
  const li = document.createElement("li");
  li.className = "history-item";

  // เก็บข้อมูล
  li.dataset.topic    = title;                       // หัวข้อของ essay
  li.dataset.chatName = title;                       // ชื่อประวัติ (ตั้งต้น = หัวข้อ, แต่แก้ภายหลังได้)
  li.dataset.title    = title;                       // (คงไว้ให้โค้ดเดิมที่ยังอ้างใช้ได้)
  li.dataset.text     = text;
  li.dataset.scores   = JSON.stringify(scores || [0,0,0,0,0]);
  li.dataset.feedback = feedback || "";

  // ชื่อที่แสดงใน history = chatName
  const span = document.createElement("span");
  span.className = "title";
  span.textContent = li.dataset.chatName;

  const dots = document.createElement("button");
  dots.className = "dots-btn";
  dots.type = "button";
  dots.setAttribute("aria-label","Open item menu");
  dots.textContent = "⋯";

  const menu = document.createElement("div");
  menu.className = "item-menu";
  menu.innerHTML = `
    <button type="button" class="menu-edit">Edit text</button>
    <button type="button" class="menu-delete">Delete</button>
  `;

  li.append(span, dots, menu);
  historyList.prepend(li); // ล่าสุดไว้บน
}


// เปิดเมนู/ลบ/แก้ไขชื่อ/เปิด snapshot
historyList.addEventListener("click", (e)=>{
  const li = e.target.closest(".history-item");
  if(!li) return;

  // 1) เปิด/ปิดเมนูจุดสามจุด
  if(e.target.classList.contains("dots-btn")){
    closeAllMenus();
    const menu = li.querySelector(".item-menu");
    menu.classList.toggle("show");
    return; // ไม่ปิด sidebar
  }

  // 2) ลบรายการ
  if(e.target.classList.contains("menu-delete")){
    li.remove();
    return; // sidebar ยังเปิดค้าง
  }

  // 3) Edit text -> แก้ไข "ชื่อหัวข้อประวัติ"
  if(e.target.classList.contains("menu-edit")){
    openRenameForm(li);
    // เมนูย่อยปิดไปได้ เพื่อไม่เกะกะ
    closeAllMenus();
    return;
  }

  // 4) ถ้าคลิกในฟอร์ม rename ให้ไม่เปิด snapshot
  if(e.target.closest(".rename-form")){
    return;
  }

  // 5) คลิกพื้นที่รายการ/ชื่อ -> โหลด snapshot และเด้งไปบนสุด
  openHistorySnapshot(li);
  scrollToTopSmooth(); // ตาม requirement
});

// คลิกนอกเมนู -> ปิดเมนูย่อย (ไม่ปิด sidebar)
document.addEventListener("click", (e)=>{
  if(e.target.closest(".history-item")) return;
  closeAllMenus();
});

function closeAllMenus(){
  document.querySelectorAll(".item-menu.show").forEach(m=>m.classList.remove("show"));
}

// ----- Inline rename helpers -----
function openRenameForm(li){
  // ถ้ามีฟอร์มอยู่แล้ว ไม่ต้องสร้างซ้ำ
  if(li.querySelector(".rename-form")) return;

  const currentTitle = li.dataset.chatName || li.dataset.title || "";
  const form = document.createElement("div");
  form.className = "rename-form";
  form.innerHTML = `
    <input class="rename-input" type="text" value="${escapeHtml(currentTitle)}" />
    <button class="rename-save" type="button">Save</button>
    <button class="rename-cancel" type="button">Cancel</button>
  `;
  li.appendChild(form);

    // เปิดเมนู/ลบ/แก้ไขชื่อ/เปิด snapshot
historyList.addEventListener("click", (e)=>{
  const li = e.target.closest(".history-item");
  if(!li) return;

  if(e.target.classList.contains("dots-btn")){
    closeAllMenus();
    const menu = li.querySelector(".item-menu");
    menu.classList.toggle("show");
    return;
  }

  if(e.target.classList.contains("menu-delete")){
    li.remove();
    return;
  }

  // >>> อัปเดต: Edit text = เปิดฟอร์มแก้ไขชื่อด้านบน, ปุ่มอยู่ล่าง
  if(e.target.classList.contains("menu-edit")){
    openRenameForm(li);
    closeAllMenus();
    return;
  }

  // คลิกภายในฟอร์มแก้ไข ไม่ให้ไปโหลด snapshot
  if(e.target.closest(".rename-form")){
    return;
  }

  // คลิกไอเท็ม = เปิด snapshot + เลื่อนขึ้นบนสุด
  openHistorySnapshot(li);
  scrollToTopSmooth();
});


function openRenameForm(li){
  // ถ้ากำลังเปิดฟอร์มอยู่แล้ว ไม่ต้องสร้างซ้ำ
  if(li.querySelector(".rename-form")) return;

  const currentTitle = li.dataset.chatName || li.dataset.title || "";
  const form = document.createElement("div");
  form.className = "rename-form";
  form.innerHTML = `
    <label class="rename-label">Edit title</label>
    <textarea class="rename-input" rows="3">${escapeHtml(currentTitle)}</textarea>
    <div class="rename-actions">
      <button class="rename-cancel" type="button">Cancel</button>
      <button class="rename-save" type="button">Save</button>
    </div>
  `;
  li.appendChild(form);

  const input = form.querySelector(".rename-input");
  input.focus();
  input.select();

  // ปุ่มกดในฟอร์ม
  form.addEventListener("click", (ev)=>{
  if(ev.target.classList.contains("rename-save")){
    const newTitle = input.value.trim() || "Untitled";
    li.dataset.chatName = newTitle;               // เดิมมีอยู่แล้ว
    li.dataset.renamed = "1";                     // << เพิ่ม
    li.querySelector(".title").textContent = newTitle;

    setTitlePreview(newTitle);                    // << เพิ่ม
    titleLockedByChatName = true;                 // << เพิ่ม

    form.remove();
  }
  if(ev.target.classList.contains("rename-cancel")){
    form.remove();
  }
});


  // คีย์ลัด: Enter = Save, Esc = Cancel
  input.addEventListener("keydown", (ev)=>{
    if(ev.key === "Enter" && !ev.shiftKey){   // Enter บันทึก (Shift+Enter = ขึ้นบรรทัดใหม่)
      ev.preventDefault();
      form.querySelector(".rename-save").click();
    }else if(ev.key === "Escape"){
      ev.preventDefault();
      form.querySelector(".rename-cancel").click();
    }
  });
}

  // โฟกัส input
  const input = form.querySelector(".rename-input");
  input.focus();
  input.select();

  // จัดการปุ่ม
  form.addEventListener("click", (ev)=>{
  if(ev.target.classList.contains("rename-save")){
    const newTitle = input.value.trim() || "Untitled";
    li.dataset.chatName = newTitle;               // เดิมมีอยู่แล้ว
    li.dataset.renamed = "1";                     // << เพิ่ม
    li.querySelector(".title").textContent = newTitle;

    setTitlePreview(newTitle);                    // << เพิ่ม
    titleLockedByChatName = true;                 // << เพิ่ม

    form.remove();
  }
  if(ev.target.classList.contains("rename-cancel")){
    form.remove();
  }
});


  // Enter = save, Esc = cancel
  input.addEventListener("keydown", (ev)=>{
    if(ev.key === "Enter"){
      form.querySelector(".rename-save").click();
    }else if(ev.key === "Escape"){
      form.querySelector(".rename-cancel").click();
    }
  });
}

// ----- เปิด snapshot กลับสู่หน้าเดิมของรายการ -----
function openHistorySnapshot(li){
  const titleEl = document.getElementById("essay-title");
  const textEl  = document.getElementById("essay-input");

  // เติมหัวข้อ/เนื้อหา
  const topic    = li.dataset.topic || li.dataset.title || "";
  const chatName = li.dataset.chatName || "";
  const renamed  = li.dataset.renamed === "1";   // จะตั้งค่านี้ตอนกด Save rename

  titleEl.value = topic;
  textEl.value  = li.dataset.text || "";

  // ถ้ามีระบบ autoResize อยู่แล้ว: 
  // autoResize(titleEl); autoResize(textEl);

  // อัปเดตหัวข้อด้านบน + สถานะล็อก
  if (renamed) {
    setTitlePreview(chatName || topic);
    titleLockedByChatName = true;
  } else {
    setTitlePreview(topic);
    titleLockedByChatName = false;
  }

  // คะแนน/ฟีดแบ็ก
  let scores = [0,0,0,0,0];
  try{ scores = JSON.parse(li.dataset.scores || "[0,0,0,0,0]"); }catch(_){}
  const feedback = li.dataset.feedback || "";
  updateResult(scores, feedback);
}



// --- Auto-resize for the topic textarea ---
function autoResize(el){
  if(!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

document.addEventListener('DOMContentLoaded', ()=>{
  const titleEl = document.getElementById('essay-title');
  if (titleEl) {
    titleEl.addEventListener('input', ()=>autoResize(titleEl));
    autoResize(titleEl); // ปรับครั้งแรกตอนโหลดหน้า
  }
});



