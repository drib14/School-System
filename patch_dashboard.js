const fs = require('fs');
const file = 'frontend/src/pages/dashboard/DashboardPage.jsx';
let content = fs.readFileSync(file, 'utf8');

const enrollmentStatusComponent = `
function StudentEnrollmentTracker() {
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    // Fetch courses/sections
    api.get('/programs').then(res => setCourses(res.data.data)).catch(console.error);
    api.get('/sections').then(res => setSections(res.data.data)).catch(console.error);
  }, []);

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-header">
        <div className="card-title">Enrollment Status Tracker</div>
        <div className="card-sub">Follow the steps to complete your enrollment</div>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          {['Application', 'Select Section', 'Payment', 'Study Load'].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', opacity: step >= i + 1 ? 1 : 0.4 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: step > i + 1 ? '#10b981' : step === i + 1 ? '#3b82f6' : '#475569', color: '#fff', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{s}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <p>Your application is approved. You are ready to enroll for this semester.</p>
            <button className="btn btn-primary" onClick={() => setStep(2)}>Continue to Section Selection</button>
          </div>
        )}

        {step === 2 && (
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 15 }}>
              <label className="form-label">Select Course/Program</label>
              <select className="form-control" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                <option value="">Select...</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            {selectedCourse && (
              <div style={{ marginBottom: 15 }}>
                <label className="form-label">Available Sections</label>
                <select className="form-control" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                  <option value="">Select...</option>
                  {sections.filter(s => s.program === selectedCourse).map(s => <option key={s._id} value={s._id}>{s.name} ({s.capacity - (s.enrolledCount||0)} slots left)</option>)}
                </select>
              </div>
            )}
            <button className="btn btn-primary" disabled={!selectedSection} onClick={() => setStep(3)}>Proceed to Payment</button>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <p>Please complete your payment to finalize enrollment.</p>
            <button className="btn btn-success" onClick={() => setStep(4)}>Simulate Payment</button>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 40, color: '#10b981', marginBottom: 10 }}>🎉</div>
            <p style={{ fontWeight: 600, fontSize: 16 }}>Enrollment Successful!</p>
            <button className="btn btn-primary" onClick={() => alert('Downloading study load...')} style={{ marginTop: 10 }}>Download Study Load</button>
          </div>
        )}
      </div>
    </div>
  );
}
`;

if (!content.includes('StudentEnrollmentTracker')) {
  // Add component definition after StatCard
  content = content.replace('export default function DashboardPage()', enrollmentStatusComponent + '\nexport default function DashboardPage()');

  // Inject into render for student
  const renderPoint = `      {/* Stats Grid */}`;
  const studentInjection = `      {user?.role === 'student' && <StudentEnrollmentTracker />}
      {/* Stats Grid */}`;
  content = content.replace(renderPoint, studentInjection);

  fs.writeFileSync(file, content);
  console.log("Patched dashboard with student enrollment tracker");
}
