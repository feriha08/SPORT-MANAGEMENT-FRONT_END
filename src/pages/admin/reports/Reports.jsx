import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSchool, FaUserGraduate, FaTrophy, FaCalendarAlt,
  FaFutbol, FaUsers, FaFileAlt, FaDownload, FaPrint,
  FaChartBar, FaEye, FaSpinner, FaCheckCircle,
  FaFilePdf, FaFileExcel, FaFileCsv
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
  const [reportType, setReportType] = useState('competition');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
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
        axiosInstance.get('schools/admin/'),
        axiosInstance.get('students/'),
        axiosInstance.get('competitions/'),
        axiosInstance.get('fixtures/'),
        axiosInstance.get('matches/'),
        axiosInstance.get('accounts/list/')
      ]);

      setStats({
        totalSchools: schoolsRes.data?.results?.length || schoolsRes.data?.length || 0,
        totalStudents: studentsRes.data?.results?.length || studentsRes.data?.length || 0,
        totalCompetitions: competitionsRes.data?.results?.length || competitionsRes.data?.length || 0,
        totalFixtures: fixturesRes.data?.results?.length || fixturesRes.data?.length || 0,
        totalMatches: matchesRes.data?.results?.length || matchesRes.data?.length || 0,
        totalUsers: usersRes.data?.results?.length || usersRes.data?.length || 0
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
    if (reportType === 'competition' && !selectedCompetition) {
      toast.error('Please select a competition');
      return;
    }

    setGenerating(true);
    try {
      let data = {};

      if (reportType === 'competition') {
        const compRes = await axiosInstance.get(`competitions/${selectedCompetition}/`);
        const participantsRes = await axiosInstance.get(`competitions/${selectedCompetition}/participations/`);
        const matchesRes = await axiosInstance.get(`matches/?competition=${selectedCompetition}`);
        const fixturesRes = await axiosInstance.get(`fixtures/?competition=${selectedCompetition}`);
        
        let topScorers = [];
        try {
          const topScorersRes = await axiosInstance.get(`matches/top-scorers/${selectedCompetition}/`);
          topScorers = topScorersRes.data || [];
        } catch (e) {
          console.log('Top scorers endpoint not available');
        }

        const competition = compRes.data;
        const participants = participantsRes.data || [];
        const matches = matchesRes.data || [];
        const fixtures = fixturesRes.data || [];

        const totalMatches = matches.length;
        const finishedMatches = matches.filter(m => m.status === 'Finished' || m.status === 'finished').length;
        const totalGoals = matches.reduce((sum, m) => sum + (parseInt(m.home_score) || 0) + (parseInt(m.away_score) || 0), 0);
        const totalSchools = participants.length;

        data = {
          type: 'competition',
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
        };
      } else {
        data = {
          type: 'system',
          stats: stats,
          generatedAt: new Date().toISOString()
        };
      }

      setReportData(data);
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
    if (!reportData) {
      toast.error('No report to download. Please generate a report first.');
      return;
    }

    toast.info('Opening print dialog to save as PDF...');
    
    // Use window.print with a timeout to ensure content is ready
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleDownloadCSV = async () => {
    if (!reportData) return;
    
    try {
      let csvContent = '';
      
      if (reportData.type === 'competition') {
        const comp = reportData.competition;
        csvContent += `Competition Report\n`;
        csvContent += `Name,${comp.name || 'N/A'}\n`;
        csvContent += `Sport,${comp.sport_name || comp.sport || 'N/A'}\n`;
        csvContent += `Season,${comp.season || 'N/A'}\n`;
        csvContent += `Gender,${comp.gender || 'N/A'}\n`;
        csvContent += `Status,${comp.status || 'N/A'}\n\n`;
        
        csvContent += 'Participating Schools\n';
        csvContent += 'School,Region,Status\n';
        if (reportData.participants && reportData.participants.length > 0) {
          reportData.participants.forEach(p => {
            csvContent += `${p.school_name || p.name || 'N/A'},${p.region || 'N/A'},${p.status || 'Active'}\n`;
          });
        } else {
          csvContent += 'No schools registered\n';
        }
        
        if (reportData.topScorers && reportData.topScorers.length > 0) {
          csvContent += '\nTop Scorers\n';
          csvContent += 'Player,School,Goals\n';
          reportData.topScorers.slice(0, 10).forEach(s => {
            csvContent += `${s.player_name || s.name || 'N/A'},${s.school_name || s.school || 'N/A'},${s.goals || 0}\n`;
          });
        }
      } else {
        csvContent += 'System Report\n';
        csvContent += `Generated,${new Date().toISOString()}\n\n`;
        csvContent += 'Metric,Value\n';
        csvContent += `Total Schools,${reportData.stats.totalSchools}\n`;
        csvContent += `Total Students,${reportData.stats.totalStudents}\n`;
        csvContent += `Total Competitions,${reportData.stats.totalCompetitions}\n`;
        csvContent += `Total Fixtures,${reportData.stats.totalFixtures}\n`;
        csvContent += `Total Matches,${reportData.stats.totalMatches}\n`;
        csvContent += `Total Users,${reportData.stats.totalUsers}\n`;
      }

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportData.type}_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('CSV downloaded successfully!');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast.error('Failed to download CSV');
    }
  };

  const reportCards = [
    {
      title: 'Schools Report',
      icon: <FaSchool />,
      count: stats.totalSchools,
      color: 'blue',
      description: 'All registered schools'
    },
    {
      title: 'Students Report',
      icon: <FaUserGraduate />,
      count: stats.totalStudents,
      color: 'purple',
      description: 'All registered students'
    },
    {
      title: 'Competitions Report',
      icon: <FaTrophy />,
      count: stats.totalCompetitions,
      color: 'yellow',
      description: 'All competitions'
    },
    {
      title: 'Fixtures Report',
      icon: <FaCalendarAlt />,
      count: stats.totalFixtures,
      color: 'blue',
      description: 'All fixtures'
    },
    {
      title: 'Matches Report',
      icon: <FaFutbol />,
      count: stats.totalMatches,
      color: 'red',
      description: 'All matches'
    },
    {
      title: 'Users Report',
      icon: <FaUsers />,
      count: stats.totalUsers,
      color: 'green',
      description: 'All system users'
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

      {/* Report Type Selection */}
      <Card className="report-type-card">
        <h3>Select Report Type</h3>
        <div className="report-type-options">
          <button 
            className={`report-type-btn ${reportType === 'competition' ? 'active' : ''}`}
            onClick={() => setReportType('competition')}
          >
            <FaTrophy /> Competition Report
          </button>
          <button 
            className={`report-type-btn ${reportType === 'system' ? 'active' : ''}`}
            onClick={() => setReportType('system')}
          >
            <FaChartBar /> System Report
          </button>
        </div>
      </Card>

      {/* Generate Competition Report */}
      {reportType === 'competition' && (
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
                    {comp.name} ({comp.sport_name || comp.sport} - {comp.status})
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
      )}

      {/* Generate System Report */}
      {reportType === 'system' && (
        <Card className="generate-report-card">
          <h3>Generate System Report</h3>
          <p className="generate-subtitle">Generate a comprehensive system overview report</p>
          
          <div className="generate-form">
            <div className="form-group">
              <label>Date Range (Optional)</label>
              <div className="date-range">
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  placeholder="Start Date"
                />
                <span>to</span>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  placeholder="End Date"
                />
              </div>
            </div>
            <button 
              className="btn btn-primary generate-btn"
              onClick={generateReport}
              disabled={generating}
            >
              {generating ? (
                <>
                  <FaSpinner className="spinning" /> Generating...
                </>
              ) : (
                <>
                  <FaFileAlt /> Generate System Report
                </>
              )}
            </button>
          </div>
        </Card>
      )}

      {/* Report Cards */}
      <div className="report-cards-section">
        <h3>Quick Reports</h3>
        <div className="report-cards-grid">
          {reportCards.map((card, index) => (
            <div key={index} className={`report-card report-card-${card.color}`}>
              <div className="report-card-icon">{card.icon}</div>
              <div className="report-card-content">
                <p className="report-card-title">{card.title}</p>
                <p className="report-card-count">{card.count}</p>
                <p className="report-card-desc">{card.description}</p>
              </div>
              <button 
                className="report-card-action"
                onClick={() => {
                  toast.info(`${card.title} will be generated`);
                }}
              >
                <FaEye />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Report Preview */}
      {showReport && reportData && (
        <div className="report-preview">
          <div className="report-preview-header">
            <h2>Report Preview</h2>
            <div className="report-preview-actions">
              <button className="btn btn-secondary" onClick={handlePrint}>
                <FaPrint /> Print
              </button>
              <button className="btn btn-primary" onClick={handleDownloadPDF}>
                <FaFilePdf /> Download PDF
              </button>
              <button className="btn btn-success" onClick={handleDownloadCSV}>
                <FaFileCsv /> Download CSV
              </button>
            </div>
          </div>

          <Card className="report-content">
            {/* Competition Report */}
            {reportData.type === 'competition' && (
              <>
                {/* Report Header */}
                <div className="report-header">
                  <h2 className="report-title">{reportData.competition.name || 'Competition Report'}</h2>
                  <p className="report-date">Generated on: {new Date().toLocaleString()}</p>
                  <div className="report-meta">
                    <span className="meta-item">Sport: {reportData.competition.sport_name || reportData.competition.sport || 'N/A'}</span>
                    <span className="meta-item">Season: {reportData.competition.season || 'N/A'}</span>
                    <span className="meta-item">Gender: {reportData.competition.gender || 'N/A'}</span>
                    <span className="meta-item">Status: {reportData.competition.status || 'N/A'}</span>
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
                {reportData.topScorers && reportData.topScorers.length > 0 && (
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
                            <td>{scorer.player_name || scorer.name || 'N/A'}</td>
                            <td>{scorer.school_name || scorer.school || 'N/A'}</td>
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
                  {reportData.participants && reportData.participants.length > 0 ? (
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
                            <td>{school.school_name || school.name || 'N/A'}</td>
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
                  ) : (
                    <p className="no-data">No schools have registered for this competition</p>
                  )}
                </div>
              </>
            )}

            {/* System Report */}
            {reportData.type === 'system' && (
              <>
                <div className="report-header">
                  <h2 className="report-title">System Overview Report</h2>
                  <p className="report-date">Generated on: {new Date().toLocaleString()}</p>
                </div>

                <div className="report-stats-grid system-stats">
                  <div className="report-stat">
                    <p className="report-stat-label">Total Schools</p>
                    <p className="report-stat-value">{reportData.stats.totalSchools}</p>
                  </div>
                  <div className="report-stat">
                    <p className="report-stat-label">Total Students</p>
                    <p className="report-stat-value">{reportData.stats.totalStudents}</p>
                  </div>
                  <div className="report-stat">
                    <p className="report-stat-label">Total Competitions</p>
                    <p className="report-stat-value">{reportData.stats.totalCompetitions}</p>
                  </div>
                  <div className="report-stat">
                    <p className="report-stat-label">Total Fixtures</p>
                    <p className="report-stat-value">{reportData.stats.totalFixtures}</p>
                  </div>
                  <div className="report-stat">
                    <p className="report-stat-label">Total Matches</p>
                    <p className="report-stat-value">{reportData.stats.totalMatches}</p>
                  </div>
                  <div className="report-stat">
                    <p className="report-stat-label">Total Users</p>
                    <p className="report-stat-value">{reportData.stats.totalUsers}</p>
                  </div>
                </div>

                <div className="report-section">
                  <h4>System Health</h4>
                  <div className="health-indicators">
                    <div className="health-item">
                      <FaCheckCircle className="health-icon healthy" />
                      <div>
                        <p className="health-label">System Status</p>
                        <p className="health-value">Operational</p>
                      </div>
                    </div>
                    <div className="health-item">
                      <FaUsers className="health-icon" />
                      <div>
                        <p className="health-label">Active Users</p>
                        <p className="health-value">{reportData.stats.totalUsers}</p>
                      </div>
                    </div>
                    <div className="health-item">
                      <FaSchool className="health-icon" />
                      <div>
                        <p className="health-label">Active Schools</p>
                        <p className="health-value">{reportData.stats.totalSchools}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;