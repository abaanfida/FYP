import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MatcherPage.css";

const RAG_API_URL = "http://localhost:8000";

// Importance selector component
const ImportanceSelector = ({ label, value, onChange, icon }) => (
  <div className="form-group">
    <label className="form-label">
      <span className="label-icon">{icon}</span>
      {label}
    </label>
    <div className="importance-buttons">
      <button
        type="button"
        className={`importance-btn ${value === "not_important" ? "active" : ""}`}
        onClick={() => onChange("not_important")}
      >
        Doesn't Matter
      </button>
      <button
        type="button"
        className={`importance-btn ${value === "somewhat_important" ? "active" : ""}`}
        onClick={() => onChange("somewhat_important")}
      >
        Somewhat
      </button>
      <button
        type="button"
        className={`importance-btn ${value === "very_important" ? "active" : ""}`}
        onClick={() => onChange("very_important")}
      >
        Very Important
      </button>
    </div>
  </div>
);

// University card component
const UniversityCard = ({ match, isExpanded, onToggle }) => {
  return (
    <div className={`university-card ${isExpanded ? "expanded" : ""}`}>
      <div className="card-header" onClick={onToggle}>
        <div className="card-rank">#{match.rank}</div>
        <div className="card-main-info">
          <h3 className="card-title">{match.name}</h3>
          <div className="card-subtitle">
            {match.location?.city && <span>{match.location.city}</span>}
            {match.location?.region && <span> • {match.location.region}</span>}
            {match.university_ranking?.uk_rank && (
              <span className="uk-rank">UK Rank #{match.university_ranking.uk_rank}</span>
            )}
          </div>
        </div>
        <div className="card-score">
          <span className="score-value">{match.total_score}</span>
          <span className="score-label">Match Score</span>
        </div>
        <div className="card-expand-icon">{isExpanded ? "▼" : "▶"}</div>
      </div>
      
      {isExpanded && (
        <div className="card-details">
          <div className="card-justification">
            <p>{match.justification}</p>
          </div>
          
          <div className="card-sections">
            {/* Programs */}
            {match.matching_programs && match.matching_programs.length > 0 && (
              <div className="card-section">
                <h4>🎓 Matching Programs</h4>
                <ul>
                  {match.matching_programs.map((prog, i) => (
                    <li key={i}>{prog}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Score Breakdown */}
            <div className="card-section">
              <h4>📊 Score Breakdown</h4>
              <div className="score-breakdown">
                {Object.entries(match.score_breakdown || {}).map(([key, value]) => (
                  <div key={key} className="score-item">
                    <span className="score-key">{key.replace("_", " ")}</span>
                    <div className="score-bar-container">
                      <div className="score-bar" style={{ width: `${value}%` }}></div>
                    </div>
                    <span className="score-num">{Math.round(value)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Scholarships */}
            {match.scholarships && match.scholarships.length > 0 && (
              <div className="card-section">
                <h4>💰 Scholarships</h4>
                <ul className="scholarships-list">
                  {match.scholarships.map((sch, i) => (
                    <li key={i}>
                      <strong>{sch.name}</strong>
                      {sch.amount && <span> - {sch.amount}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Research Highlights */}
            {match.research_highlights && match.research_highlights.length > 0 && (
              <div className="card-section">
                <h4>🔬 Research</h4>
                <ul>
                  {match.research_highlights.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Faculty */}
            {match.faculty_highlights && match.faculty_highlights.length > 0 && (
              <div className="card-section">
                <h4>👨‍🏫 Notable Faculty</h4>
                <ul>
                  {match.faculty_highlights.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MatcherPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    field_of_study: "",
    degree_level: "PG",
    interests: "",
    location_preference: "not_important",
    preferred_locations: "",
    fee_preference: "not_important",
    max_fees: "",
    ranking_importance: "somewhat_important",
    scholarship_importance: "somewhat_important",
    research_importance: "somewhat_important",
    faculty_importance: "somewhat_important",
    student_life_importance: "somewhat_important",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const payload = {
        field_of_study: formData.field_of_study,
        degree_level: formData.degree_level,
        interests: formData.interests.split(",").map((s) => s.trim()).filter(Boolean),
        location_preference: formData.location_preference,
        preferred_locations: formData.location_preference === "specific"
          ? formData.preferred_locations.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        fee_preference: formData.fee_preference,
        max_fees: formData.fee_preference !== "not_important" && formData.max_fees
          ? parseInt(formData.max_fees)
          : null,
        ranking_importance: formData.ranking_importance,
        scholarship_importance: formData.scholarship_importance,
        research_importance: formData.research_importance,
        faculty_importance: formData.faculty_importance,
        student_life_importance: formData.student_life_importance,
      };

      const response = await fetch(`${RAG_API_URL}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      setExpandedCard(data.matches?.[0]?.rank || null);
    } catch (err) {
      console.error("Match API Error:", err);
      setError("Failed to find matches. Please check if the API server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="matcher-container">
      {/* Sidebar */}
      <div className="matcher-sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🎓</span>
          <span className="brand-text">UniMatcher</span>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate("/chat")}>
            <span className="nav-icon">💬</span>
            <span>Chat Assistant</span>
          </div>
          <div className="nav-item active">
            <span className="nav-icon">🎯</span>
            <span>Find Matches</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              <span className="user-name">{user.firstName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="matcher-main">
        {/* Header */}
        <div className="matcher-header">
          <div>
            <h1 className="header-title">Find Your Perfect University</h1>
            <p className="header-subtitle">Tell us what matters to you</p>
          </div>
          <div className="header-buttons">
            <button className="home-btn" onClick={() => navigate("/")}>Home</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Content */}
        <div className="matcher-content">
          {!results ? (
            /* Form View */
            <form className="matcher-form" onSubmit={handleSubmit}>
              {/* Required Fields */}
              <div className="form-section">
                <h2 className="section-title">📚 What do you want to study?</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Field of Study *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Computer Science, Finance, Engineering"
                      value={formData.field_of_study}
                      onChange={(e) => handleInputChange("field_of_study", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Degree Level *</label>
                    <div className="degree-buttons">
                      <button
                        type="button"
                        className={`degree-btn ${formData.degree_level === "UG" ? "active" : ""}`}
                        onClick={() => handleInputChange("degree_level", "UG")}
                      >
                        Undergraduate
                      </button>
                      <button
                        type="button"
                        className={`degree-btn ${formData.degree_level === "PG" ? "active" : ""}`}
                        onClick={() => handleInputChange("degree_level", "PG")}
                      >
                        Postgraduate
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Specific Interests</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., AI, Machine Learning, Data Science (comma separated)"
                    value={formData.interests}
                    onChange={(e) => handleInputChange("interests", e.target.value)}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="form-section">
                <h2 className="section-title">📍 Location Preference</h2>
                <div className="preference-selector">
                  <button
                    type="button"
                    className={`pref-btn ${formData.location_preference === "not_important" ? "active" : ""}`}
                    onClick={() => handleInputChange("location_preference", "not_important")}
                  >
                    Doesn't Matter
                  </button>
                  <button
                    type="button"
                    className={`pref-btn ${formData.location_preference === "specific" ? "active" : ""}`}
                    onClick={() => handleInputChange("location_preference", "specific")}
                  >
                    I have preferences
                  </button>
                </div>
                
                {formData.location_preference === "specific" && (
                  <div className="form-group" style={{ marginTop: "16px" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., London, Scotland, Manchester (comma separated)"
                      value={formData.preferred_locations}
                      onChange={(e) => handleInputChange("preferred_locations", e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Fees */}
              <div className="form-section">
                <h2 className="section-title">💷 Budget</h2>
                <div className="preference-selector">
                  <button
                    type="button"
                    className={`pref-btn ${formData.fee_preference === "not_important" ? "active" : ""}`}
                    onClick={() => handleInputChange("fee_preference", "not_important")}
                  >
                    Doesn't Matter
                  </button>
                  <button
                    type="button"
                    className={`pref-btn ${formData.fee_preference === "max_limit" ? "active" : ""}`}
                    onClick={() => handleInputChange("fee_preference", "max_limit")}
                  >
                    Set Maximum
                  </button>
                </div>
                
                {formData.fee_preference !== "not_important" && (
                  <div className="form-group fee-input-group" style={{ marginTop: "16px" }}>
                    <span className="currency-symbol">£</span>
                    <input
                      type="number"
                      className="form-input fee-input"
                      placeholder="Maximum annual fee"
                      value={formData.max_fees}
                      onChange={(e) => handleInputChange("max_fees", e.target.value)}
                    />
                    <span className="fee-suffix">/year</span>
                  </div>
                )}
              </div>

              {/* Importance Factors */}
              <div className="form-section">
                <h2 className="section-title">⚖️ What's Important to You?</h2>
                
                <div className="importance-grid">
                  <ImportanceSelector
                    label="University Ranking"
                    icon="🏆"
                    value={formData.ranking_importance}
                    onChange={(v) => handleInputChange("ranking_importance", v)}
                  />
                  <ImportanceSelector
                    label="Scholarships"
                    icon="💰"
                    value={formData.scholarship_importance}
                    onChange={(v) => handleInputChange("scholarship_importance", v)}
                  />
                  <ImportanceSelector
                    label="Research Facilities"
                    icon="🔬"
                    value={formData.research_importance}
                    onChange={(v) => handleInputChange("research_importance", v)}
                  />
                  <ImportanceSelector
                    label="Faculty Expertise"
                    icon="👨‍🏫"
                    value={formData.faculty_importance}
                    onChange={(v) => handleInputChange("faculty_importance", v)}
                  />
                  <ImportanceSelector
                    label="Student Life"
                    icon="🎉"
                    value={formData.student_life_importance}
                    onChange={(v) => handleInputChange("student_life_importance", v)}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`submit-btn ${isLoading ? "loading" : ""}`}
                disabled={isLoading || !formData.field_of_study}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Finding matches...
                  </>
                ) : (
                  <>
                    <span>🎯</span>
                    Find My Matches
                  </>
                )}
              </button>

              {error && (
                <div className="error-message">
                  <span>⚠️</span>
                  {error}
                </div>
              )}
            </form>
          ) : (
            /* Results View */
            <div className="results-container">
              <div className="results-header">
                <button className="back-btn" onClick={() => setResults(null)}>
                  ← New Search
                </button>
                <div className="results-stats">
                  <span>{results.total_evaluated} universities analyzed</span>
                  <span className="divider">•</span>
                  <span>{results.matches?.length || 0} matches found</span>
                </div>
              </div>

              {results.summary && (
                <div className="results-summary">
                  <h3>📋 Summary</h3>
                  <p>{results.summary}</p>
                </div>
              )}

              <div className="results-list">
                {results.matches?.map((match) => (
                  <UniversityCard
                    key={match.rank}
                    match={match}
                    isExpanded={expandedCard === match.rank}
                    onToggle={() => setExpandedCard(expandedCard === match.rank ? null : match.rank)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatcherPage;
