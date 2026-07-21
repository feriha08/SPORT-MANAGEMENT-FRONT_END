import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSchool, FaUserGraduate, FaTrophy, FaCalendarAlt,
  FaFutbol, FaUsers, FaFileAlt, FaDownload, FaPrint,
  FaChartBar, FaEye, FaSpinner, FaCheckCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './Reports.css';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [reportData, setReportData] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalStudents: 0,
    totalCompetitions: 0,
    totalFixtures: 0,
    totalMatches: 0,
    totalUsers: 0
  });

  useEffect(() => {
    fetchStats();
    fetchCompetitions();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        schoolsRes,
        studentsRes,
        competitionsRes,
        fixturesRes,
        matchesRes,
        usersRes
      ] = await Promise.all([
        axiosInstance.get('schools/'),
        axiosInstance.get('students/'),
        axiosInstance.get('competitions/'),
        axiosInstance.get('fixtures/'),
        axiosInstance.get('matches/'),
        axiosInstance.get('accounts/list/')
      ]);

      setStats({
        totalSchools: schoolsRes.data?.length || 0,
        totalStudents: studentsRes.data?.length || 0,
        totalCompetitions: competitionsRes.data?.length || 0,
        totalFixtures: fixturesRes.data?.length || 0,
        totalMatches: matchesRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCompetitions = async () => {
    try {
      const response = await axiosInstance.get('competitions/');
      setCompetitions(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    }
  };

  const generateReport = async () => {
    if (!selectedCompetition) {
      toast.error('Please select a competition');
      return;
    }

    setGenerating(true);
    try {
      // Fetch competition data
      const compRes = await axiosInstance.get(`competitions/${selectedCompetition}/`);
      const participantsRes = await axiosInstance.get(`competitions/${selectedCompetition}/participations/`);
      const matchesRes = await axiosInstance.get(`matches/?competition=${selectedCompetition}`);
      const fixturesRes = await axiosInstance.get(`fixtures/?competition=${selectedCompetition}`);
      const topScorersRes = await axiosInstance.get(`matches/top-scorers/${selectedCompetition}/`);

      const competition = compRes.data;
      const participants = participantsRes.data || [];
      const matches = matchesRes.data || [];
      const fixtures = fixturesRes.data || [];
      const topScorers = topScorersRes.data || [];

      // Calculate stats
      const totalMatches = matches.length;
      const finishedMatches = matches.filter(m => m.status === 'Finished').length;
      const totalGoals = matches.reduce((sum, m) => sum + (m.home_score || 0) + (m.away_score || 0), 0);
      const totalSchools = participants.length;

      setReportData({
        competition: competition,
        participants: participants,
        matches: matches,
        fixtures: fixtures,
        topScorers: topScorers,
        stats: {
          totalMatches,
          finishedMatches,
          totalGoals,
          totalSchools
        }
      });

      setShowReport(true);
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast.info('PDF download feature coming soon!');
  };

  const reportCards = [
    {
      title: 'Schools Report',
      icon: <FaSchool />,
      count: stats.totalSchools,
      color: 'blue',
      link: '/admin/reports/schools'
    },
    {
      title: 'Students Report',
      icon: <FaUserGraduate />,
      count: stats.totalStudents,
      color: 'purple',
      link: '/admin/reports/students'
    },
    {
      title: 'Competitions Report',
      icon: <FaTrophy />,
      count: stats.totalCompetitions,
      color: 'yellow',
      link: '/admin/reports/competitions'
    },
    {
      title: 'Fixtures Report',
      icon: <FaCalendarAlt />,
      count: stats.totalFixtures,
      color: 'blue',
      link: '/admin/reports/fixtures'
    },
    {
      title: 'Matches Report',
      icon: <FaFutbol />,
      count: stats.totalMatches,
      color: 'red',
      link: '/admin/reports/matches'
    },
    {
      title: 'Users Report',
      icon: <FaUsers />,
      count: stats.totalUsers,
      color: 'green',
      link: '/admin/reports/users'
    }
  ];

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and view system reports</p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="report-cards-grid">
        {reportCards.map((card, index) => (
          <Link to={card.link} key={index} className="report-card report-card-${card.color}">
            <div className="report-card-icon">{card.icon}</div>
            <div className="report-card-content">
              <p className="report-card-title">{card.title}</p>
              <p className="report-card-count">{card.count}</p>
            </div>
            <div className="report-card-arrow">
              <FaEye />
            </div>
          </Link>
        ))}
      </div>

      {/* Generate Competition Report */}
      <Card className="generate-report-card">
        <h3>Generate Competition Report</h3>
        <p className="generate-subtitle">Select a competition to generate a detailed report</p>
        
        <div className="generate-form">
          <div className="form-group">
            <label>Select Competition</label>
            <select 
              value={selectedCompetition}
              onChange={(e) => setSelectedCompetition(e.target.value)}
              className="form-control"
            >
              <option value="">-- Select Competition --</option>
              {competitions.map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.name} ({comp.sport} - {comp.status})
                </option>
              ))}
            </select>
          </div>
          <button 
            className="btn btn-primary generate-btn"
            onClick={generateReport}
            disabled={generating || !selectedCompetition}
          >
            {generating ? (
              <>
                <FaSpinner className="spinning" /> Generating...
              </>
            ) : (
              <>
                <FaFileAlt /> Generate Report
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Report Preview */}
      {showReport && reportData && (
        <div className="report-preview" id="report-preview">
          <div className="report-preview-header">
            <div className="report-preview-actions">
              <button className="btn btn-secondary" onClick={handlePrint}>
                <FaPrint /> Print
              </button>
              <button className="btn btn-primary" onClick={handleDownloadPDF}>
                <FaDownload /> Download PDF
              </button>
            </div>
          </div>

          <Card className="report-content">
            {/* Report Header */}
            <div className="report-header">
              <h2>{reportData.competition.name} - Report</h2>
              <p>Generated on: {new Date().toLocaleString()}</p>
              <div className="report-meta">
                <span>Sport: {reportData.competition.sport}</span>
                <span>Season: {reportData.competition.season}</span>
                <span>Gender: {reportData.competition.gender}</span>
                <span>Status: {reportData.competition.status}</span>
              </div>
            </div>

            {/* Report Stats */}
            <div className="report-stats-grid">
              <div className="report-stat">
                <p className="report-stat-label">Participating Schools</p>
                <p className="report-stat-value">{reportData.stats.totalSchools}</p>
              </div>
              <div className="report-stat">
                <p className="report-stat-label">Total Matches</p>
                <p className="report-stat-value">{reportData.stats.totalMatches}</p>
              </div>
              <div className="report-stat">
                <p className="report-stat-label">Finished Matches</p>
                <p className="report-stat-value">{reportData.stats.finishedMatches}</p>
              </div>
              <div className="report-stat">
                <p className="report-stat-label">Total Goals</p>
                <p className="report-stat-value">{reportData.stats.totalGoals}</p>
              </div>
            </div>

            {/* Top Scorers */}
            {reportData.topScorers.length > 0 && (
              <div className="report-section">
                <h4>Top Scorers</h4>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
                      <th>School</th>
                      <th>Goals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.topScorers.slice(0, 10).map((scorer, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{scorer.player_name || scorer.name}</td>
                        <td>{scorer.school_name || scorer.school}</td>
                        <td>{scorer.goals || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Participating Schools */}
            <div className="report-section">
              <h4>Participating Schools</h4>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>School Name</th>
                    <th>Region</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.participants.map((school, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{school.school_name || school.name}</td>
                      <td>{school.region || '-'}</td>
                      <td>
                        <span className={`status-badge ${school.is_active ? 'status-active' : 'status-inactive'}`}>
                          {school.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;