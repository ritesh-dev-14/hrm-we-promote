const fs = require('fs');

const mrPath = 'F:\\We Promote Frontend ok\\hrm-frontend-main\\src\\pages\\Manager\\MarketingReportsPage.jsx';
let mrContent = fs.readFileSync(mrPath, 'utf8');

const target = '<label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Client Name</label>';
const replacement = `<label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Client Contact Number</label>
                  <input value={form.clientContactNumber} onChange={(e) => setForm((f) => ({ ...f, clientContactNumber: e.target.value }))} placeholder="e.g. 9876543210" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Client Name</label>`;

if (mrContent.includes(target) && !mrContent.includes('placeholder="e.g. 9876543210"')) {
  mrContent = mrContent.replace(target, replacement);
  fs.writeFileSync(mrPath, mrContent);
  console.log("Patched MarketingReportsPage.jsx");
} else {
  console.log("Already patched or target not found in MarketingReportsPage.jsx");
}
