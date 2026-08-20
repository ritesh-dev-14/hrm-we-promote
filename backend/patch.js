const fs = require('fs');

const mrPath = 'F:\\We Promote Frontend ok\\hrm-frontend-main\\src\\pages\\Manager\\MarketingReportsPage.jsx';
let mrContent = fs.readFileSync(mrPath, 'utf8');

// Update INITIAL_FORM
mrContent = mrContent.replace(
  'clientName: "",',
  'clientName: "",\n  clientContactNumber: "",'
);

// Update setForm in openEdit
mrContent = mrContent.replace(
  'clientName: report.clientName || "",',
  'clientName: report.clientName || "",\n      clientContactNumber: report.clientContactNumber || "",'
);

// Inject UI for clientContactNumber in MarketingReportsPage
const mrRegex = /(<div className="space-y-4">[\s\S]*?)<div>\s*<label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">\s*Client Name/;
if (mrContent.match(mrRegex)) {
  mrContent = mrContent.replace(mrRegex, `$1<div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Client Contact Number</label>
                  <input type="text" value={form.clientContactNumber} onChange={(e) => setForm({...form, clientContactNumber: e.target.value})} placeholder="Contact Number" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Client Name`);
} else {
  // alternative injection right before Video Link
  mrContent = mrContent.replace(
    '<div>\n                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">\n                    Video Link',
    '<div>\n                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Client Contact Number</label>\n                  <input type="text" value={form.clientContactNumber} onChange={(e) => setForm({...form, clientContactNumber: e.target.value})} placeholder="Contact Number" className={inputCls} />\n                </div>\n                <div>\n                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">\n                    Video Link'
  );
}

fs.writeFileSync(mrPath, mrContent);

const seoPath = 'F:\\We Promote Frontend ok\\hrm-frontend-main\\src\\components\\projects\\SeoReportModal.jsx';
let seoContent = fs.readFileSync(seoPath, 'utf8');

seoContent = seoContent.replace(
  'const [keywords, setKeywords] = useState([""]);',
  'const [keywords, setKeywords] = useState([""]);\n  const [clientContactNumber, setClientContactNumber] = useState("");'
);

seoContent = seoContent.replace(
  'if (remarks) formData.append("remarks", remarks);',
  'if (remarks) formData.append("remarks", remarks);\n      if (clientContactNumber) formData.append("clientContactNumber", clientContactNumber);'
);

const seoUIRegex = /(<label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1\.5">\s*<Search size=\{12\} \/>\s*Keywords)/;
seoContent = seoContent.replace(seoUIRegex, `<div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Client Contact Number
              </label>
              <input type="text" value={clientContactNumber} onChange={(e) => setClientContactNumber(e.target.value)} placeholder="Contact Number" className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition mb-4" />
            </div>\n            $1`);

fs.writeFileSync(seoPath, seoContent);
console.log("Done patching frontend.");
