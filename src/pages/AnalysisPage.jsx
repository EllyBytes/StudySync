import AnalysisDashboard from '../components/AnalysisDashboard';

function AnalysisPage({ subjects, schedule }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Analysis</h1>
      <AnalysisDashboard subjects={subjects} schedule={schedule} />
    </div>
  );
}

export default AnalysisPage;