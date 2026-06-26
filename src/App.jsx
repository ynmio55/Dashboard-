import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Brain,
  Building2,
  ClipboardList,
  Download,
  Home,
  ListChecks,
  LogIn,
  LogOut,
  Menu,
  MonitorCog,
  RefreshCw,
  Siren,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { CSV_URL, DEPT_CSV_URL, ANALYSIS_CSV_URL, ROSA_CSV_URL } from './constants';
import { rowsFromCsv, parseAnalysisSheet, countBy, analyze, getSeverityColor } from './utils/helpers';

import { MetricCard } from './components/MetricCard';
import { BarList } from './components/BarList';
import { BodyMap } from './components/BodyMap';
import { DualBodyMap } from './components/DualBodyMap';
import { RowDetailModal } from './components/RowDetailModal';
import { ResponseTable } from './components/ResponseTable';
import { AnalysisView } from './components/AnalysisView';
import { RosaTableView } from './components/RosaTableView';
import { AuthView } from './components/AuthView';
import api from './services/api';

export default function App() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('กำลังโหลดข้อมูลจาก Google Sheets...');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedGender, setSelectedGender] = useState('all');
  const [user, setUser] = useState(null);
  const [rosaRows, setRosaRows] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/me')
        .then(data => { if (data.user) setUser(data.user); })
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  async function loadData() {
    setStatus('กำลังโหลดข้อมูลภาพรวม...');
    try {
      // 1. Try to load from cache first for instant render
      const cachedMain = localStorage.getItem('ergo_main_csv');
      if (cachedMain) {
        setRows(rowsFromCsv(cachedMain));
        setStatus('กำลังซิงค์ข้อมูลล่าสุดจาก Google Sheets...');
      }
      
      const cacheBuster = `&_t=${Date.now()}`;
      
      // 2. Fetch fresh main data
      const mainRes = await fetch(`${CSV_URL}${cacheBuster}`);
      const mainText = await mainRes.text();
      
      // Update cache and state with fresh data
      localStorage.setItem('ergo_main_csv', mainText);
      setRows(rowsFromCsv(mainText));
      setStatus('โหลดภาพรวมเสร็จสิ้น กำลังโหลดข้อมูลเบื้องหลัง...');

      // 3. Load ROSA data in the background (also with caching)
      const cachedRosa = localStorage.getItem('ergo_rosa_csv');
      const cachedAnalysis = localStorage.getItem('ergo_analysis_csv');
      
      if (cachedRosa) setRosaRows(rowsFromCsv(cachedRosa));
      if (cachedAnalysis) setAnalysisData(parseAnalysisSheet(cachedAnalysis));

      Promise.all([
        fetch(`${ANALYSIS_CSV_URL}${cacheBuster}`),
        fetch(`${ROSA_CSV_URL}${cacheBuster}`)
      ]).then(async ([analysisRes, rosaRes]) => {
        const analysisText = await analysisRes.text();
        const rosaText = await rosaRes.text();
        
        localStorage.setItem('ergo_analysis_csv', analysisText);
        localStorage.setItem('ergo_rosa_csv', rosaText);
        
        setRosaRows(rowsFromCsv(rosaText));
        setAnalysisData(parseAnalysisSheet(analysisText));
        
        setStatus(`อัปเดตล่าสุด: ${new Date().toLocaleString('th-TH')}`);
      }).catch(err => {
        setStatus(`อัปเดตล่าสุด: ${new Date().toLocaleString('th-TH')} (โหลดเบื้องหลังไม่สำเร็จ: ${err.message})`);
      });

    } catch (error) {
      if (!rows.length) {
        setStatus(`โหลดข้อมูลไม่สำเร็จ: ${error.message}`);
      }
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const maleRows = useMemo(() => rows.filter((row) => row['เพศ'] === 'ชาย'), [rows]);
  const femaleRows = useMemo(() => rows.filter((row) => row['เพศ'] === 'หญิง'), [rows]);

  const maleSummary = useMemo(() => analyze(maleRows), [maleRows]);
  const femaleSummary = useMemo(() => analyze(femaleRows), [femaleRows]);

  const filteredRows = useMemo(() => {
    if (selectedGender === 'ชาย') return maleRows;
    if (selectedGender === 'หญิง') return femaleRows;
    return rows;
  }, [rows, selectedGender, maleRows, femaleRows]);

  const summary = useMemo(() => analyze(filteredRows), [filteredRows]);
  const maxBody = Math.max(...summary.bodyParts.map((item) => item.pct), 1);

  const departments = useMemo(() => {
    const counts = countBy(filteredRows, 'หน่วยงานที่สังกัด  ');
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .filter(item => item.label && item.label !== 'ไม่ระบุ' && item.label !== 'ผลรวม' && item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredRows]);

  const maxDept = Math.max(...departments.map((item) => item.value), 1);

  const maxMaleBody = Math.max(...maleSummary.bodyParts.map((item) => item.pct), 1);
  const maxFemaleBody = Math.max(...femaleSummary.bodyParts.map((item) => item.pct), 1);
  const isGenderFilterVisible = activeTab !== 'gender-compare' && activeTab !== 'analysis-tab';
  const showSidebarLabels = isSidebarOpen || isMobileSidebarOpen;

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {selectedRow && (
        <RowDetailModal row={selectedRow} onClose={() => setSelectedRow(null)} />
      )}

      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="ปิดเมนู"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar Navigation */}
      <aside className={`sidebar-panel ${isMobileSidebarOpen ? 'sidebar-panel-open' : ''} ${isSidebarOpen ? 'lg:w-72' : 'lg:w-[88px]'} fixed inset-y-0 left-0 z-50 flex h-screen w-[min(84vw,20rem)] shrink-0 flex-col bg-white/95 backdrop-blur-xl border-r border-slate-200 shadow-2xl lg:sticky lg:top-0 lg:z-40 lg:bg-white/80 lg:shadow-sm transition-all duration-300 lg:relative group`}>

        <div className={`p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-center ${isSidebarOpen ? 'justify-between lg:justify-start' : 'justify-between lg:justify-center'} min-h-[76px] lg:min-h-[89px]`}>
           <div className={`flex items-center gap-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-full' : 'lg:w-10'}`}>
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0 hover:bg-blue-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
               title={isSidebarOpen ? "ยุบแถบเมนู" : "ขยายแถบเมนู"}
             >
               <MonitorCog size={24} />
             </button>
             {(isSidebarOpen || isMobileSidebarOpen) && (
               <h2 className="font-extrabold text-lg sm:text-xl text-slate-800 cursor-pointer select-none" onClick={() => setIsSidebarOpen(false)}>
                 Ergo Dashboard
               </h2>
             )}
           </div>
           <button
             type="button"
             className="ml-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 lg:hidden"
             onClick={() => setIsMobileSidebarOpen(false)}
             aria-label="ปิดเมนู"
           >
             <X size={20} />
           </button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-2 overflow-x-hidden">
          {[
            ['overview', Home, 'ภาพรวม'],
            ['msds', Siren, 'MSDs อาการปวด'],
            ['gender-compare', ArrowLeftRight, 'เปรียบเทียบชาย-หญิง'],
            ['analysis-tab', ClipboardList, 'วิเคราะห์ระดับอาการ (ROSA)'],
            ['knowledge', Brain, 'ความรู้ & พฤติกรรม'],
            ['departments', Building2, 'รายหน่วยงาน'],
            ['responses', ListChecks, 'ข้อมูลรายแถว'],
          ].map(([id, Icon, label]) => (
            <button 
              key={id} 
              onClick={() => handleNavClick(id)}
              className={`w-full flex items-center ${showSidebarLabels ? 'justify-start px-4' : 'justify-center px-0'} gap-3 py-3.5 rounded-xl font-bold text-base transition-all duration-200 ${
                activeTab === id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ' + (showSidebarLabels ? 'translate-x-1' : '')
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 ' + (showSidebarLabels ? 'hover:translate-x-1' : '')
              }`}
              title={!showSidebarLabels ? label : ''}
            >
              <Icon size={20} className="shrink-0" />
              {showSidebarLabels && <span className="whitespace-nowrap">{label}</span>}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50 overflow-x-hidden">
          <button 
            className={`w-full flex items-center ${showSidebarLabels ? 'justify-center px-4' : 'justify-center px-0'} gap-2 py-2.5 rounded-xl font-bold text-sm text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors`}
            onClick={loadData}
            title={!showSidebarLabels ? 'รีเฟรชข้อมูล' : ''}
          >
            <RefreshCw size={16} className="shrink-0" />
            {showSidebarLabels && <span className="whitespace-nowrap">รีเฟรชข้อมูล</span>}
          </button>
          <a 
            className={`w-full flex items-center ${showSidebarLabels ? 'justify-center px-4' : 'justify-center px-0'} gap-2 py-2.5 rounded-xl font-bold text-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors`}
            href={CSV_URL}
            target="_blank" rel="noreferrer"
            title={!showSidebarLabels ? 'โหลด CSV' : ''}
          >
            <Download size={16} className="shrink-0" />
            {showSidebarLabels && <span className="whitespace-nowrap">โหลด CSV</span>}
          </a>
          

        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-y-auto">
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-sky-700 text-white px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-12 shadow-lg shrink-0">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-pattern"></div>
        <div className="relative z-10 w-full flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex w-full items-start gap-3 lg:w-auto">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md border border-white/20 shadow-md transition-colors hover:bg-white/20 lg:hidden"
              aria-label="เปิดเมนู"
            >
              <Menu size={22} />
            </button>
            <div className="hidden sm:flex flex-shrink-0 w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md rounded-2xl items-center justify-center border border-white/20 shadow-xl">
              <MonitorCog size={36} className="text-sky-300" />
            </div>
          </div>
          <div className="min-w-0 flex-grow">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-100 whitespace-normal leading-tight">
              Dashboard การยศาสตร์ในบุคลากรที่ปฏิบัติงานกับคอมพิวเตอร์
            </h1>
            <p className="text-sky-200 font-medium text-xs sm:text-sm md:text-base leading-relaxed">กลุ่มงานอาชีวเวชกรรม โรงพยาบาลสกลนคร | ปีงบประมาณ 2569</p>
          </div>
          <div className="flex w-full flex-col items-start gap-3 lg:mt-0 lg:w-auto lg:items-end">
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1 pr-1 sm:flex-wrap sm:overflow-visible sm:pb-0 lg:justify-end hide-scrollbar">
              <span className="inline-flex shrink-0 items-center gap-2 px-3 sm:px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm font-semibold text-xs sm:text-sm text-sky-50">
                <ClipboardList size={16} /> ระยะ: Pre-test / Post-test
              </span>
              {isGenderFilterVisible && (
                <div className="flex shrink-0 items-center bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-sm">
                  <button 
                    onClick={() => setSelectedGender('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                      selectedGender === 'all' 
                        ? 'bg-white text-slate-800 shadow-sm font-extrabold' 
                        : 'text-sky-100 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  <button 
                    onClick={() => setSelectedGender('ชาย')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                      selectedGender === 'ชาย' 
                        ? 'bg-blue-600 text-white shadow-md border border-white/20 font-extrabold' 
                        : 'text-sky-100 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    ชาย ♂
                  </button>
                  <button 
                    onClick={() => setSelectedGender('หญิง')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                      selectedGender === 'หญิง' 
                        ? 'bg-pink-600 text-white shadow-md border border-white/20 font-extrabold' 
                        : 'text-sky-100 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    หญิง ♀
                  </button>
                </div>
              )}
            </div>
            <div className="flex max-w-full flex-col items-start gap-3 sm:flex-row sm:items-center lg:justify-end">
              <small className="max-w-full truncate text-sky-200/80 font-medium text-xs bg-black/20 px-3 py-1 rounded-full">{status}</small>
              
              {user ? (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1 pr-3 rounded-full border border-white/20 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-white text-indigo-700 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                    {(user.first_name || user.username).charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-white">{user.first_name || user.username}</span>
                  <button onClick={handleLogout} className="text-sky-200 hover:text-white ml-2 transition-colors" title="ออกจากระบบ">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setActiveTab('responses')} 
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-sm font-semibold text-sm text-white transition-all"
                >
                  <LogIn size={16} />
                  เข้าสู่ระบบ
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile / Tablet Top Bar */}
      <nav className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="flex h-14 w-full items-center justify-between gap-3 px-3 sm:px-5">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-colors hover:bg-blue-700"
            aria-label="เปิดเมนู"
          >
            <Menu size={21} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-slate-800">Ergo Dashboard</p>
            <p className="truncate text-[11px] font-medium text-slate-500">{status}</p>
          </div>
          {user ? (
            <button onClick={handleLogout} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-rose-600 bg-rose-50">
              <LogOut size={17} />
            </button>
          ) : (
            <button onClick={() => handleNavClick('responses')} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-blue-600 bg-blue-50">
              <LogIn size={17} />
            </button>
          )}
        </div>
      </nav>

      <section className="w-full px-3 sm:px-5 md:px-8 py-5 sm:py-6 md:py-8 space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricCard icon={Users} title="ผู้ตอบแบบสอบถามทั้งหมด" value={summary.total.toLocaleString('th-TH')} sub={`Pre-test ${summary.pre} + Post ${summary.post}`} color="#3b82f6" />
              <MetricCard icon={ClipboardList} title="ทำแบบทดสอบ Pre-test" value={summary.pre.toLocaleString('th-TH')} sub={summary.total ? `${((summary.pre / summary.total) * 100).toFixed(1)}% ของคำตอบทั้งหมด` : '-'} color="#0ea5e9" />
              <MetricCard icon={Brain} title="คะแนนความรู้เฉลี่ย" value={`${summary.knowledgeAvg.toFixed(2)}/10`} sub="คะแนนจาก 10 ข้อ" color="#10b981" />
              <MetricCard icon={ClipboardList} title="คะแนนพฤติกรรมเฉลี่ย" value={`${summary.behaviorAvg.toFixed(2)}/5`} sub="คะแนนเต็ม 5" color="#f59e0b" />
              <MetricCard icon={Siren} title="พบอาการ MSDs ใน 7 วัน" value={`${summary.currentMsdsPct.toFixed(1)}%`} sub="ผู้มีอาการปวด/ชา/เมื่อยล้า" color="#ef4444" />
              <MetricCard icon={BarChart3} title="ตำแหน่งที่ปวดมากที่สุด" value={summary.highestBody.key} sub={`${summary.highestBody.pct.toFixed(1)}% จากกลุ่ม Pre-test`} color="#8b5cf6" />
            </div>

            <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 shadow-sm">
              <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <b className="block text-orange-900 text-base mb-1">ข้อค้นพบสำคัญ</b>
                <span className="text-orange-800 text-sm leading-relaxed">
                  ตำแหน่งที่มีอาการสูงสุดคือ <strong className="font-bold">{summary.highestBody.key}</strong> ({summary.highestBody.pct.toFixed(1)}%) ขณะที่คะแนนพฤติกรรมเฉลี่ยอยู่ที่ <strong className="font-bold">{summary.behaviorAvg.toFixed(2)}/5</strong> และคะแนนความรู้เฉลี่ย <strong className="font-bold">{summary.knowledgeAvg.toFixed(2)}/10</strong>
                </span>
              </div>
            </div>
          </>
        )}

        {(activeTab === 'overview' || activeTab === 'msds') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="flex items-center gap-3 text-xl font-extrabold text-slate-800 mb-8 pb-4 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]"></span> 
                ความชุกอาการ MSDs ตามตำแหน่งร่างกาย (%)
              </h2>
              <BarList 
                data={summary.bodyParts} 
                maxValue={maxBody} 
                colorMapper={(item) => getSeverityColor(item.pct ?? item.value ?? item.score)}
              />
            </section>
            <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="flex items-center gap-3 text-xl font-extrabold text-slate-800 mb-8 pb-4 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></span> 
                Body Map — แผนที่อาการ MSDs จำแนกตำแหน่งร่างกาย (n={summary.pre})
              </h2>
              <BodyMap parts={summary.bodyParts} />
            </section>
          </div>
        )}

        {activeTab === 'overview' && (
          <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h2 className="flex items-center gap-3 text-xl font-extrabold text-slate-800 mb-8 pb-4 border-b border-slate-100">
              <span className="w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.6)]"></span> 
              ชั่วโมงใช้งานคอมพิวเตอร์ต่อวัน
            </h2>
            <BarList data={summary.workHours} maxValue={Math.max(...summary.workHours.map((item) => item.value), 1)} unit=" คน" compact />
          </section>
        )}

        {(activeTab === 'overview' || activeTab === 'knowledge') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="flex items-center gap-3 text-xl font-extrabold text-slate-800 mb-8 pb-4 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"></span> 
                ความรู้รายข้อ (% ตอบถูก)
              </h2>
              <BarList data={summary.knowledgeItems} maxValue={100} />
            </section>
            <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="flex items-center gap-3 text-xl font-extrabold text-slate-800 mb-8 pb-4 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]"></span> 
                พฤติกรรมรายข้อ (คะแนนเฉลี่ย)
              </h2>
              <BarList data={summary.behaviorItems} maxValue={5} unit="คะแนน" />
            </section>
          </div>
        )}

        {activeTab === 'departments' && (
          <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h2 className="flex items-center gap-3 text-xl font-extrabold text-slate-800 mb-8 pb-4 border-b border-slate-100">
              <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span> 
              จำนวนผู้ตอบตามหน่วยงาน ({selectedGender === 'all' ? `ทั้งหมด ${filteredRows.length.toLocaleString('th-TH')} คน` : `เฉพาะเพศ${selectedGender} ${filteredRows.length.toLocaleString('th-TH')} คน`})
            </h2>
            <BarList data={departments} maxValue={maxDept} unit=" คน" />
          </section>
        )}


        
        {activeTab === 'analysis-tab' && (
          <RosaTableView rows={rosaRows} user={user} onGoToLogin={() => setActiveTab('responses')} />
        )}

        {activeTab === 'gender-compare' && (
          <>
            {/* Comparison Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in duration-300">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Users size={60} />
                </div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">จำนวนผู้ตอบแบบสอบถาม</span>
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-medium text-blue-500 mr-1">ชาย:</span>
                    <b className="text-2xl font-bold text-slate-800">{maleSummary.total} ราย</b>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-pink-500 mr-1">หญิง:</span>
                    <b className="text-2xl font-bold text-slate-800">{femaleSummary.total} ราย</b>
                  </div>
                </div>
                <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div style={{ width: `${(maleSummary.total / (rows.length || 1)) * 100}%` }} className="bg-blue-500 h-full"></div>
                  <div style={{ width: `${(femaleSummary.total / (rows.length || 1)) * 100}%` }} className="bg-pink-500 h-full"></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Brain size={60} />
                </div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">คะแนนความรู้เฉลี่ย (เต็ม 10)</span>
                <div className="flex justify-between items-baseline mt-1">
                  <div>
                    <span className="text-xs font-medium text-blue-500 mr-1">ชาย:</span>
                    <b className="text-3xl font-black text-blue-600">{maleSummary.knowledgeAvg.toFixed(2)}</b>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-pink-500 mr-1">หญิง:</span>
                    <b className="text-3xl font-black text-pink-600">{femaleSummary.knowledgeAvg.toFixed(2)}</b>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                  {maleSummary.knowledgeAvg > femaleSummary.knowledgeAvg 
                    ? `เพศชายมีความรู้เฉลี่ยมากกว่า ${(maleSummary.knowledgeAvg - femaleSummary.knowledgeAvg).toFixed(2)} คะแนน`
                    : `เพศหญิงมีความรู้เฉลี่ยมากกว่า ${(femaleSummary.knowledgeAvg - maleSummary.knowledgeAvg).toFixed(2)} คะแนน`}
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <ClipboardList size={60} />
                </div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">คะแนนพฤติกรรมเฉลี่ย (เต็ม 5)</span>
                <div className="flex justify-between items-baseline mt-1">
                  <div>
                    <span className="text-xs font-medium text-blue-500 mr-1">ชาย:</span>
                    <b className="text-3xl font-black text-blue-600">{maleSummary.behaviorAvg.toFixed(2)}</b>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-pink-500 mr-1">หญิง:</span>
                    <b className="text-3xl font-black text-pink-600">{femaleSummary.behaviorAvg.toFixed(2)}</b>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                  {maleSummary.behaviorAvg > femaleSummary.behaviorAvg 
                    ? `เพศชายพฤติกรรมดีกว่า ${(maleSummary.behaviorAvg - femaleSummary.behaviorAvg).toFixed(2)} คะแนน`
                    : `เพศหญิงพฤติกรรมดีกว่า ${(femaleSummary.behaviorAvg - maleSummary.behaviorAvg).toFixed(2)} คะแนน`}
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Siren size={60} />
                </div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">พบอาการ MSDs ใน 7 วัน (%)</span>
                <div className="flex justify-between items-baseline mt-1">
                  <div>
                    <span className="text-xs font-medium text-blue-500 mr-1">ชาย:</span>
                    <b className="text-3xl font-black text-blue-600">{maleSummary.currentMsdsPct.toFixed(1)}%</b>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-pink-500 mr-1">หญิง:</span>
                    <b className="text-3xl font-black text-pink-600">{femaleSummary.currentMsdsPct.toFixed(1)}%</b>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                  {Math.abs(maleSummary.currentMsdsPct - femaleSummary.currentMsdsPct).toFixed(1)}% คือผลต่างสัดส่วนอาการปวด
                </span>
              </div>
            </div>

            {/* Dual Body Map */}
            <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-300">
              <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h2 className="flex items-center gap-3 text-xl font-extrabold text-slate-800 mb-8 pb-4 border-b border-slate-100">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span> 
                  แผนที่ร่างกายคู่จำแนกเพศ — เปรียบเทียบความชุกอาการปวด MSDs (n ชาย={maleSummary.pre}, หญิง={femaleSummary.pre})
                </h2>
                <DualBodyMap 
                  maleParts={maleSummary.bodyParts} 
                  femaleParts={femaleSummary.bodyParts} 
                  maleCount={maleSummary.pre}
                  femaleCount={femaleSummary.pre}
                />
              </section>
            </div>

            {/* Side-by-Side MSDs Bar Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
              <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h2 className="flex items-center gap-3 text-xl font-extrabold text-slate-800 mb-8 pb-4 border-b border-slate-100">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] flex items-center justify-center text-[10px] text-white font-bold">♂</span> 
                  ความชุกอาการ MSDs เพศชาย (%)
                </h2>
                <BarList 
                  data={maleSummary.bodyParts} 
                  maxValue={maxMaleBody} 
                  colorMapper={(item) => getSeverityColor(item.pct ?? item.value ?? item.score)}
                />
              </section>
              <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h2 className="flex items-center gap-3 text-xl font-extrabold text-slate-800 mb-8 pb-4 border-b border-slate-100">
                  <span className="w-3.5 h-3.5 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] flex items-center justify-center text-[10px] text-white font-bold">♀</span> 
                  ความชุกอาการ MSDs เพศหญิง (%)
                </h2>
                <BarList 
                  data={femaleSummary.bodyParts} 
                  maxValue={maxFemaleBody} 
                  colorMapper={(item) => getSeverityColor(item.pct ?? item.value ?? item.score)}
                />
              </section>
            </div>

            {/* Side-by-Side Knowledge and Behavior Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
              <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h2 className="flex items-center gap-3 text-xl font-extrabold text-slate-800 mb-6 pb-4 border-b border-slate-100">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"></span> 
                  ความรู้รายข้อเปรียบเทียบชาย-หญิง (% ตอบถูก)
                </h2>
                <div className="space-y-4">
                  {maleSummary.knowledgeItems.map((maleItem, idx) => {
                    const femaleItem = femaleSummary.knowledgeItems[idx];
                    return (
                      <div key={maleItem.key} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <div className="text-xs font-semibold text-slate-600 mb-2 truncate" title={maleItem.label}>
                          {maleItem.key}. {maleItem.label}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-blue-500 shrink-0">ชาย ♂</span>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex-grow shadow-inner">
                              <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${maleItem.score}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-10 text-right">{Math.round(maleItem.score)}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-pink-500 shrink-0">หญิง ♀</span>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex-grow shadow-inner">
                              <div className="bg-pink-500 h-full rounded-full transition-all duration-1000" style={{ width: `${femaleItem.score}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-10 text-right">{Math.round(femaleItem.score)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h2 className="flex items-center gap-3 text-xl font-extrabold text-slate-800 mb-6 pb-4 border-b border-slate-100">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]"></span> 
                  พฤติกรรมรายข้อเปรียบเทียบชาย-หญิง (คะแนนเฉลี่ย 1-5)
                </h2>
                <div className="space-y-4">
                  {maleSummary.behaviorItems.map((maleItem, idx) => {
                    const femaleItem = femaleSummary.behaviorItems[idx];
                    return (
                      <div key={maleItem.key} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <div className="text-xs font-semibold text-slate-600 mb-2 truncate" title={maleItem.label}>
                          {maleItem.key}. {maleItem.label}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-blue-500 shrink-0">ชาย ♂</span>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex-grow shadow-inner">
                              <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(maleItem.score / 5) * 100}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-10 text-right">{maleItem.score.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-pink-500 shrink-0">หญิง ♀</span>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex-grow shadow-inner">
                              <div className="bg-pink-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(femaleItem.score / 5) * 100}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-10 text-right">{femaleItem.score.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </>
        )}

        {activeTab === 'overview' && (
          <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h2 className="flex items-center gap-3 text-xl font-extrabold text-slate-800 mb-8 pb-4 border-b border-slate-100">
              <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></span> 
              ข้อมูลรายแถว ({selectedGender === 'all' ? `ทั้งหมด ${filteredRows.length.toLocaleString('th-TH')} รายการ` : `เฉพาะเพศ${selectedGender} ${filteredRows.length.toLocaleString('th-TH')} รายการ`}) จาก Google Sheet
            </h2>
            {user ? (
              <ResponseTable rows={filteredRows} onRowClick={setSelectedRow} />
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mt-8 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center mb-6">
                   <span className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 shadow-inner">
                     <AlertTriangle size={40} />
                   </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">ข้อมูลถูกจำกัดการเข้าถึง</h3>
                <p className="text-slate-500 font-medium">กรุณาเข้าสู่ระบบจากเมนูด้านบน เพื่อดูข้อมูลรายแถว</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'responses' && !user && (
          <AuthView onLoginSuccess={setUser} />
        )}

        {activeTab === 'responses' && user && (
          <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
              <h2 className="flex items-center gap-3 text-xl font-extrabold text-slate-800">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span> 
                ข้อมูลรายแถว ({selectedGender === 'all' ? `ทั้งหมด ${filteredRows.length.toLocaleString('th-TH')} รายการ` : `เฉพาะเพศ${selectedGender} ${filteredRows.length.toLocaleString('th-TH')} รายการ`}) จาก Google Sheet
              </h2>
            </div>
            <div className="bg-slate-50 text-slate-500 text-sm p-4 rounded-xl mb-6 flex items-start gap-3 border border-slate-100">
              <AlertTriangle className="text-slate-400 shrink-0 mt-0.5" size={18} />
              <p>แสดงตามข้อมูลที่ Google Sheets ส่งผ่านลิงก์ export แบบไม่ต้องลงชื่อเข้าใช้ ถ้าในชีตเปิด filter อยู่ จำนวนนี้อาจน้อยกว่าแถวทั้งหมดที่เห็นในหน้า Google Sheet</p>
            </div>
            <ResponseTable rows={filteredRows} onRowClick={setSelectedRow} />
          </section>
        )}
      </section>
      </div>
    </div>
  );
}
