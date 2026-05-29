import React, { useState, useCallback, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  FileSpreadsheet, 
  Trash2, 
  Activity, 
  BarChart3, 
  CheckCircle,
  TrendingUp,
  Users,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// --- Mock Data ---

const revenueData = [
  { name: 'يناير', value: 4000, profit: 2400 },
  { name: 'فبراير', value: 3000, profit: 1398 },
  { name: 'مارس', value: 2000, profit: 9800 },
  { name: 'أبريل', value: 2780, profit: 3908 },
  { name: 'مايو', value: 1890, profit: 4800 },
  { name: 'يونيو', value: 2390, profit: 3800 },
  { name: 'يوليو', value: 3490, profit: 4300 },
];

const categoryData = [
  { name: 'تقارير مالية', value: 400 },
  { name: 'بيانات موظفين', value: 300 },
  { name: 'عقود', value: 300 },
  { name: 'فواتير', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// --- Types ---
type FileType = 'pdf' | 'excel' | 'unknown';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: FileType;
  file: File;
}

// --- Helper Components ---

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp }: StatCardProps) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between transition-all hover:shadow-md">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {trend && (
        <div className={`flex items-center mt-2 text-sm ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
          <TrendingUp className={`w-4 h-4 mr-1 ${!trendUp && 'rotate-180'}`} />
          <span>{trend}</span>
        </div>
      )}
    </div>
    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

// --- Main App Component ---

function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'dashboard'>('idle');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const getFileType = (file: File): FileType => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) return 'pdf';
    if (
      file.type.includes('excel') || 
      file.type.includes('spreadsheetml') || 
      file.name.endsWith('.xls') || 
      file.name.endsWith('.xlsx')
    ) return 'excel';
    return 'unknown';
  };

  const processFiles = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(f => getFileType(f) !== 'unknown');
    
    if (validFiles.length < newFiles.length) {
       alert("تم تجاهل بعض الملفات. يرجى رفع ملفات PDF أو Excel فقط.");
    }

    const newUploadedFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: getFileType(file),
      file
    }));

    setFiles(prev => [...prev, ...newUploadedFiles]);
    setStatus('idle'); // Reset if they want to analyze again
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [processFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startAnalysis = () => {
    if (files.length === 0) return;
    
    setStatus('analyzing');
    setProgress(0);

    // Mock progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setStatus('dashboard'), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-8" dir="rtl">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            نظام التحليل الذكي
          </h1>
          <p className="text-slate-500 mt-2">قم برفع ملفات البيانات وسنقوم بتحليلها وعرضها لك في لوحة تحكم تفاعلية</p>
        </div>
        {status === 'dashboard' && (
          <button 
            onClick={() => setStatus('idle')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium"
          >
            رفع ملفات جديدة
          </button>
        )}
      </header>

      <main className="max-w-6xl mx-auto">
        
        {/* State: Upload & File List */}
        {(status === 'idle' || status === 'uploading') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Uploader Section */}
            <div className="lg:col-span-2">
              <div 
                className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all bg-white
                  ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-slate-300 hover:border-blue-400'}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                  <UploadCloud className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold mb-2">اسحب وأفلت الملفات هنا</h3>
                <p className="text-slate-500 mb-6 max-w-sm">
                  يدعم النظام ملفات Excel (.xlsx, .xls) وملفات PDF (.pdf) بحد أقصى 50 ميجابايت للملف.
                </p>
                <input 
                  type="file" 
                  multiple 
                  accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileInput}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-200"
                >
                  استعراض الملفات
                </button>
              </div>
            </div>

            {/* File List Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                <span>الملفات المرفقة</span>
                <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-sm">{files.length}</span>
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {files.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                    <FileText className="w-12 h-12 mb-3 opacity-20" />
                    <p>لم يتم إرفاق أي ملفات بعد</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {files.map(file => (
                      <li key={file.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors group">
                        <div className="flex items-center overflow-hidden">
                          {file.type === 'pdf' ? (
                            <FileText className="w-8 h-8 text-rose-500 shrink-0 ml-3" />
                          ) : (
                            <FileSpreadsheet className="w-8 h-8 text-emerald-500 shrink-0 ml-3" />
                          )}
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFile(file.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                          title="حذف الملف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button 
                  onClick={startAnalysis}
                  disabled={files.length === 0}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-sm
                    ${files.length > 0 ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-300 cursor-not-allowed'}
                  `}
                >
                  بدء التحليل واستخراج البيانات
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State: Analyzing */}
        {status === 'analyzing' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm text-center max-w-2xl mx-auto mt-12">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="45" className="stroke-slate-100" strokeWidth="6" fill="none" />
                <circle 
                  cx="48" cy="48" r="45" 
                  className="stroke-indigo-600 transition-all duration-300 ease-out" 
                  strokeWidth="6" 
                  fill="none" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 - (283 * progress) / 100} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-indigo-600">
                {progress}%
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">جاري تحليل البيانات...</h2>
            <p className="text-slate-500 mb-6">نقوم الآن بمعالجة {files.length} ملفات واستخراج المؤشرات الهامة باستخدام الذكاء الاصطناعي.</p>
            
            <div className="flex justify-center gap-2">
               <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
               <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
               <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}

        {/* State: Dashboard */}
        {status === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="إجمالي الملفات المحللة" value={files.length} icon={FileText} />
              <StatCard title="إجمالي الإيرادات (مقدر)" value="$45,231" icon={BarChart3} trend="+12.5%" trendUp={true} />
              <StatCard title="المستخدمين النشطين" value="2,845" icon={Users} trend="+3.2%" trendUp={true} />
              <StatCard title="تنبيهات النظام" value="3" icon={AlertCircle} trend="-2" trendUp={false} />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Area Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-6">نظرة عامة على الأداء المالي</h3>
                <div className="flex-1 w-full min-h-[300px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" />
                      <Area type="monotone" dataKey="value" name="الإيرادات" stroke="#4f46e5" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                      <Area type="monotone" dataKey="profit" name="الأرباح" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-6">تصنيف البيانات المستخرجة</h3>
                <div className="flex-1 w-full min-h-[300px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-6">مقارنة المؤشرات الرئيسية</h3>
                <div className="flex-1 w-full min-h-[300px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" name="القيمة" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Analyzed Files Summary */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">الملفات التي تم تحليلها بنجاح</h3>
                <div className="space-y-4">
                  {files.map(file => (
                    <div key={file.id} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <div className="bg-emerald-100 p-2 rounded-full mr-4 ml-4">
                         <CheckCircle className="w-6 h-6 text-emerald-600" />
                       </div>
                       <div className="flex-1">
                         <h4 className="font-semibold text-slate-800">{file.name}</h4>
                         <div className="flex items-center text-sm text-slate-500 mt-1 gap-4">
                           <span>{file.type.toUpperCase()}</span>
                           <span>•</span>
                           <span>{formatBytes(file.size)}</span>
                         </div>
                       </div>
                       <div className="text-right">
                         <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                           مكتمل
                         </span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default App;