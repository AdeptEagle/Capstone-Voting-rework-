import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { RefreshCw, Users, Trophy, Clock, TrendingUp } from 'lucide-react';
import './BallotResults.css';

const BallotResults = () => {
  const { ballotId } = useParams();
  const navigate = useNavigate();
  const [ballot, setBallot] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchBallot();
    fetchResults();
  }, [ballotId]);

  // Animate progress bars after results are loaded
  useEffect(() => {
    if (results) {
      setAnimateProgress(true);
      setLastUpdated(new Date());
    }
  }, [results]);

  const fetchBallot = async () => {
    try {
      const response = await api.get(`/ballots/${ballotId}`);
      setBallot(response.data);
    } catch (err) {
      console.error('Error fetching ballot:', err);
      setError('Failed to load ballot information');
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ballots/${ballotId}/results`);
      setResults(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const refreshResults = () => {
    setLoading(true);
    setAnimateProgress(false);
    
    setTimeout(() => {
      fetchResults();
      setLoading(false);
      setAnimateProgress(true);
    }, 500);
  };

  const getPositionResults = () => {
    if (!results || !results.results || !results.results.resultDetails || !Array.isArray(results.results.resultDetails)) {
      return [];
    }
    
    // Group result details by position
    const positionGroups = {};
    
    results.results.resultDetails.forEach(detail => {
      const positionId = detail.BallotResultDetails_PositionId;
      if (!positionGroups[positionId]) {
        positionGroups[positionId] = {
          positionId: positionId,
          positionTitle: detail.position?.Position_Title || 'Unknown Position',
          candidates: []
        };
      }
      
      positionGroups[positionId].candidates.push({
        candidateId: detail.BallotResultDetails_CandidateId,
        candidateName: detail.candidate?.Candidate_Name || 'Unknown Candidate',
        voteCount: detail.BallotResultDetails_VoteCount,
        percentage: detail.BallotResultDetails_Percentage,
        rank: detail.BallotResultDetails_Rank
      });
    });
    
    // Convert to array and sort by position display order
    const positionResults = Object.values(positionGroups);
    
    // Sort candidates within each position by vote count (descending) and then by candidate name (ascending)
    positionResults.forEach(position => {
      // Sort candidates by vote count (descending), then by name (ascending) for ties
      position.candidates.sort((a, b) => {
        if (b.voteCount !== a.voteCount) {
          return b.voteCount - a.voteCount;
        }
        return a.candidateName.localeCompare(b.candidateName);
      });
      
      // Assign proper ranks - handle ties correctly
      let currentRank = 1;
      let previousVoteCount = null;
      
      position.candidates.forEach((candidate, index) => {
        if (previousVoteCount !== null && candidate.voteCount !== previousVoteCount) {
          // Only increment rank when vote count changes
          currentRank = index + 1;
        }
        candidate.rank = currentRank;
        previousVoteCount = candidate.voteCount;
      });
    });
    
    positionResults.sort((a, b) => {
      const aOrder = results.ballotPositions?.find(p => p.BallotPosition_PositionId === a.positionId)?.BallotPosition_DisplayOrder || 0;
      const bOrder = results.ballotPositions?.find(p => p.BallotPosition_PositionId === b.positionId)?.BallotPosition_DisplayOrder || 0;
      return aOrder - bOrder;
    });
    
    return positionResults;
  };

  const getCandidateName = (candidateId) => {
    if (!results || !results.results || !results.results.resultDetails || !Array.isArray(results.results.resultDetails)) {
      return 'Unknown Candidate';
    }
    
    const candidateDetail = results.results.resultDetails.find(
      detail => detail.BallotResultDetails_CandidateId === candidateId
    );
    
    return candidateDetail?.candidate?.Candidate_Name || 'Unknown Candidate';
  };

  if (loading && !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-redo mr-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!ballot || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading ballot information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">{ballot.Ballot_Title}</h1>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                Last updated: {lastUpdated.toLocaleString()}
              </div>
            </div>
            <button
              onClick={refreshResults}
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-md'
              }`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Updating...' : 'Refresh Results'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-blue-50 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results?.results?.BallotResults_TotalVotes?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-50 p-3 rounded-full">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Voters</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results?.results?.BallotResults_TotalVoters || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-purple-50 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Voter Turnout</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results?.results?.BallotResults_VoterTurnout?.toFixed(1) || '0.0'}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results by Position */}
        {getPositionResults().map((positionResult) => (
          <div key={positionResult.positionId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">{positionResult.positionTitle}</h2>
              <p className="text-sm text-gray-500 mt-1">Live vote count and percentages</p>
            </div>

            <div className="p-6">
              <div className="space-y-8">
                {positionResult.candidates.map((result, index) => (
                  <CandidateResult
                    key={result.candidateId}
                    candidate={result}
                    rank={index + 1}
                    totalVotes={positionResult.candidates.reduce((sum, c) => sum + c.voteCount, 0)}
                    animateProgress={animateProgress}
                    isLoading={loading}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-8">
          <button 
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={() => navigate('/user/ballot-selection')}
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Ballots
          </button>
        </div>
      </main>
    </div>
  );
};

// Candidate Result Component
function CandidateResult({ candidate, rank, totalVotes, animateProgress, isLoading }) {
  const [displayVotes, setDisplayVotes] = useState(0);
  const [displayPercentage, setDisplayPercentage] = useState(0);

  const colors = [
    { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
    { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600' },
    { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
    { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' },
    { bg: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-600' },
    { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600' }
  ];

  const colorScheme = colors[(rank - 1) % colors.length];

  useEffect(() => {
    if (animateProgress && !isLoading) {
      // Animate vote count
      const voteInterval = setInterval(() => {
        setDisplayVotes(prev => {
          const increment = Math.ceil(candidate.voteCount / 50);
          const next = prev + increment;
          return next >= candidate.voteCount ? candidate.voteCount : next;
        });
      }, 20);

      // Animate percentage
      const percentInterval = setInterval(() => {
        setDisplayPercentage(prev => {
          const increment = candidate.percentage / 50;
          const next = prev + increment;
          return next >= candidate.percentage ? candidate.percentage : next;
        });
      }, 20);

      return () => {
        clearInterval(voteInterval);
        clearInterval(percentInterval);
      };
    } else if (!animateProgress) {
      setDisplayVotes(0);
      setDisplayPercentage(0);
    }
  }, [animateProgress, isLoading, candidate.voteCount, candidate.percentage]);

  return (
    <div className="group">
      {/* Candidate Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full ${colorScheme.light} flex items-center justify-center mr-4`}>
            <span className={`text-sm font-bold ${colorScheme.text}`}>#{rank}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
              {candidate.candidateName}
            </h3>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {displayVotes.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">votes</p>
            </div>
            <div className={`px-3 py-1 rounded-full ${colorScheme.light}`}>
              <p className={`text-lg font-bold ${colorScheme.text}`}>
                {displayPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-full ${colorScheme.bg} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
            style={{ 
              width: animateProgress ? `${candidate.percentage}%` : '0%',
              transitionDelay: `${rank * 100}ms`
            }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div 
          className="absolute top-0 h-4 w-1 bg-white shadow-lg rounded-full transition-all duration-1000 ease-out"
          style={{ 
            left: animateProgress ? `${candidate.percentage}%` : '0%',
            transitionDelay: `${rank * 100}ms`,
            transform: 'translateX(-50%)'
          }}
        ></div>
      </div>
    </div>
  );
}

export default BallotResults;
