import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getBallots, 
  createBallot, 
  updateBallot, 
  deleteBallot, 
  activateBallot, 
  pauseBallot, 
  endBallot,
  getBallotResults,
  getPositions,
  getCandidates
} from '../../services/api';
import './BallotManagement.css';

const BallotManagement = () => {
  const [ballots, setBallots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBallot, setEditingBallot] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({
    Ballot_Title: '',
    Ballot_Description: '',
    Ballot_StartDate: '',
    Ballot_EndDate: '',
    Ballot_RequireAllPositions: true,
    Ballot_ShowResults: true,
    Ballot_ShowResultsAfter: '',
    Ballot_ShowLiveResults: true,
    positionIds: [],
    candidateIds: []
  });
  const [loadingForm, setLoadingForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBallots();
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const [positionsData, candidatesData] = await Promise.all([
        getPositions(),
        getCandidates()
      ]);
      setPositions(positionsData);
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  const fetchBallots = async () => {
    try {
      setLoading(true);
      const ballotsData = await getBallots();
      setBallots(ballotsData);
    } catch (error) {
      console.error('Error fetching ballots:', error);
      setError('Failed to load ballots');
    } finally {
      setLoading(false);
    }
  };

  const getBallotStatus = (ballot) => {
    const now = new Date();
    const startDate = new Date(ballot.Ballot_StartDate);
    const endDate = new Date(ballot.Ballot_EndDate);

    if (ballot.Ballot_Status === 'CANCELLED') {
      return { status: 'cancelled', color: 'red', text: 'Cancelled' };
    } else if (ballot.Ballot_Status === 'ENDED') {
      return { status: 'ended', color: 'gray', text: 'Ended' };
    } else if (ballot.Ballot_Status === 'PAUSED') {
      return { status: 'paused', color: 'orange', text: 'Paused' };
    } else if (now < startDate) {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    } else if (now > endDate) {
      return { status: 'ended', color: 'gray', text: 'Ended' };
    } else {
      return { status: 'active', color: 'green', text: 'Active' };
    }
  };

  const filteredBallots = ballots.filter(ballot => {
    const status = getBallotStatus(ballot);
    const matchesSearch = ballot.Ballot_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ballot.Ballot_Description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || status.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreateBallot = () => {
    setEditingBallot(null);
    setFormData({
      Ballot_Title: '',
      Ballot_Description: '',
      Ballot_StartDate: '',
      Ballot_EndDate: '',
      Ballot_RequireAllPositions: true,
      Ballot_ShowResults: true,
      Ballot_ShowResultsAfter: '',
      Ballot_ShowLiveResults: true,
      positionIds: [],
      candidateIds: []
    });
    setShowCreateForm(true);
  };

  const handleEditBallot = (ballot) => {
    setEditingBallot(ballot);
    setFormData({
      Ballot_Title: ballot.Ballot_Title,
      Ballot_Description: ballot.Ballot_Description || '',
      Ballot_StartDate: ballot.Ballot_StartDate.split('T')[0],
      Ballot_EndDate: ballot.Ballot_EndDate.split('T')[0],
      Ballot_RequireAllPositions: ballot.Ballot_RequireAllPositions,
      Ballot_ShowResults: ballot.Ballot_ShowResults,
      Ballot_ShowResultsAfter: ballot.Ballot_ShowResultsAfter ? ballot.Ballot_ShowResultsAfter.split('T')[0] : '',
      Ballot_ShowLiveResults: ballot.Ballot_ShowLiveResults,
      positionIds: ballot.ballotPositions?.map(bp => bp.BallotPosition_PositionId) || [],
      candidateIds: ballot.ballotCandidates?.map(bc => bc.BallotCandidate_CandidateId) || []
    });
    setShowCreateForm(true);
  };

  const handleDeleteBallot = async (ballotId) => {
    if (!window.confirm('Are you sure you want to delete this ballot? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBallot(ballotId);
      setSuccess('Ballot deleted successfully');
      fetchBallots();
    } catch (error) {
      console.error('Error deleting ballot:', error);
      setError('Failed to delete ballot');
    }
  };

  const handleBallotAction = async (ballotId, action) => {
    try {
      switch (action) {
        case 'activate':
          await activateBallot(ballotId);
          setSuccess('Ballot activated successfully');
          break;
        case 'pause':
          await pauseBallot(ballotId);
          setSuccess('Ballot paused successfully');
          break;
        case 'end':
          await endBallot(ballotId);
          setSuccess('Ballot ended successfully');
          break;
        default:
          break;
      }
      fetchBallots();
    } catch (error) {
      console.error(`Error ${action}ing ballot:`, error);
      setError(`Failed to ${action} ballot`);
    }
  };

  if (loading) {
    return (
      <div className="ballot-management-container">
        <div className="loading">Loading ballots...</div>
      </div>
    );
  }

  return (
    <div className="ballot-management-container">
      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Ballot Management</h1>
        <p className="text-gray-600 mt-2">Manage all voting ballots in your system</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Ballots</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{ballots.length}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <i className="fas fa-clipboard-list text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {ballots.filter(b => getBallotStatus(b).status === 'active').length}
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Upcoming</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {ballots.filter(b => getBallotStatus(b).status === 'upcoming').length}
              </h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <i className="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Ended</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {ballots.filter(b => getBallotStatus(b).status === 'ended').length}
              </h3>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <i className="fas fa-times-circle text-red-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input 
              type="text" 
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Search ballots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setFilterStatus('all')}
            >
              All ({ballots.length})
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'active' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setFilterStatus('active')}
            >
              Active ({ballots.filter(b => getBallotStatus(b).status === 'active').length})
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'upcoming' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setFilterStatus('upcoming')}
            >
              Upcoming ({ballots.filter(b => getBallotStatus(b).status === 'upcoming').length})
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'ended' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setFilterStatus('ended')}
            >
              Ended ({ballots.filter(b => getBallotStatus(b).status === 'ended').length})
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'paused' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setFilterStatus('paused')}
            >
              Paused ({ballots.filter(b => getBallotStatus(b).status === 'paused').length})
            </button>
          </div>
        </div>
      </div>

      {/* Create Ballot Button */}
      <div className="mb-6">
        <button 
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={handleCreateBallot}
        >
          <i className="fas fa-plus -ml-1 mr-2"></i>
          New Ballot
        </button>
      </div>

      {/* Ballots Table */}
      {filteredBallots.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ballot Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBallots.map((ballot) => {
                  const status = getBallotStatus(ballot);
                  return (
                    <tr key={ballot.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <i className="fas fa-vote-yea text-blue-600"></i>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{ballot.Ballot_Title}</div>
                            <div className="text-sm text-gray-500">ID: {ballot.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          status.status === 'active' ? 'bg-green-100 text-green-800' :
                          status.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                          status.status === 'ended' ? 'bg-red-100 text-red-800' :
                          status.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(ballot.Ballot_StartDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(ballot.Ballot_EndDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ballot.participantCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => navigate(`/admin/ballot-details/${ballot.id}`)}
                          >
                            View
                          </button>
                          
                          {status.status !== 'ended' && (
                            <button 
                              className="text-green-600 hover:text-green-900"
                              onClick={() => handleEditBallot(ballot)}
                            >
                              Edit
                            </button>
                          )}

                          {status.status === 'upcoming' && (
                            <button 
                              className="text-purple-600 hover:text-purple-900"
                              onClick={() => handleBallotAction(ballot.id, 'activate')}
                            >
                              Activate
                            </button>
                          )}

                          {status.status === 'active' && (
                            <>
                              <button 
                                className="text-orange-600 hover:text-orange-900"
                                onClick={() => handleBallotAction(ballot.id, 'pause')}
                              >
                                Pause
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleBallotAction(ballot.id, 'end')}
                              >
                                End
                              </button>
                            </>
                          )}

                          {status.status === 'paused' && (
                            <button 
                              className="text-green-600 hover:text-green-900"
                              onClick={() => handleBallotAction(ballot.id, 'activate')}
                            >
                              Resume
                            </button>
                          )}

                          {status.status !== 'ended' && (
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteBallot(ballot.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <i className="fas fa-clipboard-list text-gray-300 text-5xl mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900">No ballots found</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first ballot to get started.</p>
          <div className="mt-6">
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleCreateBallot}
            >
              <i className="fas fa-plus -ml-1 mr-2"></i>
              New Ballot
            </button>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default BallotManagement;
